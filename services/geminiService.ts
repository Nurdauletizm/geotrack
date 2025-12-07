import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLocation = async (lat: number, lng: number): Promise<AIAnalysisResult> => {
  try {
    const prompt = `
      I am at coordinates: Latitude ${lat}, Longitude ${lng}.
      Provide a brief, interesting summary of this location. 
      If it's in a city, mention the neighborhood. If in nature, mention the biome or terrain.
      Also provide one fun historical or geographical fact about this general area.
      Return the response in JSON format strictly adhering to the schema.
      Language: Russian.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            locationName: { type: Type.STRING, description: "Short name of the location or neighborhood" },
            description: { type: Type.STRING, description: "A 2-3 sentence description of the surroundings" },
            funFact: { type: Type.STRING, description: "An interesting fact about the area" }
          },
          required: ["locationName", "description", "funFact"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      locationName: "Неизвестная локация",
      description: "Не удалось получить данные о местности. Проверьте соединение.",
      funFact: "GPS координаты были получены успешно, но анализ ИИ недоступен."
    };
  }
};
