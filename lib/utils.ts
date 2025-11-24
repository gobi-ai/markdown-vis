import { readdir, stat, readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { generateImageFromMarkdown } from './ai';

export interface LatestMdFile {
  filename: string;
  path: string;
  mtime: string;
  size: number;
}

export async function getLatestMarkdownFile(): Promise<LatestMdFile> {
  const publishDir = join(process.cwd(), 'documents');
  
  const files = await readdir(publishDir);
  const mdFiles = files.filter(file => file.endsWith('.md'));
  
  if (mdFiles.length === 0) {
    throw new Error('No markdown files found');
  }
  
  const fileStats = await Promise.all(
    mdFiles.map(async (file) => {
      const filePath = join(publishDir, file);
      const stats = await stat(filePath);
      return {
        name: file,
        path: filePath,
        mtime: stats.mtime,
        size: stats.size
      };
    })
  );
  
  fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  const latestFile = fileStats[0];
  
  return {
    filename: latestFile.name,
    path: latestFile.path,
    mtime: latestFile.mtime.toISOString(),
    size: latestFile.size
  };
}

export async function generateVisualization(): Promise<{ imageAvailable: boolean; message: string }> {
  const latestMd = await getLatestMarkdownFile();
  
  const markdownContent = await readFile(latestMd.path, 'utf-8');
  
  if (!markdownContent || markdownContent.trim().length === 0) {
    throw new Error(`Markdown file ${latestMd.filename} is empty`);
  }
  
  const pngBuffer = await generateImageFromMarkdown(markdownContent);
  
  const generatedDir = join(process.cwd(), 'generated');
  if (!existsSync(generatedDir)) {
    await mkdir(generatedDir, { recursive: true });
  }
  
  const vizPath = join(generatedDir, 'vis.png');
  await writeFile(vizPath, pngBuffer);
  
  return {
    imageAvailable: true,
    message: 'Visualization generated and saved'
  };
}
