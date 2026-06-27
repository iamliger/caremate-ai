const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getAIResponse(prompt) {
    try {
        // 1. Gemini 호출 시도
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { source: 'Gemini', text: response.text() };
    } catch (error) {
        console.error("Gemini Error, switching to Ollama:", error.message);

        // 2. 실패 시 로컬 Ollama 호출
        try {
            const ollamaRes = await axios.post(process.env.OLLAMA_URL, {
                model: "llama3", // 또는 gemma2
                prompt: prompt,
                stream: false
            });
            return { source: 'Ollama (Local)', text: ollamaRes.data.response };
        } catch (ollamaError) {
            return { source: 'Error', text: "죄송합니다. 현재 모든 AI 상담원이 휴가 중입니다." };
        }
    }
}

module.exports = { getAIResponse };