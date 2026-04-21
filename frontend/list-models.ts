import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Σφάλμα: Η μεταβλητή περιβάλλοντος GEMINI_API_KEY δεν έχει οριστεί.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
  try {
    // Note: The SDK might not have a direct listModels, but we can try fetching or using the REST API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

list();
