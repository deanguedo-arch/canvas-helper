import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

export type LlmProvider = "gemini" | "openai";

export async function generateContent(systemInstruction: string, prompt: string, provider: LlmProvider = "gemini"): Promise<string> {
  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY in environment for OpenAI provider");
    }

    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    });

    return response.choices[0]?.message.content || "";
  }

  // Default to Gemini
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY or GOOGLE_API_KEY in environment for Gemini provider");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.2, // low temperature for coding
    }
  });

  return response.text || "";
}
