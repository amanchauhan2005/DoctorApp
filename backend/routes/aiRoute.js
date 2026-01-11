import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  chatWithAI,
  analyzeSymptoms,
  optimizeSchedule,
  healthCheck,
  processMedicalBook,
  getRAGStatistics
} from '../controllers/aiController.js';

const router = express.Router();

// Simple rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: {
    success: false,
    message: 'Too many AI requests, please try again later'
  }
});

// Apply rate limiting to all AI routes
router.use(aiRateLimit);

// AI Routes

// General AI Chat
router.post('/chat', chatWithAI);

// Symptom Analysis
router.post('/symptoms/analyze', analyzeSymptoms);

// Schedule Optimization
router.post('/schedule/optimize', optimizeSchedule);

// Health Check
router.get('/health', healthCheck);

// RAG Pipeline Routes
router.post('/rag/process-book', processMedicalBook);
router.get('/rag/statistics', getRAGStatistics);

export default router;

