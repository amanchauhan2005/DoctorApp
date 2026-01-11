// Fallback AI Service - Simple rule-based responses when HF API fails
class FallbackAIService {
  constructor() {
    this.responses = {
      greeting: [
        "Hello! I'm your medical assistant. How can I help you today?",
        "Hi there! I'm here to help with your health questions.",
        "Welcome! I'm your AI medical assistant. What can I do for you?"
      ],
      headache: [
        "Headaches can have many causes. Common ones include stress, dehydration, lack of sleep, or tension. Try drinking water, resting in a dark room, or gentle neck stretches. If headaches persist or are severe, please consult a healthcare professional.",
        "For headaches, consider: staying hydrated, getting adequate sleep, managing stress, and avoiding triggers like bright lights or loud noises. If symptoms worsen, seek medical attention.",
        "Headaches are common and often manageable with rest, hydration, and over-the-counter pain relief. However, if you experience sudden severe headaches, vision changes, or neck stiffness, please see a doctor immediately."
      ],
      fever: [
        "Fever is your body's natural response to infection. Rest, stay hydrated, and monitor your temperature. If fever is above 101.3°F (38.5°C) or persists for more than 3 days, consult a healthcare provider.",
        "For fever: rest, drink plenty of fluids, use cool compresses, and take fever-reducing medication if appropriate. Seek medical attention if fever is very high or accompanied by other concerning symptoms.",
        "Fever management includes rest, hydration, and monitoring. Contact a doctor if fever is high, persistent, or accompanied by severe symptoms like difficulty breathing or confusion."
      ],
      general: [
        "I understand you're not feeling well. While I can provide general health information, it's important to consult with a healthcare professional for proper diagnosis and treatment.",
        "Your health is important. For any medical concerns, I recommend speaking with a qualified healthcare provider who can assess your specific situation.",
        "I'm here to help with general health questions, but remember that I cannot replace professional medical advice. Please consult a healthcare provider for proper medical care."
      ]
    };
  }

  // Simple keyword-based response generation
  generateResponse(message, type = 'general') {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific symptoms
    if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
      return this.getRandomResponse('headache');
    }
    
    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      return this.getRandomResponse('fever');
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return this.getRandomResponse('greeting');
    }
    
    // Default response
    return this.getRandomResponse('general');
  }

  getRandomResponse(category) {
    const responses = this.responses[category] || this.responses.general;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Main chat function
  async chatWithAI(message, type = 'general') {
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = this.generateResponse(message, type);
      
      return {
        response: response,
        timestamp: new Date().toISOString(),
        type: type,
        model: 'fallback-rule-based'
      };
    } catch (error) {
      throw new Error('Fallback AI service failed: ' + error.message);
    }
  }

  // Health check
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      provider: 'Fallback Rule-Based',
      model: 'local-fallback'
    };
  }
}

export default new FallbackAIService();

