import { describe, it, expect } from 'vitest';
import { getVideoId } from '../../../utils/videoId.js';

describe('Video ID Utility', () => {
  it('should extract video ID from standard YouTube URL', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    expect(getVideoId(url)).toBe('dQw4w9WgXcQ');
  });

  it('should extract video ID from short YouTube URL', () => {
    const url = 'https://youtu.be/dQw4w9WgXcQ';
    expect(getVideoId(url)).toBe('dQw4w9WgXcQ');
  });

  it('should extract video ID from embed URL', () => {
    const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    expect(getVideoId(url)).toBe('dQw4w9WgXcQ');
  });

  it('should throw error for invalid YouTube URL', () => {
    const url = 'https://example.com/video';
    expect(() => getVideoId(url)).toThrow('Invalid YouTube URL');
  });
}); 