# Free API Keys Setup Guide

## Google Gemini API (100% FREE)

### Get Your Free API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### Free Tier Limits:
- **60 requests per minute**
- **1,500 requests per day**
- **Completely FREE** - No credit card required!

### Add to `.env`:
```
GOOGLE_API_KEY=your_api_key_here
```

---

## Pinecone Vector Database (FREE Tier)

### Get Your Free Account:
1. Go to [Pinecone](https://www.pinecone.io/)
2. Sign up for a free account
3. Create a new index:
   - **Name**: `medical-chatbot`
   - **Dimensions**: `768` (for Google's embedding-001 model)
   - **Metric**: `cosine`
   - **Pod Type**: Starter (Free)

### Get API Key:
1. Go to "API Keys" in the dashboard
2. Copy your API key
3. Copy your environment name

### Add to `.env`:
```
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=medical-chatbot
```

---

## Summary

**Total Cost**: $0.00 (Completely FREE!)

Both services offer generous free tiers that are perfect for development and small-scale production use.
