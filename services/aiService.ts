
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult, Language } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const diagnosisSchema = {
  type: Type.OBJECT,
  properties: {
    isPlant: { type: Type.BOOLEAN, description: 'True if a plant or leaf is detected and identified, false otherwise' },
    plantName: { type: Type.STRING, description: 'Scientific or common name of the plant' },
    diagnosis: { type: Type.STRING, description: 'Detailed disease name or healthy status' },
    confidence: { type: Type.NUMBER, description: 'Score between 0 and 1' },
    severity: { type: Type.STRING, description: 'Categorical: Healthy, Mild, Moderate, Severe' },
    organicTreatment: { type: Type.STRING, description: 'Natural remedies' },
    chemicalTreatment: { type: Type.STRING, description: 'Professional agricultural solutions' },
    prevention: { type: Type.STRING, description: 'Long-term care strategies' },
    stressFactor: { type: Type.STRING, description: 'Environmental trigger (e.g. overwatering, pests)' },
    powerTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3 professional growth hacks' }
  },
  required: ['isPlant', 'plantName', 'diagnosis', 'confidence', 'severity', 'organicTreatment', 'chemicalTreatment', 'prevention', 'powerTips']
};

export const analyzePlant = async (imageB64: string, language: Language): Promise<{ result: Partial<DiagnosisResult> | null; error?: string }> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    const prompt = `
      Act as a senior professional horticulturalist.
      Analyze the provided image of a plant leaf/specimen.
      1. Identify the plant species.
      2. Detect symptoms of pests, fungi, nutrient deficiencies, or structural diseases.
      3. If the image is NOT a plant, or is too blurry to identify any botanical features, set "isPlant" to false.
      4. If perfectly healthy, clearly state "Healthy" in diagnosis and severity.
      5. Provide actionable, science-based recovery steps.
      6. Output in JSON format.
      Language requirement: ${language === 'tl' ? 'Tagalog' : 'English'}.
    `;

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageB64.split(',')[1] || imageB64,
      },
    };

    const textPart = {
      text: prompt
    };

    const response = await ai.models.generateContent({
      model,
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: diagnosisSchema
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    const result = JSON.parse(jsonStr);
    
    // Validate severity mapping
    const validSeverities = ['Healthy', 'Mild', 'Moderate', 'Severe'];
    if (!validSeverities.includes(result.severity)) {
        result.severity = result.diagnosis.toLowerCase().includes('healthy') ? 'Healthy' : 'Mild';
    }

    return { 
      result: {
        ...result,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      } 
    };
  } catch (error: any) {
    console.error("AI Service Error:", error);
    return { result: null, error: "The AI was unable to process the image. Please ensure the plant leaf is clearly visible and try again." };
  }
};
