import { GoogleGenAI, Modality } from "@google/genai";
import { addAssetFromFile } from "../actions/assetActions";
import { Dispatch } from "react";
import { Action } from "../store/EditorProvider";
import { generateId } from "../../lib/utils";
import { ImageAsset } from "../../lib/assets";

// Helper function to convert data URL to Blob
function dataURLtoBlob(dataurl: string) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)?.[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}


export const generateImageAndAddToAssets = async (prompt: string, dispatch: Dispatch<Action>): Promise<void> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                
                const blob = dataURLtoBlob(imageUrl);
                const file = new File([blob], `${prompt.substring(0, 20)}.png`, { type: part.inlineData.mimeType });
                
                // Use existing action to process and add the asset
                await addAssetFromFile(dispatch, file);
                return;
            }
        }
        throw new Error("No image data found in response.");
    } catch (error) {
        console.error("Image generation failed:", error);
        throw error; // Re-throw to be caught by the UI
    }
};
