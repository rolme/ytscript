#!/usr/bin/env node

import { Command } from 'commander';
import { saveTranscript } from './transcriptFetcher';
import { TranscriptError } from './types';

const program = new Command();

program
  .name('ytscript')
  .description('Download YouTube video transcripts')
  .version('1.0.0')
  .argument('<url>', 'YouTube video URL')
  .option('-l, --language <code>', 'Language code (e.g., en, es, fr)')
  .option('-o, --output <path>', 'Output file path')
  .action(async (url: string, options: { language?: string; output?: string }) => {
    try {
      const outputPath = await saveTranscript(url, {
        language: options.language,
        outputPath: options.output
      });
      console.log(`Transcript saved to: ${outputPath}`);
    } catch (error) {
      if (error instanceof TranscriptError) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error('An unexpected error occurred');
      }
      process.exit(1);
    }
  });

program.parse(); 