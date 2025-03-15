import { describe, it, expect } from 'vitest';
import { validateUrl, getVideoId } from '../../../src/utils/urlParser.js';
import { TranscriptError } from '../../../src/errors.js';

describe('urlParser', () => {
  describe('getVideoId', () => {
    it('should extract video ID from standard YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(getVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should throw TranscriptError for invalid URL', () => {
      const url = 'invalid-url';
      expect(() => getVideoId(url)).toThrow(TranscriptError);
    });

    it('should throw TranscriptError for URL without video ID', () => {
      const url = 'https://www.youtube.com/watch';
      expect(() => getVideoId(url)).toThrow(TranscriptError);
    });
  });

  describe('validateUrl', () => {
    it('should return true for valid YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(validateUrl(url)).toBe(true);
    });

    it('should return false for invalid URL', () => {
      const url = 'invalid-url';
      expect(validateUrl(url)).toBe(false);
    });

    it('should return false for URL without video ID', () => {
      const url = 'https://www.youtube.com/watch';
      expect(validateUrl(url)).toBe(false);
    });
  });
}); 