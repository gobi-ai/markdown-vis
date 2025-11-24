import { generateVisualization } from './lib/utils';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

console.log('Running visualization generation test...');

if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

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
