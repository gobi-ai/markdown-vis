import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateImageFromMarkdown(markdownContent: string): Promise<Buffer> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `Analyze the following markdown content and generate a Scalable Vector Graphics (SVG) infographic that visualizes the data.
  
  The markdown content:
  ${markdownContent}
  
  Requirements:
  1. Create a professional, clean, and colorful infographic style visualization.
  2. Use a white background (fill="#ffffff").
  3. Ensure all text is legible.
  4. The SVG should be 800x600 pixels.
  5. Return ONLY the raw SVG code. Do not wrap it in markdown code blocks (no \`\`\`xml or \`\`\`). Do not include any explanation.
  
  Create an infographic that combines visual elements, icons, charts, and minimal text to effectively communicate the information from the markdown content.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let svgCode = response.text();

    svgCode = svgCode.replace(/^```xml\s*/i, '')
                     .replace(/^```svg\s*/i, '')
                     .replace(/^```\s*/, '')
                     .replace(/\s*```$/, '')
                     .trim();

    if (!svgCode.toLowerCase().startsWith('<svg')) {
      const start = svgCode.toLowerCase().indexOf('<svg');
      const end = svgCode.toLowerCase().lastIndexOf('</svg>');
      if (start !== -1 && end !== -1) {
        svgCode = svgCode.substring(start, end + 6);
      } else {
        throw new Error('Failed to generate valid SVG');
      }
    }

    const sharp = require('sharp');
    
    const pngBuffer = await sharp(Buffer.from(svgCode))
      .png()
      .toBuffer();

    return pngBuffer;

  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    throw error;
  }
}
