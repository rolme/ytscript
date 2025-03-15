import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTitleFromUrl } from '../../../utils/titleFetcher.js';

vi.mock('ytdl-core', () => {
  return {
    default: {
      getInfo: vi.fn()
    }
  };
});

const ytdl = await import('ytdl-core');

describe('getTitleFromUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch the video title from a URL', async () => {
    const mockTitle = 'Test Video Title';
    (ytdl.default.getInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
      videoDetails: { title: mockTitle }
    });

    const result = await getTitleFromUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result).toBe(mockTitle);
  });

  it('should throw an error for invalid YouTube URL', async () => {
    await expect(getTitleFromUrl('invalid-url')).rejects.toThrow('Invalid YouTube URL');
  });

  it('should handle failures from ytdl-core', async () => {
    (ytdl.default.getInfo as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'));
    await expect(getTitleFromUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).rejects.toThrow('Failed to fetch video title');
  });
}); 