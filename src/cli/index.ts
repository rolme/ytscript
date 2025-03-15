import { Command } from 'commander';
import { createSummarizeCommand } from './commands/summarize.js';
import { createTestCommand } from './commands/test.js';
import { download } from './commands/download.js';
import dotenv from 'dotenv';
import packageJson from '../../package.json' assert { type: 'json' };

// Load environment variables from .env file
dotenv.config();

export function createCli(): Command {
  const program = new Command();

  program
    .name(packageJson.name)
    .description('CLI tool for downloading YouTube video transcripts')
    .version(packageJson.version);

  program
    .command('download')
    .description('Download transcript from a YouTube video')
    .argument('<url>', 'YouTube video URL')
    .option('-l, --language <code>', 'Language code (e.g., en, es, fr)')
    .option('-o, --output <path>', 'Output file path')
    .option('-f, --format <format>', 'Output format (text or json)', 'text')
    .action(async (url: string, options: { language?: string; output?: string; format?: string }) => {
      await download(url, options);
    });

  program.addCommand(createSummarizeCommand());
  if (process.env.NODE_ENV === 'test') {
    program.addCommand(createTestCommand());
  }

  return program;
} 