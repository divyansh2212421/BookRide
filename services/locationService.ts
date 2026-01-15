import { GoogleGenAI, Type } from "@google/genai";
import { LocationSuggestion, Location } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getLocationSuggestions = async (query: string): Promise<LocationSuggestion[]> => {
  if (!query || query.length < 3) return [];

  const ai = getAIClient();
  
  // Production Fallback: Static common locations if AI is unavailable or fails
  const fallback = [
    { 
      primaryText: `${query} MG Road`, 
      secondaryText: "Central, Bangalore", 
      fullAddress: `${query}, MG Road, Bangalore 560001`,
      lat: 12.9716, lng: 77.5946 
    },
    { 
      primaryText: `${query} Terminal 2`, 
      secondaryText: "Airport, Mumbai", 
      fullAddress: `${query}, T2, Mumbai Airport`,
      lat: 19.0896, lng: 72.8656 
    }
  ];

  if (!ai) return fallback;

  const prompt = `Provide 5 realistic location suggestions in India for query: "${query}".
  Include: primaryText, secondaryText, fullAddress, lat, lng.
  Return strictly as JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              primaryText: { type: Type.STRING },
              secondaryText: { type: Type.STRING },
              fullAddress: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER }
            },
            required: ["primaryText", "secondaryText", "fullAddress", "lat", "lng"]
          }
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text.trim()) : fallback;
  } catch (error) {
    console.warn("Location AI failed:", error);
    return fallback;
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<Location> => {
  const ai = getAIClient();
  const defaultLoc = { address: "Current Location", secondaryAddress: "Point on Map", lat, lng };

  if (!ai) return defaultLoc;

  const prompt = `Convert Coordinates to Address in India: Lat ${lat}, Lng ${lng}. 
  Return JSON: { address, secondaryAddress }.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            address: { type: Type.STRING },
            secondaryAddress: { type: Type.STRING }
          },
          required: ["address", "secondaryAddress"]
        }
      }
    });
    const text = response.text;
    const data = text ? JSON.parse(text.trim()) : defaultLoc;
    return { ...data, lat, lng };
  } catch (e) {
    return defaultLoc;
  }
};