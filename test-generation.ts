import { generateVisualization } from './lib/utils';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { unlink } from 'fs/promises';
import { join } from 'path';

// Load environment variables from .env.local or .env
dotenv.config({ path: '.env.local' });
dotenv.config();

console.log('Running visualization generation test...');

if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

// Just checking if we can instantiate the model correctly
try {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  console.log(`Model initialized: ${model.model}`);
} catch (e: any) {
  console.error("Failed to initialize model:", e);
}

// Force regeneration by deleting the tracking file
const metadataPath = join(process.cwd(), 'generated', 'last-processed.md');
unlink(metadataPath).catch(() => {}); // Ignore error if file doesn't exist

generateVisualization()
  .then(result => {
    console.log('Success:', result.message);
    if (result.imageAvailable) {
      console.log('Image is available at generated/vis.png');
    }
  })
  .catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });

