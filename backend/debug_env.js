import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
const envPath = path.join(__dirname, '.env');
console.log('Loading .env from:', envPath);

dotenv.config({ path: envPath });

console.log('\n=== Environment Check ===');
console.log('GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);
console.log('GOOGLE_API_KEY value:', process.env.GOOGLE_API_KEY);
console.log('GOOGLE_API_KEY length:', process.env.GOOGLE_API_KEY?.length);
console.log('GOOGLE_API_KEY (trimmed):', process.env.GOOGLE_API_KEY?.trim());
console.log('========================\n');
