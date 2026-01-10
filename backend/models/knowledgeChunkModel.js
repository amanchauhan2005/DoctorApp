import mongoose from 'mongoose';

const knowledgeChunkSchema = new mongoose.Schema({
  chunkId: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number], // Vector embedding array
    required: true
  },
  metadata: {
    source: {
      type: String,
      default: 'medical-book'
    },
    chapter: String,
    section: String,
    page: Number,
    topic: String,
    keywords: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  // For similarity search
  textLength: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for vector search (MongoDB Atlas Vector Search)
knowledgeChunkSchema.index({ embedding: '2dsphere' });

// Index for text search
knowledgeChunkSchema.index({ 'metadata.keywords': 1 });
knowledgeChunkSchema.index({ 'metadata.topic': 1 });

const KnowledgeChunk = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);

export default KnowledgeChunk;

