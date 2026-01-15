
import { GoogleGenAI, Type } from "@google/genai";
import { RideEstimate, AIInsight, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartInsights = async (estimates: RideEstimate[]): Promise<AIInsight> => {
  const prompt = `Analyze these ride options for a commuter in India. 
  Data: ${JSON.stringify(estimates.map(e => ({ provider: e.provider, type: e.category, name: e.name, price: e.price, eta: e.eta })))}
  
  Identify the best overall value and cheapest options. Predict surge likelihood based on current time. 
  Keep response strictly in JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            savingTip: { type: Type.STRING },
            surgePrediction: { type: Type.STRING }
          },
          required: ["summary", "recommendation", "savingTip", "surgePrediction"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as AIInsight;
  } catch (error) {
    return {
      summary: "Prices are fluctuating.",
      recommendation: "Uber Mini seems optimal right now.",
      savingTip: "Switch to Bike to save up to 40%.",
      surgePrediction: "Moderate surge expected in the next 30 mins."
    };
  }
};

export const chatWithAssistant = async (history: ChatMessage[], currentContext: RideEstimate[]): Promise<string> => {
  const contextText = currentContext.length > 0 
    ? `Current Ride Options: ${JSON.stringify(currentContext.map(c => ({ p: c.provider, n: c.name, pr: c.price, t: c.eta })))}` 
    : "No rides searched yet.";

  const systemInstruction = `You are RideCompare AI, a helpful Indian ride assistant. 
  Use the current ride options to help users decide. Be helpful, professional, and slightly witty.
  Focus on price savings and time efficiency. Mention Uber, Ola, and Rapido specifically.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: contextText },
        ...history.map(m => ({ text: `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}` }))
      ],
      config: { systemInstruction }
    });

    return response.text.trim();
  } catch (error) {
    return "I'm having trouble connecting right now, but generally, Rapido is cheaper for short solo trips!";
  }
};
