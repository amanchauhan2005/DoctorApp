import { Pinecone } from '@pinecone-database/pinecone';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { HuggingFaceEmbeddings } from '../utils/embeddings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPinecone() {
    try {
        console.log("Testing Pinecone Connection...");
        const pineconeApiKey = process.env.PINECONE_API_KEY;
        const pineconeIndexName = process.env.PINECONE_INDEX_NAME || 'medicalbook'; // Default from screenshot

        if (!pineconeApiKey) {
            console.error("PINECONE_API_KEY not found in env");
            return;
        }

        const pinecone = new Pinecone({ apiKey: pineconeApiKey });
        
        // List indexes
        console.log("Listing indexes...");
        const indexes = await pinecone.listIndexes();
        console.log("Indexes:", indexes);

        // Describe index
        console.log(`Describing index: ${pineconeIndexName}`);
        const indexModel = await pinecone.describeIndex(pineconeIndexName);
        console.log("Index Details:", JSON.stringify(indexModel, null, 2));

        const index = pinecone.Index(pineconeIndexName);

        // Get stats (namespaces)
        const stats = await index.describeIndexStats();
        console.log("Index Stats:", JSON.stringify(stats, null, 2));

        // Test Embedding Generation
        console.log("\nTesting Local Embedding Generation...");
        const embeddings = new HuggingFaceEmbeddings();
        const query = "What is typhoid?";
        const vector = await embeddings.embedQuery(query);
        console.log(`Generated vector length: ${vector.length}`);

        // Test Query
        console.log("\nQuerying Pinecone with local vector...");
        // Try with and without namespace 'medical-book'
        const namespaces = Object.keys(stats.namespaces || {});
        
        for (const ns of namespaces) {
            console.log(`Querying namespace: ${ns}`);
            const queryResponse = await index.namespace(ns).query({
                vector: vector,
                topK: 3,
                includeMetadata: true
            });
            console.log(`Matches in ${ns}:`, queryResponse.matches.length);
            if(queryResponse.matches.length > 0) {
                console.log("Top match score:", queryResponse.matches[0].score);
                console.log("Top match metadata:", queryResponse.matches[0].metadata);
            }
        }

        if (namespaces.length === 0) {
            console.log("No namespaces found in stats. Querying default namespace...");
             const queryResponse = await index.query({
                vector: vector,
                topK: 3,
                includeMetadata: true
            });
            console.log(`Matches in default:`, queryResponse.matches.length);
             if(queryResponse.matches.length > 0) {
                console.log("Top match score:", queryResponse.matches[0].score);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

testPinecone();
