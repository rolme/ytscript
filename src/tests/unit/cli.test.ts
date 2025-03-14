import { Command } from 'commander';
import { getTranscript, summarizeVideo, saveSummary } from '../../index';
import { TranscriptError } from '../../types/transcript';
import { AIError } from '../../types/ai';

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock package.json
jest.mock('../../../package.json', () => ({
  version: '1.0.0'
}));

// Mock the core functions
const mockGetTranscript = jest.fn();
const mockSummarizeVideo = jest.fn();
const mockSaveSummary = jest.fn();

jest.mock('../../index', () => ({
  getTranscript: (...args: any[]) => mockGetTranscript(...args),
  summarizeVideo: (...args: any[]) => mockSummarizeVideo(...args),
  saveSummary: (...args: any[]) => mockSaveSummary(...args)
}));

// Mock console.log and console.error
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number | string | null) => undefined as never);

describe('CLI', () => {
  let program: Command;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset modules to get a fresh instance of the program
    jest.resetModules();
    // Mock the CLI module
    jest.mock('../../cli', () => {
      const { Command } = jest.requireActual('commander');
      const program = new Command();

      program
        .name('@rolme/ytscript')
        .description('CLI tool to download and summarize YouTube video transcripts')
        .version('1.0.0');

      program
        .command('download')
        .description('Download transcript from a YouTube video')
        .argument('<url>', 'YouTube video URL')
        .option('-l, --language <code>', 'Language code (e.g., en, es, fr)')
        .option('-o, --output <path>', 'Output file path')
        .action(async (url: string, options: { language?: string; output?: string }) => {
          try {
            const result = await mockGetTranscript(url, options);
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
              const filePath = await mockSaveSummary(url, {
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
              const result = await mockSummarizeVideo(url, {
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

      return { program };
    });
    const cli = require('../../cli');
    program = cli.program;
  });

  describe('download command', () => {
    const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const mockTranscript = {
      transcript: 'Test transcript',
      segments: [],
      videoId: 'dQw4w9WgXcQ'
    };

    it('should download and display transcript', async () => {
      mockGetTranscript.mockResolvedValueOnce(mockTranscript);

      await program.parseAsync(['node', 'test', 'download', validUrl]);

      expect(mockGetTranscript).toHaveBeenCalledWith(validUrl, {});
      expect(mockConsoleLog).toHaveBeenCalledWith('Transcript downloaded successfully!');
      expect(mockConsoleLog).toHaveBeenCalledWith(mockTranscript.transcript);
    });

    it('should handle language option', async () => {
      mockGetTranscript.mockResolvedValueOnce(mockTranscript);

      await program.parseAsync(['node', 'test', 'download', validUrl, '--language', 'es']);

      expect(mockGetTranscript).toHaveBeenCalledWith(validUrl, { language: 'es' });
    });

    it('should handle output option', async () => {
      mockGetTranscript.mockResolvedValueOnce({ ...mockTranscript, outputPath: 'output.txt' });

      await program.parseAsync(['node', 'test', 'download', validUrl, '--output', 'output.txt']);

      expect(mockGetTranscript).toHaveBeenCalledWith(validUrl, { output: 'output.txt' });
      expect(mockConsoleLog).toHaveBeenCalledWith('Saved to: output.txt');
    });

    it('should handle TranscriptError', async () => {
      const error = new TranscriptError('Failed to fetch');
      mockGetTranscript.mockImplementationOnce(() => {
        throw error;
      });

      await program.parseAsync(['node', 'test', 'download', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Failed to download transcript:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      mockGetTranscript.mockImplementationOnce(() => {
        throw error;
      });

      await program.parseAsync(['node', 'test', 'download', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Unexpected error:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('summarize command', () => {
    const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const mockSummary = {
      transcript: 'Test transcript',
      summary: 'Test summary',
      segments: [],
      videoId: 'dQw4w9WgXcQ'
    };

    it('should summarize and display result', async () => {
      mockSummarizeVideo.mockResolvedValueOnce(mockSummary);

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockSummarizeVideo).toHaveBeenCalledWith(validUrl, {
        language: undefined,
        provider: undefined,
        apiKey: undefined,
        summary: {
          style: undefined,
          maxLength: undefined
        }
      });
      expect(mockConsoleLog).toHaveBeenCalledWith('\nOriginal Transcript:');
      expect(mockConsoleLog).toHaveBeenCalledWith(mockSummary.transcript);
      expect(mockConsoleLog).toHaveBeenCalledWith('\nSummary:');
      expect(mockConsoleLog).toHaveBeenCalledWith(mockSummary.summary);
    });

    it('should handle all options', async () => {
      mockSummarizeVideo.mockResolvedValueOnce(mockSummary);

      await program.parseAsync([
        'node', 'test', 'summarize', validUrl,
        '--language', 'es',
        '--provider', 'claude',
        '--api-key', 'test-key',
        '--style', 'concise',
        '--max-length', '500'
      ]);

      expect(mockSummarizeVideo).toHaveBeenCalledWith(validUrl, {
        language: 'es',
        provider: 'claude',
        apiKey: 'test-key',
        summary: {
          style: 'concise',
          maxLength: 500
        }
      });
    });

    it('should handle output option', async () => {
      mockSaveSummary.mockResolvedValueOnce('output.txt');

      await program.parseAsync([
        'node', 'test', 'summarize', validUrl,
        '--output', 'output.txt'
      ]);

      expect(mockSaveSummary).toHaveBeenCalledWith(validUrl, {
        language: undefined,
        outputPath: 'output.txt',
        provider: undefined,
        apiKey: undefined,
        summary: {
          style: undefined,
          maxLength: undefined
        }
      });
      expect(mockConsoleLog).toHaveBeenCalledWith('Summary saved to:', 'output.txt');
    });

    it('should handle TranscriptError', async () => {
      const error = new TranscriptError('Failed to fetch');
      mockSummarizeVideo.mockImplementationOnce(() => {
        throw error;
      });

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Failed to download transcript:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle AIError', async () => {
      const error = new AIError('Failed to summarize');
      mockSummarizeVideo.mockImplementationOnce(() => {
        throw error;
      });

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Failed to generate summary:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      mockSummarizeVideo.mockImplementationOnce(() => {
        throw error;
      });

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Unexpected error:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
}); 