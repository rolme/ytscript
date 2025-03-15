import { Command } from 'commander';
import { version } from '../../package.json' assert { type: 'json' };
import { createDownloadCommand } from './commands/download.js';
import { createSummarizeCommand } from './commands/summarize.js';
import { createTestCommand } from './commands/test.js';

export function createCli(): Command {
  const program = new Command();

  program
    .name('ytscript')
    .description('CLI tool to download YouTube transcripts and generate summaries')
    .version(version);

  program.addCommand(createDownloadCommand());
  program.addCommand(createSummarizeCommand());
  if (process.env.NODE_ENV === 'test') {
    program.addCommand(createTestCommand());
  }

  return program;
} 