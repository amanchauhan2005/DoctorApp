// AI Configuration
export const aiConfig = {
  // OpenAI Configuration
  openai: {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
    timeout: parseInt(process.env.OPENAI_TIMEOUT) || 30000,
    maxRetries: parseInt(process.env.OPENAI_MAX_RETRIES) || 3
  },

  // Rate Limiting Configuration
  rateLimits: {
    symptomCheck: {
      requests: parseInt(process.env.AI_SYMPTOM_RATE_LIMIT) || 10,
      window: parseInt(process.env.AI_SYMPTOM_WINDOW) || 60000 // 1 minute
    },
    chat: {
      requests: parseInt(process.env.AI_CHAT_RATE_LIMIT) || 20,
      window: parseInt(process.env.AI_CHAT_WINDOW) || 60000 // 1 minute
    },
    scheduling: {
      requests: parseInt(process.env.AI_SCHEDULING_RATE_LIMIT) || 5,
      window: parseInt(process.env.AI_SCHEDULING_WINDOW) || 60000 // 1 minute
    }
  },

  // AI Features Configuration
  features: {
    symptomChecker: process.env.AI_SYMPTOM_CHECKER_ENABLED === 'true',
    doctorMatching: process.env.AI_DOCTOR_MATCHING_ENABLED === 'true',
    chatAssistant: process.env.AI_CHAT_ASSISTANT_ENABLED === 'true',
    scheduleOptimization: process.env.AI_SCHEDULE_OPTIMIZATION_ENABLED === 'true',
    reminderGeneration: process.env.AI_REMINDER_GENERATION_ENABLED === 'true'
  },

  // Security Configuration
  security: {
    maxInputLength: parseInt(process.env.AI_MAX_INPUT_LENGTH) || 1000,
    allowedOrigins: process.env.AI_ALLOWED_ORIGINS?.split(',') || ['*'],
    enableLogging: process.env.AI_ENABLE_LOGGING === 'true'
  },

  // Fallback Configuration
  fallback: {
    enabled: process.env.AI_FALLBACK_ENABLED === 'true',
    message: process.env.AI_FALLBACK_MESSAGE || 'AI service is temporarily unavailable. Please try again later.'
  }
};

// Validation function for AI configuration
export const validateAIConfig = () => {
  const requiredEnvVars = ['OPENAI_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
};

// Get AI service status
export const getAIStatus = () => {
  return {
    configured: validateAIConfig(),
    features: aiConfig.features,
    rateLimits: aiConfig.rateLimits,
    model: aiConfig.openai.model
  };
};

