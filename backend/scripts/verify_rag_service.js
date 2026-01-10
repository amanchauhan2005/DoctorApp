import { queryMedicalBook } from '../services/ragService.js';
import 'dotenv/config';

console.log("Starting RAG verification...");

async function test() {
    try {
        const query = "What are the symptoms of Typhoid?";
        console.log(`Querying: "${query}"`);
        
        const result = await queryMedicalBook(query);
        
        console.log("\n=== RAG Result ===");
        console.log("Answer:", result.answer);
        console.log("Sources:", JSON.stringify(result.sources, null, 2));
        
    } catch (error) {
        console.error("Verification failed:", error);
    }
}

test();
