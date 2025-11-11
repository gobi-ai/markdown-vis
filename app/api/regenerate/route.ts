import { NextResponse } from 'next/server';
import { regenerateVisualization } from '@/lib/utils';

export async function POST() {
  try {
    const result = await regenerateVisualization();
    
    return NextResponse.json({
      success: true,
      message: result.message,
      config: result.config,
    });
  } catch (error: any) {
    console.error('Error regenerating visualization:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to regenerate visualization' },
      { status: 500 }
    );
  }
}

