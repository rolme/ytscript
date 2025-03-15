import { Command } from 'commander';
import { getTranscript } from '../../services/transcript/index.js';
import { TranscriptError } from '../../types/transcript.js';
import ytdl from 'ytdl-core';

interface SummarizeOptions {
  language?: string;
  output?: string;
}

export function createSummarizeCommand(): Command {
  const summarize = new Command('summarize')
    .description('Download and summarize transcript from a YouTube video')
    .argument('<url>', 'YouTube video URL')
    .option('-l, --language <code>', 'Language code (e.g., en, es, fr)')
    .option('-o, --output <path>', 'Output file path')
    .action(async (url: string, options: SummarizeOptions) => {
      try {
        const info = await ytdl.getInfo(url);
        const result = await getTranscript(info, {
          lang: options.language
        });

        console.log('Transcript:', result.transcript);
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
    });

  return summarize;
} 