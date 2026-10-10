require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

async function testGemini() {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY was not found in .env");
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Reply with: Gemini API connection successful."
        });

        console.log("Gemini response:");
        console.log(response.text);
    } catch (error) {
        console.error("Gemini test failed:", error.message);
    }
}

testGemini();