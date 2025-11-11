import { regenerateVisualization } from '../lib/utils';

async function main() {
  try {
    console.log('Regenerating visualization...');
    const result = await regenerateVisualization();
    console.log('Success:', result.message);
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}

main();

