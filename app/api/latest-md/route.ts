import { NextResponse } from 'next/server';
import { getLatestMarkdownFile } from '@/lib/utils';

export async function GET() {
  try {
    const latestMd = await getLatestMarkdownFile();
    return NextResponse.json(latestMd);
  } catch (error: any) {
    console.error('Error finding latest markdown file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to find latest markdown file' },
      { status: 500 }
    );
  }
}

