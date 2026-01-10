import { queryMedicalBook, testGemini } from '../services/ragService.js';

// Simple AI Chat for all purposes
export const chatWithAI = async (req, res) => {
  try {
    const message = (req.body?.message ?? req.body?.query);
    const { type = 'general' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string'
      });
    }

    const result = await queryMedicalBook(message);
    const response = result.answer;
    const context = result.sources || [];
    const retrievedChunks = []; 

    return res.status(200).json({
      success: true,
      message: 'AI response generated',
      data: { response, retrievedChunks, context }
    });
  } catch (error) {
    const status = error?.response?.status || 502;
    const errMsg = error?.message || 'AI chat failed';
    console.error('AI chat error:', errMsg);
    return res.status(status).json({
      success: false,
      message: errMsg
    });
  }
};

// Symptom Checker (uses chat with symptoms type)
export const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, age, gender } = req.body;

    if (!symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms are required'
      });
    }

    const message = `Patient: ${age ?? 'unknown'} years, ${gender ?? 'unknown'}. Symptoms: ${symptoms}`;
    const result = await queryMedicalBook(message);
    const response = result.answer;
    const context = result.sources || [];
    const retrievedChunks = [];
    
    res.status(200).json({
      success: true,
      message: 'Symptom analysis completed',
      data: { response, retrievedChunks, context },
      disclaimer: 'This is preliminary analysis. Please consult a healthcare professional for proper diagnosis.'
    });
  } catch (error) {
    console.error('Symptom analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Symptom analysis failed'
    });
  }
};

// Schedule Optimization (uses chat with schedule type)
export const optimizeSchedule = async (req, res) => {
  try {
    const { doctorId, dateRange, existingAppointments } = req.body;

    if (!doctorId || !dateRange) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and date range are required'
      });
    }

    const message = `Doctor ID: ${doctorId}, Date Range: ${dateRange.start} to ${dateRange.end}, Existing Appointments: ${JSON.stringify(existingAppointments || [])}`;
    const result = await queryMedicalBook(message);
    const response = result.answer;
    
    res.status(200).json({
      success: true,
      message: 'Schedule optimization completed',
      data: { response }
    });
  } catch (error) {
    console.error('Schedule optimization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Schedule optimization failed'
    });
  }
};

// Health Check
export const healthCheck = async (req, res) => {
  try {
    const ok = await testGemini();
    const statusCode = ok ? 200 : 503;
    res.status(statusCode).json({
      success: ok,
      message: ok ? 'AI service is healthy' : 'AI service is unhealthy',
      data: {
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        status: ok ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(503).json({
      success: false,
      message: 'AI service health check failed',
      error: error.message
    });
  }
};

// Process Medical Book (RAG Pipeline)
export const processMedicalBook = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: 'RAG book processing not available'
    });
  } catch (error) {
    console.error('Medical book processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Medical book processing failed',
      error: error.message
    });
  }
};

// Get RAG Pipeline Statistics
export const getRAGStatistics = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'RAG pipeline statistics retrieved',
      data: { status: 'disabled' }
    });
  } catch (error) {
    console.error('RAG statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get RAG statistics',
      error: error.message
    });
  }
};
