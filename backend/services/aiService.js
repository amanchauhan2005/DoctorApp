import axios from 'axios';
import fallbackAI from './fallbackAIService.js';
import ragPipelineService from './ragPipelineService.js';

class AIService {
  constructor() {
    // Hugging Face Inference API (New endpoint - January 2025)
    this.huggingFaceApi = axios.create({
      baseURL: 'https://router.huggingface.co/hf-inference',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    // Alternative models to try if one fails
    this.models = [
      'gpt2',
      'distilgpt2', 
      'microsoft/DialoGPT-small',
      'facebook/blenderbot-400M-distill'
    ];
    
    // Simple rate limiting
    this.requestCounts = new Map();
  }

  // Simple rate limiting
 /* checkRateLimit(userId = 'anonymous') {
    const now = Date.now();
    const key = `user-${userId}`;
    
    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
      return true;
    }
    
    const userLimit = this.requestCounts.get(key);
    
    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + 60000;
      return true;
    }
    
    if (userLimit.count >= 10) { // 10 requests per minute
      return false;
    }
    
    userLimit.count++;
    return true;
  }*/

  // Simple AI chat for all purposes
  async chatWithAI(message, type = 'general') {
    /*if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }*/

    // Use RAG Pipeline to retrieve and augment with medical knowledge
    console.log('Retrieving relevant medical knowledge from vector database...');
    const { prompt, retrievedChunks, context } = await ragPipelineService.retrieveAndAugment(message, type);
    
    console.log(`RAG Pipeline retrieved ${retrievedChunks.length} relevant chunks`);
    
    // If we have high-quality retrieved chunks, we can optionally use them directly
    // For now, we'll use them to augment the AI prompt
    console.log('Retrieved Chunks:', retrievedChunks);
    const topChunks = retrievedChunks.filter(chunk => (chunk.similarity || 0) > 0.8 && chunk.matchType !== 'keyword');
    console.log(topChunks);
    
    // If we have very high similarity chunks (>0.8), consider using them directly
    if (topChunks.length > 0 && type === 'symptoms') {
      console.log(`High-confidence match found (similarity: ${topChunks[0].similarity})`);
      const topChunk = topChunks[0];
      return {
        response: `${topChunk.content}\n\n⚠️ IMPORTANT: This is preliminary analysis based on medical knowledge. Please consult a healthcare professional immediately for proper diagnosis and treatment.`,
        timestamp: new Date().toISOString(),
        type: type,
        model: 'rag-vector-search',
        ragContext: {
          chunksRetrieved: retrievedChunks.length,
          topSimilarity: topChunk.similarity,
          source: topChunk.metadata?.source || 'medical-book',
          confidence: 'high'
        }
      };
    }

    const body = {
      inputs: prompt,
      parameters: {
        max_length: 500, // Increased for better medical responses
        temperature: 0.5, // Lower temperature for more accurate medical responses
        top_p: 0.9,
        repetition_penalty: 1.2
      }
    };

    // Try multiple models if one fails
    let lastError;
    for (const model of this.models) {
      try {
        console.log(`Trying model: ${model}`);
        const response = await this.huggingFaceApi.post(
          `/models/${model}`,
          body,
          { 
            params: { wait_for_model: true }
          }
        );

        const parsed = this.parseHFResponse(response.data);
        if (!parsed) {
          throw new Error('AI returned empty response');
        }
        
        console.log(`Success with model: ${model}`);
        let aiResponse = this.cleanResponse(parsed);
        
        // Post-process: If AI response is too generic and we have high-quality chunks, enhance it
        if (retrievedChunks.length > 0 && (aiResponse.length < 100 || !this.isResponseSpecific(aiResponse, retrievedChunks))) {
          console.log('Enhancing generic AI response with RAG knowledge');
          const topChunk = retrievedChunks[0];
          aiResponse = `${topChunk.content}\n\n${aiResponse}\n\n⚠️ IMPORTANT: Please consult a healthcare professional immediately for proper diagnosis and treatment.`;
        }
        
        return {
          response: aiResponse,
          timestamp: new Date().toISOString(),
          type: type,
          model: model,
          ragContext: retrievedChunks.length > 0 ? {
            chunksRetrieved: retrievedChunks.length,
            topSimilarity: retrievedChunks[0]?.similarity || 0,
            source: retrievedChunks[0]?.metadata?.source || 'medical-book'
          } : null
        };
      } catch (error) {
        lastError = error;
        const status = error?.response?.status;
        const errMsg = error?.response?.data?.error || error.message || 'Unknown error';
        console.log(`Model ${model} failed: ${status} - ${errMsg}`);
        
        // If it's a 404, try next model
        if (status === 404) {
          continue;
        }
        
        // If it's a transient error, wait and try again
        const isTransient = status === 503 || /loading|busy|Rate limit/i.test(errMsg);
        if (isTransient) {
          await this.sleep(2000);
          continue;
        }
        
        // For other errors, try next model
        continue;
      }
    }

    // If all models fail, use RAG knowledge directly to generate response
    console.log('All Hugging Face models failed, using RAG Pipeline knowledge directly');
    
    // Retrieve relevant chunks
    const relevantChunks = await ragPipelineService.retrieveRelevantChunks(message, 3);
    
    // Generate response directly from RAG knowledge
    let response = '';
    if (relevantChunks.length > 0) {
      // Use the highest similarity chunk
      const topChunk = relevantChunks[0];
      response = topChunk.content;
      response += `\n\n⚠️ IMPORTANT: This is preliminary analysis based on medical knowledge. Please consult a healthcare professional immediately for proper diagnosis and treatment.`;
    } else {
      // No relevant knowledge found, use generic fallback
      response = `I understand you're experiencing some health concerns. While I can provide general health information, it's important to consult with a healthcare professional for proper diagnosis and treatment.\n\nPlease describe your symptoms in more detail, or book an appointment with a doctor for a proper medical evaluation.`;
    }
    
    return {
      response: response,
      timestamp: new Date().toISOString(),
      type: type,
      model: 'rag-vector-search',
      ragContext: relevantChunks.length > 0 ? {
        chunksRetrieved: relevantChunks.length,
        topSimilarity: relevantChunks[0]?.similarity || 0,
        source: relevantChunks[0]?.metadata?.source || 'medical-book'
      } : null
    };
  }

  // Parse varied HF response shapes
  parseHFResponse(data) {
    if (!data) return '';
    if (Array.isArray(data)) {
      const first = data[0];
      if (first && typeof first === 'object' && typeof first.generated_text === 'string') {
        return first.generated_text;
      }
    }
    if (typeof data === 'object' && typeof data.generated_text === 'string') {
      return data.generated_text;
    }
    if (typeof data === 'string') return data;
    return '';
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check if response is specific enough (not too generic)
  isResponseSpecific(response, chunks) {
    const responseLower = response.toLowerCase();
    // Check if response is detailed enough
    if (response.length < 100) {
      return false;
    }
    // Check if response is too generic
    const genericPhrases = ['i understand', 'i can help', 'general information', 'consult a doctor'];
    const isGeneric = genericPhrases.some(phrase => responseLower.includes(phrase));
    return !isGeneric && response.length > 150;
  }

  // Clean AI response
  cleanResponse(response) {
    // Remove the prompt from the response
    const lines = response.split('\n');
    const cleanLine = lines.find(line => 
      line.trim() && 
      !line.includes('You are') && 
      !line.includes('Analyze these') &&
      !line.includes('Help with:')
    );
    
    return cleanLine ? cleanLine.trim() : response.trim();
  }

  // Health check for AI service
  async healthCheck() {
    for (const model of this.models) {
      try {
        console.log(`Health check trying model: ${model}`);
        const response = await this.huggingFaceApi.post(`/models/${model}`, {
          inputs: 'Hello',
          parameters: { max_length: 10 }
        }, {
          params: { wait_for_model: true }
        });
        
        return {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          provider: 'Hugging Face',
          model: model
        };
      } catch (error) {
        console.log(`Health check failed for ${model}: ${error.message}`);
        if (error?.response?.status === 404) {
          continue; // Try next model
        }
        // For other errors, also try next model
        continue;
      }
    }
    
    // If all models fail, check fallback
    console.log('All Hugging Face models failed health check, testing fallback');
    try {
      const fallbackHealth = await fallbackAI.healthCheck();
      return {
        ...fallbackHealth,
        fallback: true,
        error: 'Hugging Face unavailable, using fallback service'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'All AI services failed'
      };
    }
  }
}

export default new AIService();
