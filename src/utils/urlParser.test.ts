import { validateUrl, extractVideoId } from './urlParser';
import { TranscriptError } from '../types/transcript';

describe('URL Parser', () => {
  describe('validateUrl', () => {
    it('should validate correct YouTube URLs', () => {
      const validUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/embed/dQw4w9WgXcQ'
      ];

      validUrls.forEach(url => {
        expect(validateUrl(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'https://www.youtube.com',
        'https://www.google.com',
        'not a url',
        'https://youtube.com/watch',
        'https://youtube.com/watch?'
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
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
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
        'https://www.google.com',
        'not a url'
      ];

      invalidUrls.forEach(url => {
        expect(() => extractVideoId(url)).toThrow(TranscriptError);
      });
    });
  });
}); 