import dotenv from 'dotenv';
dotenv.config();

console.log('=== Environment Variables Check ===');
console.log('GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);
console.log('GOOGLE_API_KEY value:', process.env.GOOGLE_API_KEY);
console.log('GOOGLE_API_KEY length:', process.env.GOOGLE_API_KEY?.length);
console.log('GOOGLE_API_KEY type:', typeof process.env.GOOGLE_API_KEY);
console.log('===================================');
