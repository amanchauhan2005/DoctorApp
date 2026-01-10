import axios from 'axios';

const sleep = (ms) => new Promise(res => setTimeout(res, ms));
const PORT = Number(process.env.PORT || 4000);
const BASE = `http://localhost:${PORT}`;

async function runEndpointTwice(name, url, payload) {
  try {
    console.log(`\n=== Testing ${name} ===`);
    const t1 = Date.now();
    const r1 = await axios.post(url, payload, { timeout: 180000 });
    const d1 = Date.now() - t1;
    console.log(`[1st] status=${r1.status}, time=${d1}ms`);
    console.log(`[1st] body keys:`, Object.keys(r1.data));

    // small pause to ensure caching path consistency
    await sleep(500);
    const t2 = Date.now();
    const r2 = await axios.post(url, payload, { timeout: 180000 });
    const d2 = Date.now() - t2;
    console.log(`[2nd] status=${r2.status}, time=${d2}ms`);
    console.log(`[2nd] body keys:`, Object.keys(r2.data));

    const faster = d1 > 0 ? Math.round(((d1 - d2) / d1) * 100) : 0;
    console.log(`Caching improvement: ${faster}% (lower is better on 2nd call)`);

    // Print shapes
    const body1 = r1.data;
    const body2 = r2.data;
    if (body1?.data) {
      console.log(`[${name}] response snippet:`, (body1.data.response || '').slice(0, 160));
      console.log(`[${name}] sources count:`, (body1.data.context || []).length);
    } else {
      console.log(`[${name}] answer snippet:`, (body1.answer || '').slice(0, 160));
      console.log(`[${name}] sources count:`, (body1.sources || []).length);
    }

    if ((body1?.success === true) || (typeof body1?.answer === 'string')) {
      console.log(`✅ ${name} appears functional`);
    } else {
      console.log(`❌ ${name} did not return expected success shape`);
    }
  } catch (error) {
    console.error(`❌ Error testing ${name}:`, error.message, 'code=', error.code);
    if (error.response) {
      console.error("status:", error.response.status);
      console.error("headers:", error.response.headers);
      console.error("data:", error.response.data);
    } else if (error.request) {
      console.error("No response received. Request details:", error.request?.path, error.request?.method);
    }
  }
}
async function main() {
  // Test /api/ai/chat (controller: aiController)
  await runEndpointTwice(
    'AI Chat',
    `${BASE}/api/ai/chat`,
    { message: 'What are the symptoms of typhoid?' }
  );

  // Test /api/chat/chatWithAI (controller: chatController)
  await runEndpointTwice(
    'Legacy Chat',
    `${BASE}/api/chat/chatWithAI`,
    { query: 'What are the symptoms of typhoid?' }
  );
}

main();
