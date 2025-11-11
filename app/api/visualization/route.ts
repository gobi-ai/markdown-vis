import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET() {
  try {
    const vizPath = join(process.cwd(), 'generated', 'visualization.json');
    
    if (!existsSync(vizPath)) {
      return NextResponse.json({ error: 'No visualization found' }, { status: 404 });
    }
    
    const content = await readFile(vizPath, 'utf-8');
    const config = JSON.parse(content);
    
    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error('Error loading visualization:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load visualization' },
      { status: 500 }
    );
  }
}

