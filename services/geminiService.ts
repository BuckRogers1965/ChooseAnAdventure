
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = "gemini-2.5-flash";

export const generateDescription = async (locationName: string, gameTheme: string): Promise<string> => {
  const prompt = `Generate a compelling and descriptive paragraph for a location named "${locationName}" in a choose-your-own-adventure game with a "${gameTheme}" theme. The description should be immersive, atmospheric, and hint at possible actions or paths without explicitly stating them. Write only the description text.`;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating description:", error);
    return "Failed to generate a description. Please try again.";
  }
};

export const generateChoices = async (locationDescription: string, gameTheme: string): Promise<{ text: string }[]> => {
  const prompt = `Based on the following location description from a "${gameTheme}" choose-your-own-adventure game, generate 3 distinct and interesting choices for the player to make. Each choice should be a short, actionable phrase.

Description:
${locationDescription}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: 'The actionable choice text for the player.',
              },
            },
            required: ['text'],
          },
        },
      },
    });
    
    const jsonStr = response.text.trim();
    const choices = JSON.parse(jsonStr);
    return Array.isArray(choices) ? choices : [];
  } catch (error) {
    console.error("Error generating choices:", error);
    return [];
  }
};
