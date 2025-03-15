import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { TranscriptError } from '../errors.js';

function cleanText(text: string): string {
  return text.trim().replace(/\n{3,}/g, '\n\n');
}

export async function saveToFile(content: string, title: string, outputPath?: string): Promise<string> {
  try {
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = outputPath || join(process.cwd(), `${sanitizedTitle}.txt`);

    // Ensure directory exists
    const directory = dirname(filePath);
    if (!existsSync(directory)) {
      await mkdir(directory, { recursive: true });
    }

    // Clean and write content to file
    const cleanedContent = cleanText(content);
    await writeFile(filePath, cleanedContent, 'utf8');
    return filePath;
  } catch (error) {
    if (error instanceof Error) {
      throw new TranscriptError(`Failed to save file: ${error.message}`);
    }
    throw new TranscriptError('Failed to save file: Unknown error');
  }
} 