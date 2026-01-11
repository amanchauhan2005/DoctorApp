import { queryMedicalBook } from '../services/ragService.js';

export const chatWithAI = async (req, res) => {
  try {
    const message = (req.body?.message ?? req.body?.query);
    console.log("my query",message);
    if (!message) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    const response = await queryMedicalBook(message);
    console.log(response);
    res.status(200).json({
      success: true,
      answer: response.answer,
      sources: response.sources
    });
  } catch (error) {
    console.log("error agyi");
    console.error("=== CHAT ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("==================");
    res.status(500).json({
      success: false, 
      message: "Failed to process query",
      error: error.message // Include error in response for debugging
    });
  }
};
