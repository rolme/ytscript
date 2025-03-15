import { vi, describe, beforeEach, it, expect } from 'vitest';
import { writeFile } from 'fs/promises';
import { getVideoId } from '../../utils/videoId.js';
import { getTranscript } from '../../services/transcript/index.js';
import { download } from '../../cli/commands/download.js';
import ytdl from 'ytdl-core';

vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../../utils/videoId.js', () => ({
  getVideoId: vi.fn().mockReturnValue('test123')
}));

vi.mock('ytdl-core', () => ({
  default: {
    getInfo: vi.fn().mockResolvedValue({
      videoDetails: {
        title: 'Test Video',
        videoId: 'test123'
      }
    })
  }
}));

vi.mock('../../services/transcript/index.js', () => ({
  getTranscript: vi.fn().mockResolvedValue({
    videoId: 'test123',
    transcript: 'Test transcript',
    segments: []
  })
}));

describe('CLI', () => {
  describe('download command', () => {
    let mockConsoleLog: ReturnType<typeof vi.spyOn>;
    let mockConsoleError: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with: ${code}`);
      });
      vi.clearAllMocks();
    });

    it('should download transcript with default options', async () => {
      await download('https://www.youtube.com/watch?v=test123');

      expect(getVideoId).toHaveBeenCalledWith('https://www.youtube.com/watch?v=test123');
      expect(ytdl.getInfo).toHaveBeenCalledWith('test123');
      expect(getTranscript).toHaveBeenCalledWith(
        expect.objectContaining({
          videoDetails: {
            title: 'Test Video',
            videoId: 'test123'
          }
        }),
        expect.any(Object)
      );
      expect(writeFile).toHaveBeenCalledWith(
        'transcript_test123.txt',
        'Test transcript'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('Transcript saved to transcript_test123.txt');
    });

    it('should download transcript with specified language', async () => {
      await download('https://www.youtube.com/watch?v=test123', { language: 'es' });

      expect(getTranscript).toHaveBeenCalledWith(
        expect.objectContaining({
          videoDetails: {
            title: 'Test Video',
            videoId: 'test123'
          }
        }),
        expect.objectContaining({
          lang: 'es'
        })
      );
      expect(writeFile).toHaveBeenCalledWith(
        'transcript_test123.txt',
        'Test transcript'
      );
    });

    it('should download transcript with JSON format', async () => {
      await download('https://www.youtube.com/watch?v=test123', { format: 'json' });

      expect(getTranscript).toHaveBeenCalledWith(
        expect.objectContaining({
          videoDetails: {
            title: 'Test Video',
            videoId: 'test123'
          }
        }),
        expect.objectContaining({
          format: 'json'
        })
      );
      expect(writeFile).toHaveBeenCalledWith(
        'transcript_test123.json',
        expect.stringContaining('"transcript": "Test transcript"')
      );
    });

    it('should handle transcript errors', async () => {
      vi.mocked(getTranscript).mockRejectedValueOnce(new Error('Failed to fetch transcript'));
      await expect(download('https://www.youtube.com/watch?v=test123')).rejects.toThrow('Process.exit called with: 1');
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to download transcript:', 'Failed to fetch transcript');
    });

    it('should handle invalid YouTube URLs', async () => {
      vi.mocked(getVideoId).mockImplementationOnce(() => {
        throw new Error('Invalid YouTube URL');
      });

      await expect(download('invalid-url')).rejects.toThrow('Process.exit called with: 1');
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to download transcript:', 'Invalid YouTube URL');
    });
  });
}); 