import { GoogleGenAI, Type } from "@google/genai";
import { RideEstimate, AIInsight, ChatMessage } from "../types";

/**
 * PRODUCTION SAFE INITIALIZATION
 * We use a factory pattern to ensure the SDK is only initialized when needed
 * and handles missing API keys gracefully without crashing the whole application.
 */
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getSmartInsights = async (estimates: RideEstimate[]): Promise<AIInsight> => {
  const ai = getAIClient();
  
  if (!ai || estimates.length === 0) {
    return {
      summary: "Comparison complete.",
      recommendation: estimates.length > 0 ? `The cheapest option is ${estimates.sort((a, b) => a.price - b.price)[0].provider}.` : "Search for rides to see insights.",
      savingTip: "Check different ride categories for better rates.",
      surgePrediction: "Check individual providers for real-time surge indicators."
    };
  }

  const prompt = `Analyze these ride options for a commuter in India. 
  Data: ${JSON.stringify(estimates.map(e => ({ provider: e.provider, type: e.category, name: e.name, price: e.price, eta: e.eta })))}
  
  Identify the best overall value and cheapest options. Predict surge likelihood based on current time. 
  Keep response strictly in JSON format matching the requested schema.`;

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

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text.trim()) as AIInsight;
  } catch (error) {
    console.warn("Gemini Insights failed to load. Falling back to static logic.", error);
    return {
      summary: "Live prices available below.",
      recommendation: "Select the option that best fits your schedule.",
      savingTip: "Uber and Ola prices often vary by small margins.",
      surgePrediction: "High demand observed in the current area."
    };
  }
};

export const chatWithAssistant = async (history: ChatMessage[], currentContext: RideEstimate[]): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "I'm currently in basic mode. I can help you compare the prices listed on the screen. Rapido is usually best for solo trips, while Uber/Ola offer more comfort.";

  const contextText = currentContext.length > 0 
    ? `Current Ride Options: ${JSON.stringify(currentContext.map(c => ({ p: c.provider, n: c.name, pr: c.price, t: c.eta })))}` 
    : "No rides searched yet.";

  const systemInstruction = `You are RideCompare AI, a helpful Indian ride assistant. 
  Use the current ride options to help users decide. Be helpful, professional, and slightly witty.
  Focus on price savings and time efficiency. Mention Uber, Ola, and Rapido specifically.
  If no rides are searched yet, invite the user to enter their pickup and destination.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: contextText },
          ...history.map(m => ({ text: `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}` }))
        ]
      },
      config: { systemInstruction }
    });

    return response.text || "I'm not sure how to answer that, but I recommend checking the price list above!";
  } catch (error) {
    console.error("Chat AI Error:", error);
    return "I'm having a bit of a moment. Try checking the cheapest ride highlighted in green!";
  }
};