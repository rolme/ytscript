import { writeFile } from 'fs/promises';
import { join, dirname, extname } from 'path';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { TranscriptError } from '../../types/transcript.js';
import { AIError } from '../../types/ai.js';
import { 
  OutputFormat, 
  OutputOptions, 
  JSONOutputMetadata,
  JSONSuccessResponse,
  JSONErrorResponse 
} from '../../types/output.js';
import { TranscriptResult } from '../../types/transcript.js';

function getFileExtension(format: OutputFormat): string {
  return format === 'json' ? '.json' : '.txt';
}

function generateFilename(title: string, format: OutputFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const extension = getFileExtension(format);
  return `${title}-${timestamp}${extension}`;
}

function createMetadata(options: Partial<OutputOptions> = {}): JSONOutputMetadata {
  return {
    timestamp: new Date().toISOString(),
    options: {
      language: options.language,
      style: options.style as 'concise' | 'detailed',
      maxLength: options.maxLength as number,
      provider: options.provider as string
    }
  };
}

function createSuccessResponse(
  result: TranscriptResult,
  summary?: string,
  options: Partial<OutputOptions> = {}
): JSONSuccessResponse {
  return {
    success: true,
    data: {
      videoId: result.videoId,
      transcript: result.transcript,
      segments: result.segments,
      ...(summary && { summary }),
      metadata: createMetadata(options)
    }
  };
}

function createErrorResponse(error: Error): JSONErrorResponse {
  let code: 'TRANSCRIPT_ERROR' | 'AI_ERROR' | 'UNKNOWN_ERROR' = 'UNKNOWN_ERROR';
  
  if (error instanceof TranscriptError) {
    code = 'TRANSCRIPT_ERROR';
  } else if (error instanceof AIError) {
    code = 'AI_ERROR';
  }

  return {
    success: false,
    error: {
      code,
      message: error.message
    }
  };
}

export async function formatAndSaveOutput(
  content: TranscriptResult | Error,
  title: string,
  options: OutputOptions = {},
  summary?: string
): Promise<string> {
  const format = options.format || 'text';
  let outputContent: string;

  if (content instanceof Error) {
    if (format === 'json') {
      outputContent = JSON.stringify(createErrorResponse(content), null, 2);
    } else {
      outputContent = `Error: ${content.message}`;
    }
  } else {
    if (format === 'json') {
      const response = createSuccessResponse(content, summary, options);
      outputContent = JSON.stringify(response, null, 2);
    } else {
      outputContent = summary 
        ? `Original Transcript:\n${content.transcript}\n\nSummary:\n${summary}`
        : content.transcript;
    }
  }

  if (options.outputPath) {
    const filePath = options.outputPath;
    const directory = dirname(filePath);
    const currentExt = extname(filePath);
    const expectedExt = getFileExtension(format);

    // Ensure correct file extension
    const finalPath = currentExt 
      ? filePath.replace(currentExt, expectedExt)
      : `${filePath}${expectedExt}`;

    // Ensure directory exists
    if (!existsSync(directory)) {
      await mkdir(directory, { recursive: true });
    }

    // Write content to file
    await writeFile(finalPath, outputContent, 'utf8');
    return finalPath;
  } else {
    // If no output path specified, generate a filename in current directory
    const filePath = join(process.cwd(), generateFilename(title, format));
    await writeFile(filePath, outputContent, 'utf8');
    return filePath;
  }
} 