import axios from 'axios';
import 'dotenv/config';

console.log('Testing Hugging Face API...');
console.log('API Key exists:', !!process.env.HUGGINGFACE_API_KEY);
console.log('API Key starts with hf_:', process.env.HUGGINGFACE_API_KEY?.startsWith('hf_'));

// Test 1: Basic API connection
async function testBasicConnection() {
  try {
    console.log('\n=== Test 1: Basic API Connection ===');
    const response = await axios.get('https://router.huggingface.co/hf-inference/models/gpt2', {
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Basic connection successful');
    console.log('Response status:', response.status);
    return true;
  } catch (error) {
    console.log('❌ Basic connection failed');
    console.log('Error:', error.response?.status, error.response?.statusText);
    console.log('Error details:', error.response?.data);
    return false;
  }
}

// Test 2: Simple inference request
async function testInference() {
  try {
    console.log('\n=== Test 2: Simple Inference ===');
    const response = await axios.post('https://router.huggingface.co/hf-inference/models/gpt2', {
      inputs: 'Hello world',
      parameters: {
        max_length: 20
      }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        wait_for_model: true
      }
    });
    console.log('✅ Inference successful');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Inference failed');
    console.log('Error:', error.response?.status, error.response?.statusText);
    console.log('Error details:', error.response?.data);
    return false;
  }
}

// Test 3: Alternative endpoint
async function testAlternativeEndpoint() {
  try {
    console.log('\n=== Test 3: Alternative Endpoint ===');
    const response = await axios.post('https://router.huggingface.co/hf-inference/models/distilbert-base-uncased', {
      inputs: 'Hello world'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Alternative endpoint successful');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Alternative endpoint failed');
    console.log('Error:', error.response?.status, error.response?.statusText);
    console.log('Error details:', error.response?.data);
    return false;
  }
}

async function runTests() {
  const test1 = await testBasicConnection();
  const test2 = await testInference();
  const test3 = await testAlternativeEndpoint();
  
  console.log('\n=== Summary ===');
  console.log('Basic connection:', test1 ? '✅' : '❌');
  console.log('Inference:', test2 ? '✅' : '❌');
  console.log('Alternative endpoint:', test3 ? '✅' : '❌');
  
  if (!test1 && !test2 && !test3) {
    console.log('\n🚨 All tests failed. Possible issues:');
    console.log('1. Invalid API token');
    console.log('2. Token lacks proper permissions');
    console.log('3. Hugging Face API is down');
    console.log('4. Network/firewall issues');
  }
}

runTests().catch(console.error);
