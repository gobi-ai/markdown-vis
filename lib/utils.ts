import { readdir, stat, readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { generateVisualization } from './llm';

export interface LatestMdFile {
  filename: string;
  path: string;
  mtime: string;
  size: number;
}

export async function getLatestMarkdownFile(): Promise<LatestMdFile> {
  const publishDir = join(process.cwd(), 'documents');
  
  // Read all files in documents directory
  const files = await readdir(publishDir);
  const mdFiles = files.filter(file => file.endsWith('.md'));
  
  if (mdFiles.length === 0) {
    throw new Error('No markdown files found');
  }
  
  // Get file stats and find the most recently updated
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
  
  // Sort by modification time (most recent first)
  fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  const latestFile = fileStats[0];
  
  return {
    filename: latestFile.name,
    path: latestFile.path,
    mtime: latestFile.mtime.toISOString(),
    size: latestFile.size
  };
}

export async function regenerateVisualization(): Promise<{ config: any; message: string }> {
  // Get the latest markdown file
  const latestMd = await getLatestMarkdownFile();
  
  // Check if we've already processed this file
  const metadataPath = join(process.cwd(), 'generated', 'last-processed.md');
  let lastProcessed = '';
  if (existsSync(metadataPath)) {
    lastProcessed = await readFile(metadataPath, 'utf-8');
  }
  
  // Check if the file is newer than what we've processed
  const latestMdHash = `${latestMd.filename}:${latestMd.mtime}`;
  
  if (lastProcessed === latestMdHash) {
    // Already processed, just return existing visualization
    const vizPath = join(process.cwd(), 'generated', 'visualization.json');
    if (existsSync(vizPath)) {
      const existingViz = await readFile(vizPath, 'utf-8');
      return {
        config: JSON.parse(existingViz),
        message: 'Using existing visualization'
      };
    }
  }
  
  // Read markdown content
  const markdownContent = await readFile(latestMd.path, 'utf-8');
  
  if (!markdownContent || markdownContent.trim().length === 0) {
    throw new Error(`Markdown file ${latestMd.filename} is empty`);
  }
  
  // Generate new visualization
  const config = await generateVisualization(markdownContent);
  
  if (!config) {
    throw new Error('Failed to generate visualization config from LLM');
  }
  
  // Ensure generated directory exists
  const generatedDir = join(process.cwd(), 'generated');
  if (!existsSync(generatedDir)) {
    await mkdir(generatedDir, { recursive: true });
  }
  
  // Save visualization config
  const vizPath = join(generatedDir, 'visualization.json');
  await writeFile(vizPath, JSON.stringify(config, null, 2), 'utf-8');
  
  // Save metadata
  await writeFile(metadataPath, latestMdHash, 'utf-8');
  
  return {
    config,
    message: 'Visualization generated and saved'
  };
}

