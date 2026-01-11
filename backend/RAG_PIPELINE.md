# RAG (Retrieval-Augmented Generation) Pipeline Documentation

## Overview
The RAG pipeline enhances the chatbot's responses by retrieving relevant medical knowledge from a structured knowledge base before generating AI responses.

## Architecture

### Components

1. **RAG Service** (`services/ragService.js`)
   - Medical knowledge base with structured information
   - Keyword-based similarity matching
   - Context generation from retrieved knowledge

2. **AI Service Integration** (`services/aiService.js`)
   - Enhanced prompts with RAG context
   - Fallback support with RAG knowledge
   - Response metadata including RAG context

3. **Knowledge Base**
   - Structured medical information
   - Categories: symptoms, appointment, general
   - Keyword indexing for fast retrieval

## How It Works

### 1. Query Processing
When a user sends a message:
```
User: "I have a headache"
```

### 2. Knowledge Retrieval
The RAG service:
- Calculates similarity scores for each knowledge item
- Retrieves top 3 most relevant items
- Generates context from retrieved knowledge

### 3. Enhanced Prompt Generation
The AI service creates an enhanced prompt:
```
Medical Knowledge Context:
[SYMPTOMS] Headaches can have various causes:
- Tension headaches: Often caused by stress...
- Migraines: Severe headaches with symptoms...
...

User question: I have a headache
```

### 4. AI Response Generation
The AI model generates a response using:
- The enhanced prompt with medical context
- Retrieved knowledge for accuracy
- User's original question

## Knowledge Base Structure

Each knowledge item contains:
- `id`: Unique identifier
- `category`: symptoms, appointment, general
- `keywords`: Array of relevant keywords
- `content`: Detailed medical information
- `severity`: mild, moderate, severe, info

## Adding New Knowledge

To add new medical knowledge, edit `backend/services/ragService.js`:

```javascript
{
  id: 'new-item-001',
  category: 'symptoms',
  keywords: ['keyword1', 'keyword2'],
  content: 'Detailed medical information...',
  severity: 'moderate'
}
```

## Benefits

1. **Accuracy**: Responses based on verified medical knowledge
2. **Relevance**: Only relevant information is retrieved
3. **Consistency**: Same knowledge base for all queries
4. **Extensibility**: Easy to add new knowledge items

## Testing

Test the RAG pipeline:
```bash
POST http://localhost:4000/api/ai/chat
{
  "message": "I have a headache",
  "type": "general"
}
```

Response includes:
- `response`: AI-generated response
- `ragContext`: Metadata about retrieved knowledge
  - `knowledgeItems`: Number of items retrieved
  - `categories`: Categories of retrieved knowledge

## Future Enhancements

1. Vector embeddings for semantic search
2. MongoDB storage for knowledge base
3. User feedback loop for knowledge improvement
4. Multi-language support
5. Real-time knowledge updates

