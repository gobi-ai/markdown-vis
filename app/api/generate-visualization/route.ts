import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { generateVisualization } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    const { filePath } = await request.json();
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }
    
    // Read the markdown file
    const content = await readFile(filePath, 'utf-8');
    
    // Generate visualization using LLM
    const visualizationConfig = await generateVisualization(content);
    
    return NextResponse.json({
      success: true,
      config: visualizationConfig,
      sourceFile: filePath,
    });
  } catch (error: any) {
    console.error('Error generating visualization:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate visualization' },
      { status: 500 }
    );
  }
}

