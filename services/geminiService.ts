import { GoogleGenAI, Type } from "@google/genai";
import { LevelConfig, Theme } from "../types";

// Fallback level if API key is missing or error
const DEFAULT_LEVEL: LevelConfig = {
  name: "Neon Genesis",
  description: "A relaxed rhythm experience.",
  bpm: 100, // Slower BPM
  spawnInterval: 800, // Slower spawn rate
  difficulty: "Easy",
  theme: {
    primary: "#06b6d4", // Cyan
    secondary: "#d946ef", // Fuchsia
    accent: "#f472b6", // Pink
    background: "#0f172a" // Slate 900
  }
};

export const generateLevelFromPrompt = async (prompt: string): Promise<LevelConfig> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("No API Key found, using default level.");
    return DEFAULT_LEVEL;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a rhythm game level configuration based on this description: "${prompt}". 
      Return a JSON object only.
      Make sure the spawnInterval is between 600 (fast) and 1200 (slow).
      Make sure colors are vibrant hex codes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            bpm: { type: Type.NUMBER },
            spawnInterval: { type: Type.NUMBER },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard", "Extreme"] },
            theme: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING },
                secondary: { type: Type.STRING },
                accent: { type: Type.STRING },
                background: { type: Type.STRING }
              },
              required: ["primary", "secondary", "accent", "background"]
            }
          },
          required: ["name", "bpm", "spawnInterval", "difficulty", "theme"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as LevelConfig;
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return DEFAULT_LEVEL;
  }
};