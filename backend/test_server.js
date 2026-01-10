import axios from 'axios';

const testServer = async () => {
  console.log("🔍 Testing server connection...");
  
  try {
    // Test if server is running
    const response = await axios.get('http://localhost:4000/', { timeout: 5000 });
    console.log("✅ Server is running!");
    console.log("Response:", response.data);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log("❌ Server is NOT running on port 4000");
      console.log("Please start the server with: npm start");
    } else if (error.code === 'ETIMEDOUT') {
      console.log("❌ Server connection timed out");
    } else {
      console.log("❌ Error:", error.message);
    }
    return;
  }

  // Test chat API
  console.log("\n🔍 Testing Chat API...");
  try {
    const response = await axios.post('http://localhost:4000/api/chat', {
      query: "What are the symptoms of flu?"
    }, { timeout: 30000 });
    
    console.log("✅ Chat API Response:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log("❌ Chat API Error:");
    console.log("Message:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
  }
};

testServer();
