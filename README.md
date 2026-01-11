# Doctor Appointment App – AI Chatbot + RAG

## Overview
A full-stack doctor appointment platform with an AI assistant powered by Retrieval-Augmented Generation (RAG). It retrieves medical context from a PDF knowledge base (Pinecone vector DB) and summarizes with Gemini or a local Xenova fallback, ensuring reliability even under API quota limits.

## Features
- Patient/Doctor authentication and scheduling
- AI Chat Assistant with RAG over medical book
- Symptom analysis and schedule optimization endpoints
- Health check endpoint to monitor AI availability
- In-memory caching for repeated RAG answers
- Local summarization fallback using Xenova when Gemini is unavailable

## Architecture
- Backend: Express.js (Node), MongoDB (Mongoose), Cloudinary, Helmet/CORS
- AI/RAG:
  - Pinecone: vector store for retrieved chunks
  - Embeddings: Xenova all-MiniLM-L6-v2 (consistent across ingestion and query)
  - Summarization:
    - Primary: Gemini 2.0 Flash via LangChain
    - Fallback: Xenova distilbart-cnn summarizer
- Frontend: Admin and docbook UI components for chat and symptom checker

## Why These Technologies
- Express.js: Minimal, fast, and familiar web API framework
- MongoDB/Mongoose: Flexible data modeling for appointments and users
- Pinecone: Managed vector DB for scalable, low-latency semantic retrieval
- Xenova transformers: Pure-JS, local embeddings/summarization (no server-side Python) to avoid external bottlenecks and provide a fallback when quotas hit
- Gemini via LangChain: High-quality summarization with simple chain composition; LangChain’s runnable sequences make prompts and model orchestration clean
- Helmet/CORS: Security and cross-origin control out-of-the-box

## RAG Pipeline
1. Ingest PDF into Pinecone using Xenova embeddings (all-MiniLM-L6-v2)
2. Retrieve top-k relevant chunks with Pinecone
3. Build a context block and compose a prompt
4. Summarize:
   - Try Gemini (gemini-2.0-flash, v1 API) for high-quality answers
   - If Gemini errors (e.g., quota exceeded), use Xenova distilbart-cnn locally
5. Cache result for 10 minutes keyed by query + retrieved context to reduce repeated work

## API Endpoints
- POST /api/ai/chat
  - Body: { message: string } or { query: string }
  - Returns: { success, data: { response, context } }
- POST /api/chat/chatWithAI
  - Body: { message | query }
  - Returns: { success, answer, sources }
- GET /api/ai/health
  - Returns: { success, data: { provider: 'gemini', model, status } }
- POST /api/ai/symptoms/analyze
  - Body: { symptoms, age, gender }
- POST /api/ai/schedule/optimize
  - Body: { doctorId, dateRange, existingAppointments }

## Environment Setup
Create backend/.env using env.template as a guide:
