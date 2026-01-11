# RAG Pipeline Setup Guide

## Overview
This guide explains how to set up and use the RAG (Retrieval-Augmented Generation) pipeline for the medical chatbot.

## Architecture

### Components
1. **Chunking Service**: Splits medical book into smaller chunks
2. **Embedding Service**: Generates vector embeddings using Hugging Face
3. **Vector Store Service**: Stores and retrieves embeddings from MongoDB
4. **RAG Pipeline Service**: Main service that orchestrates the RAG pipeline
5. **AI Service**: Uses RAG-retrieved knowledge to enhance responses

## Setup Steps

### 1. Install Dependencies
All required dependencies are already in `package.json`. No additional installation needed.

### 2. Configure Environment Variables
Ensure your `.env` file has:
```bash
HUGGINGFACE_API_KEY=your_huggingface_api_key
MONGODB_URL=your_mongodb_connection_string
```

### 3. Process Medical Book

#### Option 1: Using the Script (Recommended)
```bash
cd backend
node scripts/processMedicalBook.js
```

This will:
- Connect to MongoDB
- Process the sample medical book
- Create chunks
- Generate embeddings
- Store chunks in vector database

#### Option 2: Using API Endpoint
```bash
POST http://localhost:4000/api/ai/rag/process-book
Content-Type: application/json

{
  "bookContent": "Your medical book content here...",
  "metadata": {
    "source": "medical-book",
    "chapter": "common-conditions"
  }
}
```

### 4. Verify Setup
Check if chunks are stored:
```bash
GET http://localhost:4000/api/ai/rag/statistics
```

Response:
```json
{
  "success": true,
  "data": {
    "totalChunks": 50,
    "status": "ready"
  }
}
```

## Usage

### Chat with RAG-Enhanced Responses
```bash
POST http://localhost:4000/api/ai/chat
Content-Type: application/json

{
  "message": "I have fever, vomiting, and stomach pain",
  "type": "symptoms"
}
```

The system will:
1. Generate embedding for the query
2. Search similar chunks in vector database
3. Retrieve top K relevant chunks
4. Augment the AI prompt with retrieved knowledge
5. Generate response using enhanced prompt

### Response Format
```json
{
  "success": true,
  "data": {
    "response": "Based on your symptoms...",
    "model": "rag-vector-search",
    "ragContext": {
      "chunksRetrieved": 3,
      "topSimilarity": 0.85,
      "source": "medical-book"
    }
  }
}
```

## Adding Your Medical Book

### Method 1: Replace Sample Content
Edit `backend/scripts/processMedicalBook.js` and replace `sampleMedicalBook` with your medical book content.

### Method 2: Load from File
1. Create `backend/data/medical-book.txt`
2. Add your medical book content
3. Uncomment the file loading code in `processMedicalBook.js`

### Method 3: Use API
Send your medical book content via the API endpoint.

## Chunking Strategy

### Current Settings
- **Chunk Size**: 500 characters
- **Chunk Overlap**: 50 characters
- **Method**: Sentence-based chunking

### Customize Chunking
Edit `backend/services/chunkingService.js`:
```javascript
const chunkingService = new ChunkingService({
  chunkSize: 500,      // Adjust chunk size
  chunkOverlap: 50,    // Adjust overlap
  separators: ['\n\n', '\n', '. ', ' ', ''] // Adjust separators
});
```

## Embedding Model

### Current Model
- **Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Dimensions**: 384
- **Speed**: Fast
- **Quality**: Good balance

### Alternative Models
Edit `backend/services/embeddingService.js`:
```javascript
this.model = 'sentence-transformers/all-mpnet-base-v2'; // Better quality, slower
// or
this.model = 'sentence-transformers/all-MiniLM-L12-v2'; // Better quality, slightly slower
```

## Vector Search

### Similarity Threshold
Default: 0.5 (50% similarity)
- Lower threshold: More results, less relevant
- Higher threshold: Fewer results, more relevant

### Top K Results
Default: 5 chunks
- More chunks: More context, longer prompts
- Fewer chunks: Less context, faster processing

### Customize Search
Edit `backend/services/ragPipelineService.js`:
```javascript
this.topK = 5;                    // Number of chunks to retrieve
this.similarityThreshold = 0.5;   // Minimum similarity score
```

## MongoDB Vector Search (Optional)

For better performance with large datasets, consider using MongoDB Atlas Vector Search:

1. Create a vector search index in MongoDB Atlas
2. Update `vectorStoreService.js` to use Atlas Vector Search
3. This provides faster and more scalable vector search

## Troubleshooting

### Issue: Embeddings Generation Fails
**Solution**: Check Hugging Face API key and rate limits

### Issue: No Chunks Retrieved
**Solution**: 
1. Verify chunks are stored in database
2. Check similarity threshold (may be too high)
3. Verify embedding generation is working

### Issue: Slow Response Times
**Solution**:
1. Reduce chunk size
2. Reduce top K results
3. Use faster embedding model
4. Implement caching

### Issue: Poor Quality Responses
**Solution**:
1. Increase chunk size
2. Adjust similarity threshold
3. Use better embedding model
4. Improve medical book content

## Performance Optimization

### Caching
- Embeddings are cached to avoid regenerating
- Query embeddings are cached for similar queries

### Batch Processing
- Process multiple chunks in batches
- Reduce API calls to Hugging Face

### Database Indexing
- Index embeddings for faster search
- Index metadata for keyword search

## Next Steps

1. **Process Your Medical Book**: Add your medical book content
2. **Test RAG Pipeline**: Test with various queries
3. **Optimize Settings**: Adjust chunking and search parameters
4. **Monitor Performance**: Track response times and quality
5. **Scale Up**: Consider MongoDB Atlas Vector Search for production

## API Endpoints

### Process Medical Book
```
POST /api/ai/rag/process-book
Body: { bookContent: string, metadata?: object }
```

### Get Statistics
```
GET /api/ai/rag/statistics
```

### Chat (Uses RAG)
```
POST /api/ai/chat
Body: { message: string, type?: string }
```

## Example: Complete Workflow

1. **Process Medical Book**:
   ```bash
   node scripts/processMedicalBook.js
   ```

2. **Verify Setup**:
   ```bash
   curl http://localhost:4000/api/ai/rag/statistics
   ```

3. **Test Chat**:
   ```bash
   curl -X POST http://localhost:4000/api/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "I have fever and vomiting", "type": "symptoms"}'
   ```

4. **Check Response**:
   - Response should include RAG context
   - Should reference medical book knowledge
   - Should be more accurate and relevant

## Support

For issues or questions:
1. Check console logs for errors
2. Verify MongoDB connection
3. Check Hugging Face API key
4. Review this guide for common issues

