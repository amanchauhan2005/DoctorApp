import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/huggingface_transformers'

class EmbeddingService {
  constructor() {
    this.modelName = 'Xenova/all-MiniLM-L6-v2'
    this.embeddings = null
    this.initializing = false
    this.embeddingCache = new Map()
  }

  async initialize() {
    if (this.embeddings) return this.embeddings
    if (this.initializing) {
      while (this.initializing) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return this.embeddings
    }
    try {
      this.initializing = true
      console.log('Initializing embedding model (LangChain local)...')
      this.embeddings = new HuggingFaceTransformersEmbeddings({ modelName: this.modelName })
      console.log('✅ Embedding model initialized successfully (LangChain local)')
      this.initializing = false
      return this.embeddings
    } catch (error) {
      this.initializing = false
      throw error
    }
  }

  async generateEmbedding(text) {
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for embedding')
    }
    const cacheKey = text.trim().toLowerCase()
    if (this.embeddingCache.has(cacheKey)) return this.embeddingCache.get(cacheKey)
    await this.initialize()
    const embedding = await this.embeddings.embedQuery(text.trim())
    this.embeddingCache.set(cacheKey, embedding)
    return embedding
  }

  async generateEmbeddings(texts) {
    await this.initialize()
    const results = await this.embeddings.embedDocuments(texts.map(t => t.trim()))
    return results
  }

  // Calculate cosine similarity between two embeddings
  cosineSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2) {
      return 0;
    }

    if (embedding1.length !== embedding2.length) {
      console.warn(`Embedding dimensions mismatch: ${embedding1.length} vs ${embedding2.length}`);
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    if (denominator === 0) {
      return 0;
    }

    return dotProduct / denominator;
  }

  // Clear cache
  clearCache() {
    this.embeddingCache.clear();
  }

  // Get model info
  getModelInfo() {
    return {
      model: this.modelName,
      type: 'local',
      provider: '@langchain/community',
      apiRequired: false
    };
  }
}

export default new EmbeddingService();
