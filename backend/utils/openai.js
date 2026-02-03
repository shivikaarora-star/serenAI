import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY?.trim();
if (!apiKey) {
  throw new Error(
    "Missing GEMINI_API_KEY. Set it in backend/.env (e.g. GEMINI_API_KEY=...) and restart the server."
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite", // fast + good for chat/emotions
  systemInstruction: `
You are a kind, emotionally supportive AI friend.
You help users with:
- Breakup pain
- Career confusion
- Personal life struggles
- Motivation
- Decision making

Rules:
- Be empathetic and calm
- Do NOT judge
- Give practical but gentle advice
- Encourage self-belief
- If someone feels hopeless, suggest talking to trusted people
`
});

export default model;







