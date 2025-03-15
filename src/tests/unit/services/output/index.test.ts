import { vi, describe, beforeEach, it, expect } from 'vitest';
import { writeFile, mkdir } from 'fs/promises';
import { formatAndSaveOutput } from '../../../../services/output/index.js';
import { TranscriptError } from '../../../../types/transcript.js';
import { AIError } from '../../../../types/ai.js';
import { OutputFormat } from '../../../../types/output.js';
import { join, dirname } from 'path';

vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn()
}));

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true)
}));

describe('Output Handler', () => {
  const mockTranscriptResult = {
    videoId: 'test123',
    transcript: 'Test transcript content',
    segments: [{
      text: 'Test transcript content',
      duration: 10,
      offset: 0
    }],
    metadata: {
      language: 'en',
      lastUpdated: '2024-03-15T00:00:00.000Z'
    }
  };

  const mockTitle = 'test-video';
  const mockOutputPath = join(process.cwd(), 'custom/path/output.txt');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15T00:00:00.000Z'));
  });

  describe('Formatting', () => {
    it('should format and save output as JSON', async () => {
      await formatAndSaveOutput(mockTranscriptResult, mockTitle, { format: OutputFormat.JSON });
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/test-video-2024-03-15T00-00-00\.000Z\.json$/),
        expect.stringContaining('"transcript": "Test transcript content"'),
        'utf8'
      );
    });

    it('should format and save output as text', async () => {
      await formatAndSaveOutput(mockTranscriptResult, mockTitle, { format: OutputFormat.TEXT });
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/test-video-2024-03-15T00-00-00\.000Z\.txt$/),
        'Test transcript content',
        'utf8'
      );
    });

    it('should handle errors and save them as JSON', async () => {
      const error = new TranscriptError('Test error');
      await formatAndSaveOutput(error, mockTitle, { format: OutputFormat.JSON });
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/test-video-2024-03-15T00-00-00\.000Z\.json$/),
        expect.stringContaining('"code": "TRANSCRIPT_ERROR"'),
        'utf8'
      );
    });

    it('should handle AI errors and save them as JSON', async () => {
      const error = new AIError('Test error');
      await formatAndSaveOutput(error, mockTitle, { format: OutputFormat.JSON });
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/test-video-2024-03-15T00-00-00\.000Z\.json$/),
        expect.stringContaining('"code": "AI_ERROR"'),
        'utf8'
      );
    });
  });

  describe('File Handling', () => {
    it('should create directory if it does not exist', async () => {
      vi.mock('fs', () => ({
        existsSync: vi.fn().mockReturnValue(false)
      }));

      await formatAndSaveOutput(mockTranscriptResult, mockTitle, { format: OutputFormat.JSON, outputPath: mockOutputPath });
      expect(mkdir).toHaveBeenCalledWith(dirname(mockOutputPath), { recursive: true });
    });

    it('should use provided output path', async () => {
      await formatAndSaveOutput(mockTranscriptResult, mockTitle, { format: OutputFormat.TEXT, outputPath: mockOutputPath });
      expect(writeFile).toHaveBeenCalledWith(
        mockOutputPath,
        expect.any(String),
        'utf8'
      );
    });
  });
}); 