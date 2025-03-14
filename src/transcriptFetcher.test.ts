/// <reference types="jest" />

import { getTranscript } from './transcriptFetcher';
import { TranscriptError } from './types';
import { YoutubeTranscript } from 'youtube-transcript';

// Mock the youtube-transcript module
jest.mock('youtube-transcript', () => ({
  YoutubeTranscript: {
    fetchTranscript: jest.fn()
  }
}));

// Mock the file handler
jest.mock('./utils/fileHandler', () => ({
  saveToFile: jest.fn().mockImplementation(() => Promise.resolve('transcript.txt'))
}));

describe('Transcript Fetcher', () => {
  const mockTranscriptData = [
    { text: 'First line', duration: 1000, offset: 0 },
    { text: 'Second line', duration: 1000, offset: 1000 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTranscript', () => {
    it('should fetch and format transcript correctly', async () => {
      (YoutubeTranscript.fetchTranscript as jest.Mock).mockResolvedValue(mockTranscriptData);

      const result = await getTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

      expect(result.transcript).toBe('First line\nSecond line');
      expect(result.segments).toEqual(mockTranscriptData);
      expect(YoutubeTranscript.fetchTranscript).toHaveBeenCalledWith('dQw4w9WgXcQ', { lang: undefined });
    });

    it('should handle language option', async () => {
      (YoutubeTranscript.fetchTranscript as jest.Mock).mockResolvedValue(mockTranscriptData);

      await getTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { language: 'es' });

      expect(YoutubeTranscript.fetchTranscript).toHaveBeenCalledWith('dQw4w9WgXcQ', { lang: 'es' });
    });

    it('should throw TranscriptError for invalid URLs', async () => {
      await expect(getTranscript('invalid-url')).rejects.toThrow(TranscriptError);
    });

    it('should handle API errors', async () => {
      (YoutubeTranscript.fetchTranscript as jest.Mock).mockRejectedValue(new Error('API Error'));

      await expect(
        getTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      ).rejects.toThrow(TranscriptError);
    });
  });
}); 