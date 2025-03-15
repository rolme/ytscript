import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { createDownloadCommand } from './commands/download.js';
import { createSummarizeCommand } from './commands/summarize.js';
import { createTestCommand } from './commands/test.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf8')
);

export function createCli(): Command {
  const program = new Command();

  program
    .name('ytscript')
    .description('CLI tool to download YouTube transcripts and generate summaries')
    .version(packageJson.version);

  program.addCommand(createDownloadCommand());
  program.addCommand(createSummarizeCommand());
  if (process.env.NODE_ENV === 'test') {
    program.addCommand(createTestCommand());
  }

  return program;
} 