import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET() {
  try {
    const vizPath = join(process.cwd(), 'generated', 'vis.png');
    
    if (!existsSync(vizPath)) {
      return new NextResponse('No visualization found', { status: 404 });
    }
    
    const imageBuffer = await readFile(vizPath);
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Error loading visualization image:', error);
    return new NextResponse(
      error.message || 'Failed to load visualization image',
      { status: 500 }
    );
  }
}

