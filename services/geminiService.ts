
import { GoogleGenAI, Modality, GenerateContentResponse, Part } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set. Please check your .env.local file.");
}
const ai = new GoogleGenAI({ apiKey });

interface ImagePart {
  base64Data: string;
  mimeType: string;
}

export const fuseWithHistory = async (
  prompt: string,
  images: ImagePart[] = []
): Promise<string | null> => {
  try {
    const contentParts: Part[] = [];

    // Add all image parts provided
    for (const image of images) {
      if (image.base64Data && image.mimeType) {
        contentParts.push({
          inlineData: {
            data: image.base64Data,
            mimeType: image.mimeType,
          },
        });
      }
    }

    // Always add the text prompt
    contentParts.push({ text: prompt });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: contentParts,
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data; // Return the base64 string of the generated image
      }
    }
    
    console.warn("No image part found in the Gemini response.", response);
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate image with Gemini API.");
  }
};
