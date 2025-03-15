import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, extname } from 'path';
import type { TranscriptResult } from '../../types/transcript.js';
import type { OutputOptions } from '../../types/output.js';
import { TranscriptError } from '../../types/transcript.js';
import { AIError } from '../../types/ai.js';

export async function formatAndSaveOutput(
  result: TranscriptResult | Error,
  title: string,
  options: OutputOptions = {},
  summary?: string
): Promise<string> {
  const format = options.format || 'text';
  let outputPath = options.outputPath;

  // Generate filename if not provided
  if (!outputPath) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const extension = format === 'json' ? '.json' : '.txt';
    outputPath = join(process.cwd(), `${title}-${timestamp}${extension}`);
  } else {
    // Ensure correct extension based on format
    const currentExt = extname(outputPath);
    const desiredExt = format === 'json' ? '.json' : '.txt';
    if (currentExt !== desiredExt) {
      outputPath = outputPath.replace(currentExt, desiredExt);
    }
  }

  // Create directory if it doesn't exist
  const dir = dirname(outputPath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  let content: string;

  if (result instanceof Error) {
    if (format === 'json') {
      content = JSON.stringify({
        success: false,
        error: {
          code: result instanceof TranscriptError ? 'TRANSCRIPT_ERROR' :
                result instanceof AIError ? 'AI_ERROR' : 'UNKNOWN_ERROR',
          message: result.message
        }
      }, null, 2);
    } else {
      content = `Error: ${result.message}`;
    }
  } else {
    if (format === 'json') {
      content = JSON.stringify({
        success: true,
        data: {
          videoId: result.videoId,
          transcript: result.transcript,
          segments: result.segments,
          ...(summary && { summary }),
          metadata: {
            timestamp: new Date().toISOString(),
            options: {
              language: options.language,
              ...(options.provider && { provider: options.provider })
            }
          }
        }
      }, null, 2);
    } else {
      content = summary
        ? `Original Transcript:\n${result.transcript}\n\nSummary:\n${summary}`
        : result.transcript;
    }
  }

  await writeFile(outputPath, content, 'utf8');
  return outputPath;
} 