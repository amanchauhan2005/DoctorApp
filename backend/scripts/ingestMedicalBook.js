import { Pinecone } from '@pinecone-database/pinecone';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { HuggingFaceEmbeddings } from "../utils/embeddings.js";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
    console.log("Starting ingestion process...");

    // 1. Load PDF
    const pdfPath = path.join(__dirname, '../src/Medical_book.pdf');
    console.log(`Loading PDF from: ${pdfPath}`);
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} pages from PDF.`);

    // 2. Split Text
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`Split into ${splitDocs.length} chunks.`);

    // 3. Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    // 4. Initialize Embeddings (Xenova Transformers - 384 dimensions, runs locally!)
    console.log("Initializing local embeddings model (all-MiniLM-L6-v2 - 384 dimensions)...");
    const embeddings = new HuggingFaceEmbeddings();

    // 5. Store in Pinecone
    console.log("Storing embeddings in Pinecone... this might take a while.");
    await PineconeStore.fromDocuments(splitDocs, embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
      namespace: "medicalbook",
    });

    console.log("✅ Ingestion complete!");
  } catch (error) {
    console.error("Error during ingestion:", error);
    process.exit(1);
  }
};

run();
