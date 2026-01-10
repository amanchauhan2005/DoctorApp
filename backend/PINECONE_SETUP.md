# Pinecone Index Setup for Google Gemini Embeddings

## Create New Index (768 dimensions)

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Click "Create Index"
3. **Settings:**
   - **Name**: `medical-chatbot-768` (or any name you prefer)
   - **Dimensions**: `768` (IMPORTANT!)
   - **Metric**: `cosine`
   - **Pod Type**: `Starter` (Free tier)

4. Update your `.env` file:
```
PINECONE_INDEX_NAME=medical-chatbot-768
```

## OR Delete Old Index and Create New One

If you want to reuse the name `medical-chatbot`:
1. Delete your existing index (384 dimensions)
2. Create new index with 768 dimensions
3. Keep the same name in `.env`
