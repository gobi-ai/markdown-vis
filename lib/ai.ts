import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateImageFromMarkdown(markdownContent: string): Promise<Buffer> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try direct image generation (JPEG) first with Nano Banana
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
    
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

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "image/jpeg"
      }
    });

    const response = await result.response;
    
    // @ts-ignore - Types may not be updated for preview features
    const candidates = response.candidates;
    
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        // @ts-ignore
        if (part.inlineData && part.inlineData.data) {
          // @ts-ignore
          return Buffer.from(part.inlineData.data, 'base64');
        }
      }
    }
  } catch (error: any) {
    // If direct image generation fails, fall back to SVG generation with a text-capable model
    if (error.message && (error.message.includes('response_mime_type') || error.message.includes('400'))) {
      console.log('Direct image generation (JPEG/PNG) not supported in Node.js SDK, using SVG generation with gemini-2.0-flash-exp...');
      return generateSVGAndConvert(markdownContent, genAI);
    }
    throw error;
  }

  throw new Error('No image data found in response');
}

async function generateSVGAndConvert(markdownContent: string, genAI: GoogleGenerativeAI): Promise<Buffer> {
  // Use gemini-2.0-flash-exp for SVG generation as it's more reliable for text output
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `Generate a Scalable Vector Graphics (SVG) infographic based on the following markdown content.
  
  Markdown content:
  ${markdownContent}
  
  Requirements:
  1. Create a professional, clean, and colorful infographic style visualization.
  2. Use a white background (fill="#ffffff").
  3. Ensure all text is legible.
  4. The SVG should be 800x600 pixels.
  5. Return ONLY the raw SVG code. Do not wrap it in markdown code blocks (no \`\`\`xml or \`\`\`). Do not include any explanation or analysis.
  
  Create an infographic that combines visual elements, icons, charts, and minimal text to effectively communicate the information.
  `;

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
}
