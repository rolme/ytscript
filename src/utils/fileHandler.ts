import fs from 'fs';
import path from 'path';
import { TranscriptError } from '../types/transcript';

function cleanText(text: string): string {
  return text
    .replace(/&amp;#39;/g, "'")
    .replace(/&amp;quot;/g, '"')
    .replace(/&amp;amp;/g, '&')
    .replace(/&amp;lt;/g, '<')
    .replace(/&amp;gt;/g, '>')
    .replace(/%$/, ''); // Remove trailing % if exists
}

export async function saveToFile(content: string, title: string, outputPath?: string): Promise<string> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `${title}-${timestamp}.txt`;
    const filePath = outputPath || path.join(process.cwd(), defaultFilename);

    // Ensure directory exists
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Clean and write content to file
    const cleanedContent = cleanText(content);
    const absolutePath = path.resolve(filePath);
    await fs.promises.writeFile(absolutePath, cleanedContent, 'utf8');
    return absolutePath;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new TranscriptError(`Failed to save transcript: ${message}`);
  }
} 