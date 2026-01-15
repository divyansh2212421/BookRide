
import { GoogleGenAI, Type } from "@google/genai";
import { LocationSuggestion, Location } from "../types";

const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const getLocationSuggestions = async (query: string): Promise<LocationSuggestion[]> => {
  if (!query || query.length < 3) return [];

  // If no API key, provide helpful static defaults for common Indian cities
  if (!getApiKey()) {
    return [
      { 
        primaryText: `${query} MG Road`, 
        secondaryText: "Bangalore, Karnataka", 
        fullAddress: `${query}, MG Road, Bangalore 560001`,
        lat: 12.9716, lng: 77.5946 
      },
      { 
        primaryText: `${query} Terminal 1`, 
        secondaryText: "Mumbai Airport, Maharashtra", 
        fullAddress: `${query}, Chhatrapati Shivaji Maharaj International Airport, Mumbai`,
        lat: 19.0896, lng: 72.8656 
      }
    ];
  }

  const prompt = `You are a production-grade location autocomplete service for a mobility app in India.
  User query: "${query}"
  
  Provide 5 highly realistic location suggestions. 
  For each suggestion, provide:
  1. primaryText: The main name of the place (e.g., "Phoenix Marketcity").
  2. secondaryText: The area and city (e.g., "Whitefield, Bangalore").
  3. fullAddress: The complete postal address.
  4. lat/lng: Realistic coordinates in a major Indian city (Bangalore, Mumbai, Delhi, etc.) matching the query.
  
  Return the result strictly as a JSON array of objects.`;

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

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Autocomplete failed:", error);
    return [
      { 
        primaryText: `${query} Central`, 
        secondaryText: "Bangalore, KA", 
        fullAddress: `${query} Central Mall, MG Road, Bangalore 560001`,
        lat: 12.9716, lng: 77.5946 
      }
    ];
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<Location> => {
  if (!getApiKey()) {
    return { address: "Current Location", secondaryAddress: "Near detected GPS", lat, lng };
  }

  const prompt = `Reverse geocode these coordinates in India: Lat ${lat}, Lng ${lng}.
  Provide a human-readable address. Return as JSON with keys: address, secondaryAddress.`;

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
    const data = JSON.parse(response.text.trim());
    return { ...data, lat, lng };
  } catch (e) {
    return { address: "Near Current Location", secondaryAddress: "Bangalore, KA", lat, lng };
  }
};
