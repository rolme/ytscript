import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatAndSaveOutput } from '../../../../services/output/index.js';
import { TranscriptError } from '../../../../types/transcript.js';
import { AIError } from '../../../../types/ai.js';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Mock fs modules
vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn()
}));

vi.mock('fs', () => ({
  existsSync: vi.fn()
}));

describe('Output Handler Service', () => {
  const mockTranscriptResult = {
    videoId: 'test123',
    transcript: 'Test transcript content',
    segments: [
      { text: 'Test', duration: 1, offset: 0 }
    ]
  };

  const mockTitle = 'test-video';
  const mockSummary = 'Test summary';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-03-15T00:00:00.000Z');
    (existsSync as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Text Output', () => {
    it('should format transcript only output as text', async () => {
      await formatAndSaveOutput(mockTranscriptResult, mockTitle);

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('test-video-2024-03-15T00-00-00-000Z.txt'),
        'Test transcript content',
        'utf8'
      );
    });

    it('should format transcript and summary as text', async () => {
      await formatAndSaveOutput(mockTranscriptResult, mockTitle, {}, mockSummary);

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.txt'),
        'Original Transcript:\nTest transcript content\n\nSummary:\nTest summary',
        'utf8'
      );
    });

    it('should format error as text', async () => {
      const error = new TranscriptError('Test error');
      await formatAndSaveOutput(error, mockTitle);

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.txt'),
        'Error: Test error',
        'utf8'
      );
    });
  });

  describe('JSON Output', () => {
    it('should format transcript as JSON', async () => {
      await formatAndSaveOutput(mockTranscriptResult, mockTitle, { format: 'json' });

      const expectedJson = {
        success: true,
        data: {
          videoId: 'test123',
          transcript: 'Test transcript content',
          segments: [{ text: 'Test', duration: 1, offset: 0 }],
          metadata: {
            timestamp: '2024-03-15T00:00:00.000Z',
            options: {}
          }
        }
      };

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.json'),
        JSON.stringify(expectedJson, null, 2),
        'utf8'
      );
    });

    it('should format transcript and summary as JSON', async () => {
      await formatAndSaveOutput(
        mockTranscriptResult,
        mockTitle,
        { format: 'json', language: 'en', provider: 'chatgpt' },
        mockSummary
      );

      const expectedJson = {
        success: true,
        data: {
          videoId: 'test123',
          transcript: 'Test transcript content',
          segments: [{ text: 'Test', duration: 1, offset: 0 }],
          summary: 'Test summary',
          metadata: {
            timestamp: '2024-03-15T00:00:00.000Z',
            options: {
              language: 'en',
              provider: 'chatgpt'
            }
          }
        }
      };

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.json'),
        JSON.stringify(expectedJson, null, 2),
        'utf8'
      );
    });

    it('should format error as JSON', async () => {
      const error = new TranscriptError('Test error');
      await formatAndSaveOutput(error, mockTitle, { format: 'json' });

      const expectedJson = {
        success: false,
        error: {
          code: 'TRANSCRIPT_ERROR',
          message: 'Test error'
        }
      };

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.json'),
        JSON.stringify(expectedJson, null, 2),
        'utf8'
      );
    });

    it('should handle AI errors correctly', async () => {
      const error = new AIError('AI service error');
      await formatAndSaveOutput(error, mockTitle, { format: 'json' });

      const expectedJson = {
        success: false,
        error: {
          code: 'AI_ERROR',
          message: 'AI service error'
        }
      };

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.json'),
        JSON.stringify(expectedJson, null, 2),
        'utf8'
      );
    });
  });

  describe('File Handling', () => {
    it('should create directory if it does not exist', async () => {
      (existsSync as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
      await formatAndSaveOutput(mockTranscriptResult, mockTitle, {
        outputPath: '/test/path/output.txt'
      });

      expect(mkdir).toHaveBeenCalledWith('/test/path', { recursive: true });
    });

    it('should use correct extension for JSON output', async () => {
      await formatAndSaveOutput(mockTranscriptResult, mockTitle, {
        format: 'json',
        outputPath: 'output.txt'
      });

      expect(writeFile).toHaveBeenCalledWith(
        'output.json',
        expect.any(String),
        'utf8'
      );
    });

    it('should use correct extension for text output', async () => {
      await formatAndSaveOutput(mockTranscriptResult, mockTitle, {
        format: 'text',
        outputPath: 'output.json'
      });

      expect(writeFile).toHaveBeenCalledWith(
        'output.txt',
        expect.any(String),
        'utf8'
      );
    });

    it('should generate filename if outputPath is not provided', async () => {
      await formatAndSaveOutput(mockTranscriptResult, mockTitle);

      expect(writeFile).toHaveBeenCalledWith(
        join(process.cwd(), 'test-video-2024-03-15T00-00-00-000Z.txt'),
        expect.any(String),
        'utf8'
      );
    });
  });
}); 