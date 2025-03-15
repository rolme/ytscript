import { describe, it, expect } from 'vitest';
import { validateUrl, extractVideoId } from './urlParser.js';
import { TranscriptError } from '../types/transcript.js';

describe('URL Parser', () => {
  describe('validateUrl', () => {
    it('should validate correct YouTube URLs', () => {
      const validUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=123'
      ];

      validUrls.forEach(url => {
        expect(validateUrl(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'https://www.youtube.com',
        'https://www.youtube.com/watch',
        'https://www.youtube.com/watch?',
        'https://www.youtube.com/watch?v=',
        'https://www.vimeo.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/playlist?list=123',
        'invalid-url'
      ];

      invalidUrls.forEach(url => {
        expect(validateUrl(url)).toBe(false);
      });
    });
  });

  describe('extractVideoId', () => {
    it('should extract video ID from valid URLs', () => {
      const testCases = [
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ'
        },
        {
          url: 'https://youtu.be/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ'
        },
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share',
          expected: 'dQw4w9WgXcQ'
        },
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=123',
          expected: 'dQw4w9WgXcQ'
        }
      ];

      testCases.forEach(({ url, expected }) => {
        expect(extractVideoId(url)).toBe(expected);
      });
    });

    it('should throw TranscriptError for invalid URLs', () => {
      const invalidUrls = [
        'https://www.youtube.com',
        'https://www.youtube.com/watch',
        'https://www.youtube.com/watch?',
        'https://www.youtube.com/watch?v=',
        'https://www.vimeo.com/watch?v=dQw4w9WgXcQ',
        'invalid-url'
      ];

      invalidUrls.forEach(url => {
        expect(() => extractVideoId(url)).toThrow(TranscriptError);
      });
    });
  });
}); 