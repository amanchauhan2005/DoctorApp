import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const run = async () => {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const indexName = process.env.PINECONE_INDEX_NAME;
    const index = pinecone.Index(indexName);

    console.log(`Checking index: ${indexName}`);
    
    const stats = await index.describeIndexStats();
    console.log('Index Stats:', JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error('Error checking Pinecone:', error);
  }
};

run();
