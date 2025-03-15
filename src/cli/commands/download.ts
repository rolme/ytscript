import { Command } from 'commander';
import { getTranscript } from '../../services/transcript/index.js';
import { TranscriptError } from '../../types/transcript.js';
import { OutputFormat } from '../../types/output.js';
import { formatAndSaveOutput } from '../../services/output/index.js';
import { getTitleFromUrl } from '../../utils/titleFetcher.js';

export function createDownloadCommand(): Command {
  const command = new Command('download');
  command
    .description('Download transcript from a YouTube video')
    .argument('<url>', 'YouTube video URL')
    .option('-l, --language <code>', 'Language code (e.g., en, es, fr)')
    .option('-o, --output <path>', 'Output file path')
    .option('-f, --format <format>', 'Output format (text or json)', 'text')
    .action(async (url: string, options: { 
      language?: string; 
      output?: string;
      format?: OutputFormat;
    }) => {
      try {
        const result = await getTranscript(url, { language: options.language });
        const title = await getTitleFromUrl(url);
        const filePath = await formatAndSaveOutput(result, title, {
          format: options.format,
          outputPath: options.output,
          language: options.language
        });

        if (options.output) {
          console.log('Transcript saved to:', filePath);
        } else if (options.format === 'text') {
          console.log(result.transcript);
        } else {
          const response = {
            success: true,
            data: {
              videoId: result.videoId,
              transcript: result.transcript,
              segments: result.segments,
              metadata: {
                timestamp: new Date().toISOString(),
                options: { language: options.language }
              }
            }
          };
          console.log(JSON.stringify(response, null, 2));
        }
      } catch (error) {
        if (options.format === 'json') {
          const response = {
            success: false,
            error: {
              code: error instanceof TranscriptError ? 'TRANSCRIPT_ERROR' : 'UNKNOWN_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error occurred'
            }
          };
          console.error(JSON.stringify(response, null, 2));
        } else {
          if (error instanceof TranscriptError) {
            console.error('Failed to download transcript:', error.message);
          } else if (error instanceof Error) {
            console.error('Unexpected error:', error.message);
          } else {
            console.error('Unknown error occurred');
          }
        }
        process.exit(1);
      }
    });

  return command;
} 