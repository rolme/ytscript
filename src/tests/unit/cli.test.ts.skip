import { Command } from 'commander';
import type { TranscriptResult } from '../../types/transcript.js';
import { TranscriptError } from '../../types/transcript.js';
import { AIError } from '../../types/ai.js';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { getTranscript } from '../../services/transcript/index.js';
import { summarizeVideo } from '../../index.js';
import { formatAndSaveOutput } from '../../services/output/index.js';
import { getTitleFromUrl } from '../../utils/titleFetcher.js';

// Define the SummaryResult type that combines TranscriptResult with summary
interface SummaryResult extends TranscriptResult {
  summary: string;
  provider: string;
}

// Mock package.json
vi.mock('../../../package.json', () => ({
  version: '1.0.0'
}));

// Mock dotenv
vi.mock('dotenv', () => ({
  default: {
    config: vi.fn()
  },
  config: vi.fn()
}));

// Mock the transcript service
vi.mock('../../services/transcript/index.js', () => ({
  getTranscript: vi.fn()
}));

// Mock the index module
vi.mock('../../index.js', () => ({
  summarizeVideo: vi.fn()
}));

// Mock the output service
vi.mock('../../services/output/index.js', () => ({
  formatAndSaveOutput: vi.fn()
}));

// Mock the title fetcher
vi.mock('../../utils/titleFetcher.js', () => ({
  getTitleFromUrl: vi.fn()
}));

// Mock the transcript types module
vi.mock('../../types/transcript.js', () => ({
  TranscriptError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TranscriptError';
    }
  }
}));

// Mock the AI types module
vi.mock('../../types/ai.js', () => ({
  AIError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AIError';
    }
  }
}));

// Import the mocked functions
const mockGetTranscript = vi.mocked(getTranscript);
const mockSummarizeVideo = vi.mocked(summarizeVideo);
const mockFormatAndSaveOutput = vi.mocked(formatAndSaveOutput);
const mockGetTitleFromUrl = vi.mocked(getTitleFromUrl);

// Mock console.log and console.error
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

