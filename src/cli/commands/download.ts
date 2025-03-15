import { writeFile } from 'fs/promises';
import ytdl from 'ytdl-core';
import { getTranscript } from '../../services/transcript/index.js';
import { getVideoId } from '../../utils/videoId.js';
import { TranscriptError } from '../../errors.js';

interface DownloadOptions {
  language?: string;
  output?: string;
}

export async function download(url: string, options: DownloadOptions = {}): Promise<void> {
  try {
    const videoId = getVideoId(url);
    const info = await ytdl.getInfo(videoId);
    
    const result = await getTranscript(info, {
      lang: options.language
    });

    const outputPath = options.output || `transcript_${result.videoId}.txt`;
    await writeFile(outputPath, result.text);
    console.log(`Transcript saved to ${outputPath}`);
  } catch (error) {
    if (error instanceof TranscriptError) {
      console.error(error.message);
      process.exit(1);
    }
    if (error instanceof Error) {
      console.error('Failed to download transcript:', error.message);
    } else {
      console.error('Failed to download transcript:', error);
    }
    process.exit(1);
  }
} 