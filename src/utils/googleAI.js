import { generateContent } from "../services/googleAIService.js";

export const generate = async (prompt) => {
  try {
    const response = await generateContent(prompt);
    return response;
  } catch (error) {
    console.error("Response error:", error);
    throw error;
  }
};