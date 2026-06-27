const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getChatResponse(userMessage) {
    const prompt = `당신은 지능형 건강 코치 '엘리스'입니다. 
    사용자의 상황: "${userMessage}"
    1. 따뜻하지만 단호하게 조언할 것. 
    2. 해결책을 3줄 이내로 요약할 것. 
    3. 마지막에 응원의 한마디를 더할 것.`;

    try {
        // 1. Gemini 1.5 Flash 시도
        const model = genAI.getGenerativeModel({ model: process.env.MODEL_NAME });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { source: 'Gemini', text: response.text() };

    } catch (error) {
        console.error("Gemini Error! Falling back to Ollama...", error.message);

        // 2. Ollama (Local) 시도
        try {
            const ollamaRes = await axios.post(process.env.OLLAMA_URL, {
                model: process.env.OLLAMA_MODEL,
                messages: [{ role: "user", content: prompt }],
                stream: false
            });
            return { source: 'Ollama(Local)', text: ollamaRes.data.message.content };
        } catch (ollamaError) {
            return { source: 'System', text: "현재 모든 AI 회선이 불안정합니다. 잠시 후 다시 시도해주세요." };
        }
    }
}

module.exports = { getChatResponse };