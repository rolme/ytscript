import { Command } from 'commander';
import type { TranscriptResult } from '../../types/transcript.js';
import { TranscriptError } from '../../types/transcript.js';
import { AIError } from '../../types/ai.js';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { getTranscript } from '../../services/transcript/index.js';
import { summarizeVideo, saveSummary } from '../../index.js';

// Define the SummaryResult type that combines TranscriptResult with summary
interface SummaryResult extends TranscriptResult {
  summary: string;
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
  summarizeVideo: vi.fn(),
  saveSummary: vi.fn()
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
const mockSaveSummary = vi.mocked(saveSummary);

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
      const error = new TranscriptError('Failed to fetch');
      mockGetTranscript.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'download', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Failed to download transcript:', error.message);
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
    const mockResult: SummaryResult = {
      transcript: 'Test transcript',
      summary: 'Test summary',
      segments: [],
      videoId: 'dQw4w9WgXcQ'
    };

    it('should summarize and display result', async () => {
      mockSummarizeVideo.mockResolvedValueOnce({
        transcript: 'Test transcript',
        summary: 'Test summary',
        videoId: 'test123',
        provider: 'chatgpt',
        segments: []
      });

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockSummarizeVideo).toHaveBeenCalledWith(validUrl, {
        summary: {
          style: undefined,
          maxLength: undefined
        }
      });
      expect(mockConsoleLog).toHaveBeenCalledWith('\nOriginal Transcript:');
      expect(mockConsoleLog).toHaveBeenCalledWith(mockResult.transcript);
      expect(mockConsoleLog).toHaveBeenCalledWith('\nSummary:');
      expect(mockConsoleLog).toHaveBeenCalledWith(mockResult.summary);
    });

    it('should handle all options', async () => {
      mockSummarizeVideo.mockResolvedValueOnce({
        transcript: 'Test transcript',
        summary: 'Test summary',
        videoId: 'test123',
        provider: 'chatgpt',
        segments: []
      });

      await program.parseAsync([
        'node', 'test', 'summarize', validUrl,
        '--language', 'es',
        '--provider', 'chatgpt',
        '--api-key', 'test-key',
        '--style', 'detailed',
        '--max-length', '200'
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
    });

    it('should handle output option', async () => {
      const outputPath = 'output.txt';
      mockSaveSummary.mockResolvedValueOnce(outputPath);

      await program.parseAsync(['node', 'test', 'summarize', validUrl, '--output', outputPath]);

      expect(mockSaveSummary).toHaveBeenCalledWith(validUrl, {
        outputPath,
        summary: {
          style: undefined,
          maxLength: undefined
        }
      });
      expect(mockConsoleLog).toHaveBeenCalledWith('Summary saved to:', outputPath);
    });

    it('should handle TranscriptError', async () => {
      const error = new TranscriptError('Failed to fetch');
      mockSummarizeVideo.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Failed to download transcript:', error.message);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle AIError', async () => {
      const error = new AIError('AI error');
      mockSummarizeVideo.mockRejectedValueOnce(error);

      await program.parseAsync(['node', 'test', 'summarize', validUrl]);

      expect(mockConsoleError).toHaveBeenCalledWith('Failed to generate summary:', error.message);
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