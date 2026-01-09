
import { GoogleGenAI, Type } from "@google/genai";
import { Word, JLPTLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const fetchJLPTWords = async (level: JLPTLevel): Promise<Word[]> => {
  const modelName = 'gemini-3-flash-preview';
  
  const levelPrompt = level === 'Mixed' 
    ? "JLPT N1 to N5 levels mixed" 
    : `JLPT ${level} level`;

  const prompt = `Generate a list of 100 common ${levelPrompt} vocabulary words for a Japanese learning game.
  For each word, provide:
  - The word (Kanji/Kana)
  - The reading (Hiragana)
  - The meaning in Korean (must be concise, 1-2 words).
  Ensure high accuracy for the JLPT level.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              reading: { type: Type.STRING },
              meaning: { type: Type.STRING },
              level: { type: Type.STRING }
            },
            required: ["word", "reading", "meaning"]
          }
        }
      }
    });

    const wordsJson = JSON.parse(response.text);
    return wordsJson.map((w: any, index: number) => ({
      ...w,
      id: `${Date.now()}-${index}`,
      level: w.level || level
    }));
  } catch (error) {
    console.error("Error fetching words from Gemini:", error);
    throw error;
  }
};
