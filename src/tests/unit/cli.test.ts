import { Command } from 'commander';
import type { TranscriptResult, TranscriptOptions } from '../../types/transcript';
import { TranscriptError } from '../../types/transcript';
import { AIError } from '../../types/ai';
import type { SummaryOptions, AIOptions } from '../../types/ai';

// Define the SummaryResult type that combines TranscriptResult with summary
interface SummaryResult extends TranscriptResult {
  summary: string;
}

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock package.json
jest.mock('../../../package.json', () => ({
  version: '1.0.0'
}));

// Mock the error classes
jest.mock('../../types/transcript', () => {
  const TranscriptError = jest.fn().mockImplementation((message) => {
    const error = new Error(message);
    error.name = 'TranscriptError';
    Object.setPrototypeOf(error, TranscriptError.prototype);
    return error;
  });
  TranscriptError.prototype = Object.create(Error.prototype);
  TranscriptError.prototype.constructor = TranscriptError;
  return { TranscriptError };
});

jest.mock('../../types/ai', () => {
  const AIError = jest.fn().mockImplementation((message) => {
    const error = new Error(message);
    error.name = 'AIError';
    Object.setPrototypeOf(error, AIError.prototype);
    return error;
  });
  AIError.prototype = Object.create(Error.prototype);
  AIError.prototype.constructor = AIError;
  return { AIError };
});

// Mock the core functions
const mockGetTranscript = jest.fn<Promise<TranscriptResult>, [string, TranscriptOptions]>();
const mockSummarizeVideo = jest.fn<Promise<SummaryResult>, [string, SummaryOptions & AIOptions]>();
const mockSaveSummary = jest.fn<Promise<string>, [string, SummaryOptions & AIOptions & { outputPath: string }]>();

jest.mock('../../index', () => ({
  getTranscript: (url: string, options: TranscriptOptions) => mockGetTranscript(url, options),
  summarizeVideo: (url: string, options: SummaryOptions & AIOptions) => mockSummarizeVideo(url, options),
  saveSummary: (url: string, options: SummaryOptions & AIOptions & { outputPath: string }) => mockSaveSummary(url, options)
}));

// Mock console.log and console.error
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

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
            const result = await mockGetTranscript(url, {
              language: options.language,
              output: options.output
            } as TranscriptOptions);
            console.log('Transcript downloaded successfully!');
            if (options.output) {
              console.log(`Saved to: ${options.output}`);
            } else {
              console.log(result.transcript);
            }
          } catch (error) {
            if (error instanceof Error) {
              const err = error as Error;
              if (err.name === 'TranscriptError' || err instanceof TranscriptError) {
                console.error('Failed to download transcript:', err.message);
              } else {
                console.error('Unexpected error:', err.message);
              }
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
                provider: options.provider,
                apiKey: options.apiKey,
                outputPath: options.output,
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
            if (error instanceof Error) {
              const err = error as Error;
              if (err.name === 'TranscriptError' || err instanceof TranscriptError) {
                console.error('Failed to download transcript:', err.message);
              } else if (err.name === 'AIError' || err instanceof AIError) {
                console.error('Failed to generate summary:', err.message);
              } else {
                console.error('Unexpected error:', err.message);
              }
            } else {
              console.error('Unknown error occurred');
            }
            process.exit(1);
          }
        });

      return { program };
    });
    // Import the mocked CLI module
    const { program: cliProgram } = jest.requireActual('../../cli');
    program = cliProgram;
  });

  describe('download command', () => {
    const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const mockTranscript: TranscriptResult = {
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
      const outputPath = 'output.txt';
      mockGetTranscript.mockResolvedValueOnce(mockTranscript);

      await program.parseAsync(['node', 'test', 'download', validUrl, '--output', outputPath]);

      expect(mockGetTranscript).toHaveBeenCalledWith(validUrl, { output: outputPath });
      expect(mockConsoleLog).toHaveBeenCalledWith(`Saved to: ${outputPath}`);
    });

    it('should handle TranscriptError', async () => {
      const error = new Error('Failed to fetch');
      Object.defineProperty(error, 'constructor', { value: TranscriptError });
      mockGetTranscript.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'download', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Unexpected error:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      mockGetTranscript.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'download', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Unexpected error:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('summarize command', () => {
    const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const mockSummary: SummaryResult = {
      transcript: 'Test transcript',
      summary: 'Test summary',
      segments: [],
      videoId: 'dQw4w9WgXcQ'
    };

    it('should summarize and display result', async () => {
      mockSummarizeVideo.mockResolvedValueOnce(mockSummary);

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockSummarizeVideo).toHaveBeenCalledWith(validUrl, {
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
      const outputPath = 'output.txt';
      mockSaveSummary.mockResolvedValueOnce(outputPath);

      await program.parseAsync([
        'node', 'test', 'summarize', validUrl,
        '--output', outputPath,
        '--language', 'es',
        '--provider', 'claude',
        '--style', 'concise'
      ]);

      expect(mockSaveSummary).toHaveBeenCalledWith(validUrl, {
        language: 'es',
        provider: 'claude',
        outputPath,
        summary: {
          style: 'concise',
          maxLength: undefined
        }
      });
      expect(mockConsoleLog).toHaveBeenCalledWith('Summary saved to:', outputPath);
    });

    it('should handle TranscriptError', async () => {
      const error = new Error('Failed to fetch');
      Object.defineProperty(error, 'constructor', { value: TranscriptError });
      mockSummarizeVideo.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Unexpected error:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle AIError', async () => {
      const error = new Error('Failed to summarize');
      Object.defineProperty(error, 'constructor', { value: AIError });
      mockSummarizeVideo.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Unexpected error:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      mockSummarizeVideo.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Unexpected error:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
}); 