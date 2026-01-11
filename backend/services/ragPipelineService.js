import chunkingService from './chunkingService.js';
import embeddingService from './embeddingService.js';
import vectorStoreService from './vectorStoreService.js';

// Main RAG Pipeline Service
class RAGPipelineService {
  constructor() {
    this.chunkSize = 500;
    this.topK = 5; // Number of chunks to retrieve
    this.similarityThreshold = 0.5; // Minimum similarity score
  }

  // Process medical book and store in vector database
  async processMedicalBook(bookContent, metadata = {}) {
    try {
      console.log('Starting medical book processing...');
      
      // Step 1: Chunk the text
      console.log('Chunking medical book content...');
      const chunks = await chunkingService.processMedicalBook(bookContent, {
        ...metadata,
        source: 'medical-book'
      });
      console.log(`Created ${chunks.length} chunks`);

      // Step 2: Generate embeddings for chunks
      console.log('Generating embeddings...');
      const texts = chunks.map(chunk => chunk.content);
      const embeddings = await embeddingService.generateEmbeddings(texts);
      console.log(`Generated ${embeddings.filter(e => e !== null).length} embeddings`);

      // Step 3: Store chunks with embeddings
      console.log('Storing chunks in vector database...');
      const storedChunks = await vectorStoreService.storeChunks(chunks, embeddings);
      console.log(`Stored ${storedChunks.length} chunks`);

      return {
        success: true,
        chunksCreated: chunks.length,
        chunksStored: storedChunks.length,
        message: 'Medical book processed successfully'
      };
    } catch (error) {
      console.error('Medical book processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Retrieve relevant chunks for a query
  async retrieveRelevantChunks(query, topK = null) {
    try {
      const k = topK || this.topK;
      
      // Step 1: Generate embedding for query (runs locally, no API calls)
      console.log('Generating query embedding (local)...');
      const queryEmbedding = await embeddingService.generateEmbedding(query);
      console.log(`Embedding generated successfully (dimensions: ${queryEmbedding.length})`);
      
      // Step 2: Extract keywords from query (for hybrid search)
      const keywords = this.extractKeywords(query);
      console.log(`Extracted keywords: ${keywords.join(', ')}`);
      
      // Step 3: Search similar chunks using hybrid search (semantic + keyword)
      console.log('Searching similar chunks...');
      const similarChunks = await vectorStoreService.hybridSearch(
        queryEmbedding,
        keywords,
        k
      );
      
      console.log(`Retrieved ${similarChunks.length} relevant chunks`);
      
      // If no chunks found, try broader keyword search as fallback
      if (similarChunks.length === 0) {
        console.log('No chunks found, trying broader keyword search...');
        const broaderKeywords = this.extractBroaderKeywords(query);
        return await vectorStoreService.searchByKeywords(broaderKeywords, k);
      }
      
      return similarChunks;
    } catch (error) {
      console.error('Retrieval failed:', error);
      // Fallback: try keyword search only
      try {
        const keywords = this.extractKeywords(query);
        return await vectorStoreService.searchByKeywords(keywords, this.topK);
      } catch (fallbackError) {
        console.error('Keyword search fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  // Extract broader keywords (including partial matches)
  extractBroaderKeywords(query) {
    const queryLower = query.toLowerCase()
    const tokens = queryLower.match(/\b[a-z]+\b/g) || []
    const commonWords = ['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','being','do','does','did','will','would','should','could','may','might','can','this','that','these','those','what','which','who','whom','where','when','why','how','i','you','we','they','he','she']

    const keywords = tokens.filter(w => w.length > 2 && !commonWords.includes(w))

    const synonyms = {
      teeth: ['tooth','toothache','dental','oral'],
      tooth: ['toothache','dental','oral'],
      toothache: ['dental','oral','tooth pain'],
      testes: ['testicles','testicular','scrotal','scrotum','groin'],
      testicles: ['testicular','scrotal','scrotum','groin'],
      stomach: ['abdominal','abdomen'],
      fever: ['pyrexia'],
    }

    const expanded = new Set(keywords)
    for (const w of keywords) {
      const syns = synonyms[w]
      if (syns) syns.forEach(s => expanded.add(s))
    }

    return Array.from(expanded)
  }

  // Extract keywords from query
  extractKeywords(query) {
    const queryLower = query.toLowerCase()
    const tokens = queryLower.match(/\b[a-z]+\b/g) || []
    const commonWords = ['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','being','do','does','did','will','would','should','could','may','might','can','this','that','these','those','what','which','who','whom','where','when','why','how','i','you','we','they','he','she']
    return tokens.filter(w => w.length > 2 && !commonWords.includes(w))
  }

  // Generate context from retrieved chunks
  generateContext(retrievedChunks) {
    if (retrievedChunks.length === 0) {
      return 'General medical information: Always consult healthcare professionals for proper diagnosis and treatment.';
    }

    // Sort by similarity (highest first)
    const sortedChunks = retrievedChunks.sort((a, b) => 
      (b.similarity || 0) - (a.similarity || 0)
    );

    // Generate context from top chunks
    let context = 'RELEVANT MEDICAL KNOWLEDGE:\n\n';
    
    sortedChunks.forEach((chunk, index) => {
      context += `[Source: ${chunk.metadata?.source || 'medical-book'}] `;
      if (chunk.metadata?.topic) {
        context += `Topic: ${chunk.metadata.topic}\n`;
      }
      context += `${chunk.content}\n\n`;
    });

    return context.trim();
  }

  // Main RAG retrieval and augmentation
  async retrieveAndAugment(query, type = 'general') {
    try {
      // Retrieve relevant chunks
      const relevantChunks = await this.retrieveRelevantChunks(query, this.topK);
      
      // Generate context
      const context = this.generateContext(relevantChunks);
      
      // Build enhanced prompt
      let prompt = '';
      
      if (type === 'symptoms') {
        prompt = `You are a medical assistant helping to analyze symptoms. Based on the following medical knowledge retrieved from a medical book, provide a helpful analysis.

${context}

PATIENT SYMPTOMS: ${query}

INSTRUCTIONS:
1. Review the medical knowledge context above carefully
2. Identify the most likely condition(s) based on the symptoms and medical knowledge
3. Provide:
   - Most likely condition(s) (be specific)
   - Urgency level (HIGH, MODERATE, LOW)
   - Recommended specialists or next steps
   - Important warnings if applicable
4. Always recommend consulting healthcare professionals for proper diagnosis
5. Be concise, accurate, and reference the medical knowledge when relevant
6. Use the medical knowledge context to provide accurate information

Response:`;
      } else {
        prompt = `You are a helpful medical assistant for a doctor appointment platform. Use the following medical knowledge retrieved from a medical book to answer the user's question.

${context}

USER QUESTION: ${query}

INSTRUCTIONS:
1. Analyze the user's question
2. Review the medical knowledge context above
3. Provide accurate, helpful responses based on the medical knowledge
4. Always recommend consulting healthcare professionals for proper diagnosis
5. Be specific and reference the medical knowledge when relevant
6. Include urgency level and recommended actions when applicable

Response:`;
      }
      
      return {
        prompt: prompt,
        retrievedChunks: relevantChunks,
        context: context
      };
    } catch (error) {
      console.error('RAG retrieval and augmentation failed:', error);
      // Return basic prompt if RAG fails
      return {
        prompt: `You are a medical assistant. Help with: ${query}. Always recommend consulting healthcare professionals.`,
        retrievedChunks: [],
        context: ''
      };
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      const chunkCount = await vectorStoreService.getChunkCount();
      return {
        totalChunks: chunkCount,
        status: chunkCount > 0 ? 'ready' : 'not_initialized'
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      return {
        totalChunks: 0,
        status: 'error'
      };
    }
  }

  // Clear all data
  async clearAllData() {
    try {
      await vectorStoreService.clearAllChunks();
      embeddingService.clearCache();
      return true;
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }
}

export default new RAGPipelineService();
