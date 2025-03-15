import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTranscript } from '../../../../services/transcript/index.js';
import { TranscriptError } from '../../../../types/transcript.js';
import { YoutubeTranscript } from 'youtube-transcript';

// Mock the youtube-transcript module
vi.mock('youtube-transcript', () => ({
  YoutubeTranscript: {
    fetchTranscript: vi.fn()
  }
}));

// Mock the file handler
vi.mock('../../../../utils/fileHandler.js', () => ({
  saveToFile: vi.fn().mockImplementation(() => Promise.resolve('transcript.txt'))
}));

describe('Transcript Service', () => {
  const mockTranscriptData = [
    { text: 'First line', duration: 1000, offset: 0 },
    { text: 'Second line', duration: 1000, offset: 1000 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTranscript', () => {
    it('should fetch and format transcript correctly', async () => {
      (YoutubeTranscript.fetchTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(mockTranscriptData);

      const result = await getTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

      expect(result.transcript).toBe('First line\nSecond line');
      expect(result.segments).toEqual(mockTranscriptData);
      expect(YoutubeTranscript.fetchTranscript).toHaveBeenCalledWith('dQw4w9WgXcQ', { lang: undefined });
    });

    it('should handle language option', async () => {
      (YoutubeTranscript.fetchTranscript as ReturnType<typeof vi.fn>).mockResolvedValue(mockTranscriptData);

      await getTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { language: 'es' });

      expect(YoutubeTranscript.fetchTranscript).toHaveBeenCalledWith('dQw4w9WgXcQ', { lang: 'es' });
    });

    it('should throw TranscriptError for invalid URLs', async () => {
      await expect(getTranscript('invalid-url')).rejects.toThrow(TranscriptError);
    });

    it('should handle API errors', async () => {
      (YoutubeTranscript.fetchTranscript as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'));

      await expect(
        getTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      ).rejects.toThrow(TranscriptError);
    });
  });
}); 