import youtubeDl from 'youtube-dl-exec';
import { TranscriptError } from '../types/transcript';

export async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const output = await youtubeDl(url, {
      skipDownload: true,
      dumpSingleJson: true,
    });
    
    const title = output.title as string;
    return title
      .replace(/[/\\?%*:|"<>]/g, '-') // Replace invalid filename characters with dash
      .replace(/\s+/g, '-') // Replace spaces with dash
      .toLowerCase(); // Convert to lowercase for consistency
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new TranscriptError(`Failed to fetch video title: ${message}`);
  }
}