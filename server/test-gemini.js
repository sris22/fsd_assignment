const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels on the client instance in the node SDK easily accessible 
        // without using the model manager or similar, but let's try a simple generation test 
        // with a known stable model name fallback.

        // Actually, let's just try to hit the API directly to list models if the SDK is obscure about it,
        // but the SDK *does* have it. 
        // Wait, the error message itself said: "Call ListModels to see the list of available models"

        // In the Node SDK, it's not directly on genAI. 
        // We can use the API directly via fetch to be sure.

        const key = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("Error listing models:", data);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
