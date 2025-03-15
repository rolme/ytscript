import { Command } from 'commander';
import { summarizeVideo } from '../../index.js';
import { TranscriptError } from '../../types/transcript.js';
import { AIError } from '../../types/ai.js';
import { OutputFormat } from '../../types/output.js';
import { formatAndSaveOutput } from '../../services/output/index.js';
import { getTitleFromUrl } from '../../utils/titleFetcher.js';

export function createSummarizeCommand(): Command {
  const command = new Command('summarize');
  command
    .description('Download and summarize a YouTube video transcript')
    .argument('<url>', 'YouTube video URL')
    .option('-l, --language <code>', 'Language code (e.g., en, es, fr)')
    .option('-o, --output <path>', 'Output file path')
    .option('-p, --provider <n>', 'AI provider (chatgpt or claude)')
    .option('-k, --api-key <key>', 'AI provider API key')
    .option('-s, --style <style>', 'Summary style (concise or detailed)')
    .option('-m, --max-length <number>', 'Maximum length of the summary')
    .option('-f, --format <format>', 'Output format (text or json)', 'text')
    .action(async (url: string, options: {
      language?: string;
      output?: string;
      provider?: string;
      apiKey?: string;
      style?: string;
      maxLength?: string;
      format?: OutputFormat;
    }) => {
      try {
        const maxLength = options.maxLength ? parseInt(options.maxLength, 10) : undefined;
        const title = await getTitleFromUrl(url);
        
        const result = await summarizeVideo(url, {
          language: options.language,
          provider: options.provider,
          apiKey: options.apiKey,
          summary: {
            style: options.style as 'concise' | 'detailed',
            maxLength
          }
        });

        const filePath = await formatAndSaveOutput(result, title, {
          format: options.format,
          outputPath: options.output,
          language: options.language,
          provider: options.provider,
          style: options.style as 'concise' | 'detailed',
          maxLength
        }, result.summary);

        if (options.output) {
          console.log('Summary saved to:', filePath);
        } else if (options.format === 'text') {
          console.log('\nOriginal Transcript:');
          console.log(result.transcript);
          console.log('\nSummary:');
          console.log(result.summary);
        } else {
          const response = {
            success: true,
            data: {
              videoId: result.videoId,
              transcript: result.transcript,
              segments: result.segments,
              summary: result.summary,
              metadata: {
                timestamp: new Date().toISOString(),
                options: {
                  language: options.language,
                  provider: options.provider,
                  style: options.style,
                  maxLength
                }
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
              code: error instanceof TranscriptError 
                ? 'TRANSCRIPT_ERROR' 
                : error instanceof AIError 
                  ? 'AI_ERROR' 
                  : 'UNKNOWN_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error occurred'
            }
          };
          console.error(JSON.stringify(response, null, 2));
        } else {
          if (error instanceof TranscriptError) {
            console.error('Failed to download transcript:', error.message);
          } else if (error instanceof AIError) {
            console.error('Failed to generate summary:', error.message);
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