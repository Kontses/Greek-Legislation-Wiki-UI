import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in environment variables.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");

// Using the latest flash model for speed and cost-effectiveness
export const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
  }
});
