#!/usr/bin/env node

import { Command } from 'commander';
import { getTranscript } from './services/transcript/index.js';
import { summarizeVideo, saveSummary } from './index.js';
import { TranscriptError } from './types/transcript.js';
import { AIError } from './types/ai.js';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(await readFile(join(__dirname, '../package.json'), 'utf-8'));
const { version } = packageJson;

// Load environment variables from .env file
dotenv.config();

const program = new Command();

program
  .name('@rolme/ytscript')
  .description('CLI tool to download and summarize YouTube video transcripts')
  .version(version);

program
  .command('download')
  .description('Download transcript from a YouTube video')
  .argument('<url>', 'YouTube video URL')
  .option('-l, --language <code>', 'Language code (e.g., en, es, fr)')
  .option('-o, --output <path>', 'Output file path')
  .action(async (url: string, options: { language?: string; output?: string }) => {
    try {
      const result = await getTranscript(url, options);
      console.log('Transcript downloaded successfully!');
      if (options.output) {
        console.log(`Saved to: ${options.output}`);
      } else {
        console.log(result.transcript);
      }
    } catch (error) {
      if (error instanceof TranscriptError) {
        console.error('Failed to download transcript:', error.message);
      } else if (error instanceof Error) {
        console.error('Unexpected error:', error.message);
      } else {
        console.error('Unknown error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('summarize')
  .description('Download and summarize a YouTube video transcript')
  .argument('<url>', 'YouTube video URL')
  .option('-l, --language <code>', 'Language code (e.g., en, es, fr)')
  .option('-o, --output <path>', 'Output file path')
  .option('-p, --provider <n>', 'AI provider (chatgpt or claude)')
  .option('-k, --api-key <key>', 'AI provider API key')
  .option('-s, --style <style>', 'Summary style (concise or detailed)')
  .option('-m, --max-length <number>', 'Maximum length of the summary')
  .action(async (url: string, options: {
    language?: string;
    output?: string;
    provider?: string;
    apiKey?: string;
    style?: string;
    maxLength?: string;
  }) => {
    try {
      const maxLength = options.maxLength ? parseInt(options.maxLength, 10) : undefined;
      
      if (options.output) {
        const filePath = await saveSummary(url, {
          language: options.language,
          outputPath: options.output,
          provider: options.provider,
          apiKey: options.apiKey,
          summary: {
            style: options.style as 'concise' | 'detailed',
            maxLength
          }
        });
        console.log('Summary saved to:', filePath);
      } else {
        const result = await summarizeVideo(url, {
          language: options.language,
          provider: options.provider,
          apiKey: options.apiKey,
          summary: {
            style: options.style as 'concise' | 'detailed',
            maxLength
          }
        });
        console.log('\nOriginal Transcript:');
        console.log(result.transcript);
        console.log('\nSummary:');
        console.log(result.summary);
      }
    } catch (error) {
      if (error instanceof TranscriptError) {
        console.error('Failed to download transcript:', error.message);
      } else if (error instanceof AIError) {
        console.error('Failed to generate summary:', error.message);
      } else if (error instanceof Error) {
        console.error('Unexpected error:', error.message);
      } else {
        console.error('Unknown error occurred');
      }
      process.exit(1);
    }
  });

// Export the program after all commands are defined
export { program }; 