import { pipeline } from '@xenova/transformers';
import { Embeddings } from "@langchain/core/embeddings";

export class HuggingFaceEmbeddings extends Embeddings {
  constructor() {
    super({});
    this.model = null;
    this.modelName = "Xenova/all-MiniLM-L6-v2";
  }

  async initialize() {
    if (!this.model) {
      this.model = await pipeline('feature-extraction', this.modelName);
    }
  }

  async embedDocuments(texts) {
    await this.initialize();
    const embeddings = [];
    
    for (const text of texts) {
      const output = await this.model(text, { pooling: 'mean', normalize: true });
      embeddings.push(Array.from(output.data));
    }
    
    return embeddings;
  }

  async embedQuery(text) {
    await this.initialize();
    const output = await this.model(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }
}