describe('CLI', () => {
  let program: Command;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset modules to get a fresh instance of the program
    vi.resetModules();
    // Import the mocked CLI module
    const { program: cliProgram } = await import('../../cli.js');
    program = cliProgram;
  });

  describe('download command', () => {
    const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const mockTitle = 'Test Video';
    const mockTranscript: TranscriptResult = {
      transcript: 'Test transcript',
      segments: [],
      videoId: 'dQw4w9WgXcQ'
    };

    beforeEach(() => {
      mockGetTitleFromUrl.mockResolvedValue(mockTitle);
      mockFormatAndSaveOutput.mockResolvedValue('output.txt');
    });

    it('should download and display transcript', async () => {
      mockGetTranscript.mockResolvedValueOnce(mockTranscript);

      await program.parseAsync(['node', 'test', 'download', validUrl]);

      expect(mockGetTranscript).toHaveBeenCalledWith(validUrl, { language: undefined });
      expect(mockGetTitleFromUrl).toHaveBeenCalledWith(validUrl);
      expect(mockFormatAndSaveOutput).toHaveBeenCalledWith(mockTranscript, mockTitle, {
        format: 'text',
        outputPath: undefined,
        language: undefined
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(mockTranscript.transcript);
    });

    it('should handle language option', async () => {
      mockGetTranscript.mockResolvedValueOnce(mockTranscript);

      await program.parseAsync(['node', 'test', 'download', validUrl, '--language', 'es']);

      expect(mockGetTranscript).toHaveBeenCalledWith(validUrl, { language: 'es' });
      expect(mockGetTitleFromUrl).toHaveBeenCalledWith(validUrl);
      expect(mockFormatAndSaveOutput).toHaveBeenCalledWith(mockTranscript, mockTitle, {
        format: 'text',
        outputPath: undefined,
        language: 'es'
      });
    });

    it('should handle output option', async () => {
      const outputPath = 'output.txt';
      mockGetTranscript.mockResolvedValueOnce(mockTranscript);
      mockFormatAndSaveOutput.mockResolvedValueOnce(outputPath);

      await program.parseAsync(['node', 'test', 'download', validUrl, '--output', outputPath]);

      expect(mockGetTranscript).toHaveBeenCalledWith(validUrl, { language: undefined });
      expect(mockGetTitleFromUrl).toHaveBeenCalledWith(validUrl);
      expect(mockFormatAndSaveOutput).toHaveBeenCalledWith(mockTranscript, mockTitle, {
        format: 'text',
        outputPath,
        language: undefined
      });
      expect(mockConsoleLog).toHaveBeenCalledWith('Transcript saved to:', outputPath);
    });

    it('should handle json format option', async () => {
      mockGetTranscript.mockResolvedValueOnce(mockTranscript);

      await program.parseAsync(['node', 'test', 'download', validUrl, '--format', 'json']);

      expect(mockGetTranscript).toHaveBeenCalledWith(validUrl, { language: undefined });
      expect(mockGetTitleFromUrl).toHaveBeenCalledWith(validUrl);
      expect(mockFormatAndSaveOutput).toHaveBeenCalledWith(mockTranscript, mockTitle, {
        format: 'json',
        outputPath: undefined,
        language: undefined
      });

      const response = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(response).toEqual({
        success: true,
        data: {
          videoId: mockTranscript.videoId,
          transcript: mockTranscript.transcript,
          segments: mockTranscript.segments,
          metadata: {
            timestamp: expect.any(String),
            options: { language: undefined }
          }
        }
      });
    });

    it('should handle TranscriptError with json format', async () => {
      const error = new TranscriptError('Failed to fetch');
      mockGetTranscript.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'download', validUrl, '--format', 'json']);

      expect(mockConsoleError).toHaveBeenCalledWith(JSON.stringify({
        success: false,
        error: {
          code: 'TRANSCRIPT_ERROR',
          message: 'Failed to fetch'
        }
      }, null, 2));
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle TranscriptError with text format', async () => {
      const error = new TranscriptError('Failed to fetch');
      mockGetTranscript.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'download', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Failed to download transcript:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle unexpected errors with text format', async () => {
      const error = new Error('Unexpected error');
      mockGetTranscript.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'download', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Unexpected error:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('summarize command', () => {
    const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const mockTitle = 'Test Video';
    const mockResult: SummaryResult = {
      transcript: 'Test transcript',
      summary: 'Test summary',
      segments: [],
      videoId: 'dQw4w9WgXcQ',
      provider: 'chatgpt'
    };

    beforeEach(() => {
      mockGetTitleFromUrl.mockResolvedValue(mockTitle);
      mockFormatAndSaveOutput.mockResolvedValue('output.txt');
    });

    it('should summarize and display result', async () => {
      mockSummarizeVideo.mockResolvedValueOnce(mockResult);

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
      expect(mockGetTitleFromUrl).toHaveBeenCalledWith(validUrl);
      expect(mockFormatAndSaveOutput).toHaveBeenCalledWith(mockResult, mockTitle, {
        format: 'text',
        outputPath: undefined,
        language: undefined,
        provider: undefined,
        style: undefined,
        maxLength: undefined
      }, mockResult.summary);
      expect(mockConsoleLog).toHaveBeenCalledWith('\nOriginal Transcript:');
      expect(mockConsoleLog).toHaveBeenCalledWith(mockResult.transcript);
      expect(mockConsoleLog).toHaveBeenCalledWith('\nSummary:');
      expect(mockConsoleLog).toHaveBeenCalledWith(mockResult.summary);
    });

    it('should handle all options', async () => {
      mockSummarizeVideo.mockResolvedValueOnce(mockResult);

      await program.parseAsync([
        'node', 'test', 'summarize', validUrl,
        '--language', 'es',
        '--provider', 'chatgpt',
        '--api-key', 'test-key',
        '--style', 'detailed',
        '--max-length', '200',
        '--format', 'json'
      ]);

      expect(mockSummarizeVideo).toHaveBeenCalledWith(validUrl, {
        language: 'es',
        provider: 'chatgpt',
        apiKey: 'test-key',
        summary: {
          style: 'detailed',
          maxLength: 200
        }
      });
      expect(mockGetTitleFromUrl).toHaveBeenCalledWith(validUrl);
      expect(mockFormatAndSaveOutput).toHaveBeenCalledWith(mockResult, mockTitle, {
        format: 'json',
        outputPath: undefined,
        language: 'es',
        provider: 'chatgpt',
        style: 'detailed',
        maxLength: 200
      }, mockResult.summary);

      const response = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(response).toEqual({
        success: true,
        data: {
          videoId: mockResult.videoId,
          transcript: mockResult.transcript,
          segments: mockResult.segments,
          summary: mockResult.summary,
          metadata: {
            timestamp: expect.any(String),
            options: {
              language: 'es',
              provider: 'chatgpt',
              style: 'detailed',
              maxLength: 200
            }
          }
        }
      });
    });

    it('should handle output option', async () => {
      const outputPath = 'output.txt';
      mockSummarizeVideo.mockResolvedValueOnce(mockResult);
      mockFormatAndSaveOutput.mockResolvedValueOnce(outputPath);

      await program.parseAsync(['node', 'test', 'summarize', validUrl, '--output', outputPath]);

      expect(mockSummarizeVideo).toHaveBeenCalledWith(validUrl, {
        language: undefined,
        provider: undefined,
        apiKey: undefined,
        summary: {
          style: undefined,
          maxLength: undefined
        }
      });
      expect(mockGetTitleFromUrl).toHaveBeenCalledWith(validUrl);
      expect(mockFormatAndSaveOutput).toHaveBeenCalledWith(mockResult, mockTitle, {
        format: 'text',
        outputPath,
        language: undefined,
        provider: undefined,
        style: undefined,
        maxLength: undefined
      }, mockResult.summary);
      expect(mockConsoleLog).toHaveBeenCalledWith('Summary saved to:', outputPath);
    });

    it('should handle TranscriptError with json format', async () => {
      const error = new TranscriptError('Failed to fetch');
      mockSummarizeVideo.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'summarize', validUrl, '--format', 'json']);

      expect(mockConsoleError).toHaveBeenCalledWith(JSON.stringify({
        success: false,
        error: {
          code: 'TRANSCRIPT_ERROR',
          message: 'Failed to fetch'
        }
      }, null, 2));
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle AIError with json format', async () => {
      const error = new AIError('AI error');
      mockSummarizeVideo.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'summarize', validUrl, '--format', 'json']);

      expect(mockConsoleError).toHaveBeenCalledWith(JSON.stringify({
        success: false,
        error: {
          code: 'AI_ERROR',
          message: 'AI error'
        }
      }, null, 2));
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle TranscriptError with text format', async () => {
      const error = new TranscriptError('Failed to fetch');
      mockSummarizeVideo.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Failed to download transcript:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle AIError with text format', async () => {
      const error = new AIError('AI error');
      mockSummarizeVideo.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Failed to generate summary:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle unexpected errors with text format', async () => {
      const error = new Error('Unexpected error');
      mockSummarizeVideo.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Unexpected error:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
}); 