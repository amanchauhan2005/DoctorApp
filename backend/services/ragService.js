// ragService.js - RAG pipeline implementation
import { Pinecone } from '@pinecone-database/pinecone';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { PineconeEmbeddings } from "@langchain/pinecone";
import { HuggingFaceEmbeddings } from "../utils/embeddings.js";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { pipeline } from '@xenova/transformers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

let vectorStore = null;
let model = null;
let summarizer = null;
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Initialize RAG (Pinecone + Gemini Model)
 */
const initializeRAG = async () => {
  console.log("initilaizing rag");
  if (vectorStore && model) return { vectorStore, model };

  // Validate keys
  const googleApiKey = process.env.GOOGLE_API_KEY?.trim();
  if (!googleApiKey) {
    throw new Error("CRITICAL ERROR: GOOGLE_API_KEY is undefined.");
  }

  const pineconeApiKey = process.env.PINECONE_API_KEY?.trim();
  const pineconeIndexName = process.env.PINECONE_INDEX_NAME?.trim();
  if (!pineconeApiKey || !pineconeIndexName) {
    throw new Error("CRITICAL ERROR: Missing Pinecone environment variables.");
  }

  console.log("✅ Google API Key loaded.");

  // Init Pinecone
  const pinecone = new Pinecone({ apiKey: pineconeApiKey });
  const pineconeIndex = pinecone.Index(pineconeIndexName);

  // Use Pinecone Embeddings to match the index model (llama-text-embed-v2)
  // This ensures the query vector is in the same space as the indexed vectors.
  //const embeddings = new PineconeEmbeddings({
   // model: "multilingual-e5-large", // default or specifically 'llama-text-embed-v2' if supported. 
    // Wait, let's try to assume the library handles it or use the string found in dashboard.
    // However, PineconeEmbeddings from langchain might default to 'multilingual-e5-large'.
    // If the user used 'llama-text-embed-v2', we should specify it.
    //model: "llama-text-embed-v2", 
   // pinecone: pinecone,
 // });
  const embeddings = new HuggingFaceEmbeddings();

  // Pinecone VectorStore
  vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: "medicalbook", // change if needed based on your index content
  });

  // Gemini model
  model = new ChatGoogleGenerativeAI({
    apiKey: googleApiKey,
    model: "gemini-2.0-flash", // Use flash for speed, or pro. User mentioned gemini api.
    apiVersion: "v1",
    temperature: 0.3, 
  });

  return { vectorStore, model };
};

const getSummarizer = async () => {
  if (!summarizer) {
    summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-12-6');
  }
  return summarizer;
};

const makeCacheKey = (query, docs) => {
  const ids = docs.map(d => d.metadata?.id || d.id || (d.pageContent || '').slice(0, 64)).join('|');
  return `${query.toLowerCase().trim()}::${ids}`;
};

/**
 * Query using RAG
 */
export const queryMedicalBook = async (query) => {
  try {
    const { vectorStore, model } = await initializeRAG();
    console.log("Query received:", query);

    // FIX ⭐⭐⭐ Use retriever.invoke() (new LangChain API)
    const retriever = vectorStore.asRetriever({ k: 4 });
    const docs = await retriever.invoke(query);

    console.log("Retrieved", docs.length, "documents");

    if (docs.length === 0) {
        return {
            answer: "I couldn't find any relevant medical information in the provided context.",
            sources: []
        };
    }

    const context = docs.map((doc) => doc.pageContent).join("\n\n");

    const key = makeCacheKey(query, docs);
    const existing = cache.get(key);
    if (existing && existing.expiresAt > Date.now()) {
      return existing.value;
    }

    const prompt = PromptTemplate.fromTemplate(`
Role: You are a factual Medical AI assistant. 

Instructions:
1. First, read the [Context] provided below carefully.
2. Answer the [Question] using ONLY information that is explicitly stated or strongly implied in the [Context].
3. If the [Context] contains the answer:
   - Provide a clear explanation.
   - You may use your general medical knowledge to define terms used in the context, but do NOT add new symptoms or treatments not mentioned in the book.
   -Make the language that can be easily understand by a 12-year-old as well to the knowledgable as well.
4. If the [Context] does not contain the answer:
   - State clearly: "I cannot find this specific information in the medical records."
   - Do NOT attempt to guess or use outside knowledge to invent a medical diagnosis.

[Context]:
{context}

[Question]: 
{question}

Factual Answer:`);

    const chain = RunnableSequence.from([
      {
        context: () => context,
        question: (input) => input.question,
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    let answer;
    try {
      answer = await chain.invoke({ question: query });
    } catch (err) {
      const s = await getSummarizer();
      const out = await s(context, { max_length: 256, min_length: 64 });
      const text = Array.isArray(out) ? out[0]?.summary_text || '' : out.summary_text || '';
      answer = text || "Unable to generate an answer due to AI quota. Provided a brief summary of the context.";
    }

    const result = {
      answer,
      sources: docs.map((doc) => doc.metadata),
    };
    cache.set(key, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  } catch (error) {
    console.error("Error querying medical book:", error);
    throw error;
  }
};

export const testGemini = async () => {
  try {
    const googleApiKey = process.env.GOOGLE_API_KEY?.trim();
    if (!googleApiKey) {
      throw new Error("GOOGLE_API_KEY is undefined.");
    }
    const model = new ChatGoogleGenerativeAI({
      apiKey: googleApiKey,
      model: "gemini-2.0-flash",
      apiVersion: "v1",
      temperature: 0,
    });
    const prompt = PromptTemplate.fromTemplate(`Reply exactly with PONG`);
    const chain = RunnableSequence.from([prompt, model, new StringOutputParser()]);
    const text = await chain.invoke({});
    return text.trim() === 'PONG';
  } catch (error) {
    throw error;
  }
};
