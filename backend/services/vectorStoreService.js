import KnowledgeChunk from '../models/knowledgeChunkModel.js';
import embeddingService from './embeddingService.js';
import { Pinecone } from '@pinecone-database/pinecone'

// Vector Store Service for storing and retrieving embeddings
class VectorStoreService {
  constructor() {
    this.collectionName = 'knowledgechunks';
    this.pinecone = null
    this.pineconeIndex = null
    this.pineconeNamespace = process.env.PINECONE_NAMESPACE || 'default'
    this.pineconeIndexName = process.env.PINECONE_INDEX_NAME || 'medical-knowledge'
    this.pineconeEnabled = !!process.env.PINECONE_API_KEY
    this.pineconeCloud = process.env.PINECONE_CLOUD || 'aws'
    this.pineconeRegion = process.env.PINECONE_REGION || 'us-east-1'
  }

  async initPinecone() {
    if (!this.pineconeEnabled) return false
    if (this.pinecone && this.pineconeIndex) return true
    try {
      this.pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
      await this.ensureIndexExists()
      this.pineconeIndex = this.pinecone.index(this.pineconeIndexName)
      return true
    } catch (e) {
      console.warn('Pinecone init failed, falling back to Mongo:', e.message)
      this.pineconeEnabled = false
      return false
    }
  }

  async ensureIndexExists() {
    try {
      await this.pinecone.describeIndex(this.pineconeIndexName)
      return true
    } catch (e) {
      const msg = e?.message || ''
      const notFound = /404|NotFound/i.test(msg)
      if (!notFound) throw e
      await this.pinecone.createIndex({
        name: this.pineconeIndexName,
        dimension: 384,
        metric: 'cosine',
        spec: { serverless: { cloud: this.pineconeCloud, region: this.pineconeRegion } },
      })
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 5000))
        try {
          const d = await this.pinecone.describeIndex(this.pineconeIndexName)
          if (d?.status?.ready) break
        } catch {}
      }
      return true
    }
  }

  // Store chunk with embedding
  async storeChunk(chunk, embedding) {
    try {
      // Upsert to Pinecone if enabled
      if (await this.initPinecone()) {
        try {
          await this.pineconeIndex.namespace(this.pineconeNamespace).upsert([
            {
              id: chunk.chunkId,
              values: embedding,
              metadata: {
                content: chunk.content,
                ...chunk.metadata,
                textLength: chunk.content.length,
              },
            },
          ])
        } catch (pcErr) {
          console.warn('Pinecone upsert failed:', pcErr.message)
        }
      }

      const knowledgeChunk = new KnowledgeChunk({
        chunkId: chunk.chunkId,
        content: chunk.content,
        embedding: embedding,
        metadata: {
          ...chunk.metadata,
          source: chunk.metadata.source || 'medical-book'
        },
        textLength: chunk.content.length
      });

      await knowledgeChunk.save();
      return knowledgeChunk;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key, update instead
        return await KnowledgeChunk.findOneAndUpdate(
          { chunkId: chunk.chunkId },
          {
            content: chunk.content,
            embedding: embedding,
            metadata: chunk.metadata,
            textLength: chunk.content.length
          },
          { new: true }
        );
      }
      throw error;
    }
  }

  // Store multiple chunks
  async storeChunks(chunks, embeddings) {
    const storedChunks = [];
    // Batch upsert to Pinecone if enabled
    if (await this.initPinecone()) {
      try {
        const vectors = []
        for (let i = 0; i < chunks.length; i++) {
          if (!embeddings[i]) continue
          vectors.push({
            id: chunks[i].chunkId,
            values: embeddings[i],
            metadata: {
              content: chunks[i].content,
              ...chunks[i].metadata,
              textLength: chunks[i].content.length,
            },
          })
        }
        if (vectors.length) {
          await this.pineconeIndex.namespace(this.pineconeNamespace).upsert(vectors)
        }
      } catch (pcErr) {
        console.warn('Pinecone batch upsert failed:', pcErr.message)
      }
    }
    for (let i = 0; i < chunks.length; i++) {
      if (embeddings[i]) {
        try {
          const stored = await this.storeChunk(chunks[i], embeddings[i]);
          storedChunks.push(stored);
        } catch (error) {
          console.error(`Failed to store chunk ${chunks[i].chunkId}:`, error.message);
        }
      }
    }
    return storedChunks;
  }

  // Search similar chunks using cosine similarity
  async searchSimilarChunks(queryEmbedding, topK = 5, threshold = 0.5) {
    try {
      if (await this.initPinecone()) {
        const res = await this.pineconeIndex
          .namespace(this.pineconeNamespace)
          .query({ topK, vector: queryEmbedding, includeMetadata: true })
        const matches = (res.matches || []).filter(m => (m.score || 0) >= threshold)
        return matches.map(m => ({
          chunkId: m.id,
          content: m.metadata?.content || '',
          metadata: m.metadata || {},
          similarity: m.score || 0,
          matchType: 'semantic',
        }))
      }

      // Fallback: Mongo + local cosine
      const allChunks = await KnowledgeChunk.find({})
      const scoredChunks = allChunks
        .map(chunk => {
          try {
            const similarity = embeddingService.cosineSimilarity(queryEmbedding, chunk.embedding)
            return { ...chunk.toObject(), similarity, matchType: 'semantic' }
          } catch {
            return null
          }
        })
        .filter(chunk => chunk !== null && chunk.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK)
      return scoredChunks
    } catch (error) {
      console.error('Vector search failed:', error);
      return [];
    }
  }

  // Search by keywords (fallback)
  async searchByKeywords(keywords, topK = 5) {
    try {
      const chunks = await KnowledgeChunk.find({
        $or: [
          { 'metadata.keywords': { $in: keywords } },
          { 'metadata.topic': { $in: keywords } },
          { content: { $regex: keywords.join('|'), $options: 'i' } }
        ]
      }).limit(topK);

      return chunks.map(chunk => ({
        ...chunk.toObject(),
        similarity: 0.4,
        matchType: 'keyword'
      }));
    } catch (error) {
      console.error('Keyword search failed:', error);
      return [];
    }
  }

  // Hybrid search (semantic + keyword)
  async hybridSearch(queryEmbedding, keywords, topK = 5) {
    try {
      // If no embedding provided, use keyword search only
      if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
        console.log('No valid embedding provided, using keyword search only');
        return await this.searchByKeywords(keywords, topK);
      }

      // Get semantic results
      let semanticResults = [];
      try {
        semanticResults = await this.searchSimilarChunks(queryEmbedding, topK * 2, 0.3);
      } catch (semanticError) {
        console.warn('Semantic search failed, using keyword search only:', semanticError.message);
        semanticResults = [];
      }
      
      // Get keyword results
      const keywordResults = await this.searchByKeywords(keywords, topK * 2);
      
      // If no semantic results, return keyword results
      if (semanticResults.length === 0) {
        return keywordResults.slice(0, topK);
      }
      
      // Combine and deduplicate
      const combinedResults = [...semanticResults, ...keywordResults];
      const uniqueResults = new Map();
      
      for (const result of combinedResults) {
        if (!uniqueResults.has(result.chunkId)) {
          uniqueResults.set(result.chunkId, result);
        } else {
          // Update similarity if higher
          const existing = uniqueResults.get(result.chunkId);
          if ((result.similarity || 0) > (existing.similarity || 0)) {
            uniqueResults.set(result.chunkId, result);
          }
        }
      }
      
      // Sort by similarity and prefer semantic over keyword when equal
      return Array.from(uniqueResults.values())
        .sort((a, b) => {
          const diff = (b.similarity || 0) - (a.similarity || 0)
          if (diff !== 0) return diff
          if ((b.matchType === 'semantic') && (a.matchType !== 'semantic')) return 1
          if ((a.matchType === 'semantic') && (b.matchType !== 'semantic')) return -1
          return 0
        })
        .slice(0, topK);
    } catch (error) {
      console.error('Hybrid search failed:', error);
      // Fallback to keyword search
      try {
        return await this.searchByKeywords(keywords, topK);
      } catch (fallbackError) {
        console.error('Keyword search fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  // Get chunk count
  async getChunkCount() {
    try {
      return await KnowledgeChunk.countDocuments();
    } catch (error) {
      console.error('Failed to get chunk count:', error);
      return 0;
    }
  }

  // Clear all chunks
  async clearAllChunks() {
    try {
      await KnowledgeChunk.deleteMany({});
      return true;
    } catch (error) {
      console.error('Failed to clear chunks:', error);
      return false;
    }
  }

  // Get chunk by ID
  async getChunkById(chunkId) {
    try {
      return await KnowledgeChunk.findOne({ chunkId });
    } catch (error) {
      console.error('Failed to get chunk:', error);
      return null;
    }
  }
}

export default new VectorStoreService();
