import { describe, it, expect, vi } from 'vitest';
import { getTitleFromUrl } from '../../../utils/titleFetcher.js';
import { getInfo } from 'ytdl-core';

vi.mock('ytdl-core', () => ({
  getInfo: vi.fn()
}));

describe('Title Fetcher Utility', () => {
  it('should fetch video title from URL', async () => {
    const mockTitle = 'Test Video Title';
    const mockVideoId = 'dQw4w9WgXcQ';
    const url = `https://www.youtube.com/watch?v=${mockVideoId}`;

    (getInfo as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      videoDetails: {
        title: mockTitle
      }
    });

    const title = await getTitleFromUrl(url);
    expect(title).toBe(mockTitle);
    expect(getInfo).toHaveBeenCalledWith(mockVideoId);
  });

  it('should throw error for invalid YouTube URL', async () => {
    const url = 'https://example.com/video';
    await expect(getTitleFromUrl(url)).rejects.toThrow('Invalid YouTube URL');
  });

  it('should throw error when ytdl-core fails', async () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const error = new Error('Failed to fetch video info');
    (getInfo as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    await expect(getTitleFromUrl(url)).rejects.toThrow(error);
  });
}); 