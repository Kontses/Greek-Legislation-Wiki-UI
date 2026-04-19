import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBdH4YscnGF4WJxrVGWz7sOOiW7A3SlS04";
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
