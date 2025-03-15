import { writeFile } from 'fs/promises';
import ytdl from 'ytdl-core';
import { getTranscript } from '../../services/transcript/index.js';
import { getVideoId } from '../../utils/videoId.js';
import { TranscriptError } from '../../types/transcript.js';
import { OutputFormat } from '../../types/output.js';

interface DownloadOptions {
  language?: string;
  output?: string;
  format?: string;
}

function formatOutput(result: Awaited<ReturnType<typeof getTranscript>>, format: OutputFormat = OutputFormat.TEXT) {
  if (format === OutputFormat.JSON) {
    return JSON.stringify({
      format: OutputFormat.JSON,
      videoId: result.videoId,
      transcript: result.transcript,
      segments: result.segments,
      metadata: {
        lastUpdated: new Date().toISOString()
      }
    }, null, 2);
  }

  // Default text format
  return result.transcript;
}

function getOutputPath(videoId: string, format: OutputFormat, customPath?: string): string {
  if (customPath) return customPath;
  const extension = format === OutputFormat.JSON ? 'json' : 'txt';
  return `transcript_${videoId}.${extension}`;
}

export async function download(url: string, options: DownloadOptions = {}): Promise<void> {
  try {
    const videoId = getVideoId(url);
    const info = await ytdl.getInfo(videoId);
    
    const format = (options.format?.toLowerCase() === 'json') ? OutputFormat.JSON : OutputFormat.TEXT;
    
    const result = await getTranscript(info, {
      lang: options.language,
      format
    });

    const outputPath = getOutputPath(result.videoId, format, options.output);
    const formattedOutput = formatOutput(result, format);
    
    await writeFile(outputPath, formattedOutput);
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