# Simple RAG Pipeline Setup Guide

## Overview
This is a **simple RAG pipeline** that runs **entirely locally** without any external API calls.

## Why Local Embeddings?

### ❌ Previous Approach (Hugging Face Inference API)
- Required internet connection
- API rate limits
- Network latency
- API errors and timeouts
- Complex error handling
- API costs (free tier limits)

### ✅ Current Approach (Local Embeddings with @xenova/transformers)
- **No internet required** (after initial model download)
- **No rate limits** - process unlimited embeddings
- **Fast** - no network latency, runs locally
- **Reliable** - no API errors or timeouts
- **Simple** - straightforward implementation
- **Private** - all data stays on your machine
- **Free** - no API costs

## Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

This will install `@xenova/transformers` which runs transformer models locally in Node.js.

### 2. First Run (Model Download)
On first run, the embedding model will be downloaded automatically:
- Model: `Xenova/all-MiniLM-L6-v2`
- Size: ~90MB (compressed)
- Location: `node_modules/@xenova/transformers/.cache/`
- Time: ~2-3 minutes (first time only)
- Subsequent runs: Instant (uses cached model)

## Architecture

### Components
1. **Chunking Service**: Splits medical book into chunks
2. **Embedding Service**: Generates embeddings locally using `@xenova/transformers`
3. **Vector Store Service**: Stores chunks + embeddings in MongoDB
4. **RAG Pipeline Service**: Retrieves relevant chunks and augments prompts

### Flow
```
Medical Book → Chunking → Local Embeddings → MongoDB Storage
                                                      ↓
User Query → Local Embedding → Vector Search → Retrieve Chunks → Augment AI Prompt
```

## Usage

### 1. Process Medical Book
```bash
node scripts/processMedicalBook.js
```

This will:
- Chunk the medical book
- Generate embeddings locally (no API calls)
- Store chunks + embeddings in MongoDB

### 2. Chat with RAG
```bash
POST http://localhost:4000/api/ai/chat
{
  "message": "I have fever and vomiting",
  "type": "symptoms"
}
```

The system will:
1. Generate embedding locally for the query
2. Search similar chunks in MongoDB
3. Retrieve top K relevant chunks
4. Augment AI prompt with retrieved knowledge
5. Generate response

## How It Works

### 1. Embedding Generation (Local)
```javascript
// Runs locally, no API calls
const embedding = await embeddingService.generateEmbedding("I have a headache");
// Returns: [0.123, -0.456, 0.789, ...] (384-dimensional vector)
```

### 2. Similarity Search
```javascript
// Calculate cosine similarity between query and stored chunks
const similarity = embeddingService.cosineSimilarity(queryEmbedding, chunkEmbedding);
```

### 3. Retrieval
```javascript
// Get top K most similar chunks
const similarChunks = await vectorStoreService.searchSimilarChunks(queryEmbedding, topK);
```

## Performance

- **Embedding Generation**: ~50-100ms per text (local)
- **Similarity Search**: ~10-50ms per query (depends on chunk count)
- **Memory Usage**: ~200-300MB
- **No Network**: Zero network latency
- **No API Calls**: Completely local

## Model Information

- **Model**: `Xenova/all-MiniLM-L6-v2`
- **Dimensions**: 384
- **Size**: ~90MB (compressed)
- **Type**: Feature extraction (embeddings)
- **Provider**: @xenova/transformers (local)
- **API Required**: No

## Troubleshooting

### Issue: Model Download Slow
**Solution**: First download takes 2-3 minutes. Subsequent runs are instant.

### Issue: Memory Usage High
**Solution**: This is normal (~200-300MB). The model is loaded in memory for fast access.

### Issue: Embedding Generation Fails
**Solution**: 
1. Check if model is downloaded
2. Check available memory
3. Restart server

### Issue: No Chunks Retrieved
**Solution**:
1. Verify medical book is processed
2. Check MongoDB connection
3. Verify chunks are stored in database

## Advantages

1. **Simple**: No API authentication or rate limits
2. **Fast**: No network latency
3. **Reliable**: No external dependencies
4. **Private**: All data stays local
5. **Cost-effective**: No API costs
6. **Scalable**: Process unlimited embeddings

## Summary

This is a **simple, local RAG pipeline** that:
- ✅ Runs entirely locally (no API calls)
- ✅ Uses local embeddings (`@xenova/transformers`)
- ✅ Stores chunks + embeddings in MongoDB
- ✅ Retrieves relevant chunks using cosine similarity
- ✅ Augments AI prompts with retrieved knowledge

**No external APIs, no rate limits, no costs - just simple, local RAG!**


