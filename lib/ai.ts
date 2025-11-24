import { GoogleGenAI } from "@google/genai";

export async function generateImageFromMarkdown(markdownContent: string): Promise<Buffer> {
  const prompt = `Generate an infographic based on the following markdown content.
  
  Markdown content:
  ${markdownContent}
  
  Requirements:
  1. Create a professional, clean, and colorful infographic style visualization.
  2. Use a white background.
  3. Ensure all text is legible.
  4. The image should be 800x600 pixels.
  
  Create an infographic that combines visual elements, icons, charts, and minimal text to effectively communicate the information.
  `;

  const ai = new GoogleGenAI({});
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const imageData = part.inlineData.data;
      return Buffer.from(imageData, "base64");
    }
  }

  throw new Error('No image data found in response');
}
