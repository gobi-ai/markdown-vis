import { NextResponse } from 'next/server';
import { generateVisualization } from '@/lib/utils';

export async function POST() {
  try {
    const result = await generateVisualization();
    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error('Error generating visualization:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate visualization' },
      { status: 500 }
    );
  }
}
