import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTranscript } from '../../../../services/transcript/index.js';
import { TranscriptError } from '../../../../types/transcript.js';
import type { VideoInfo } from 'ytdl-core';

vi.mock('ytdl-core', () => {
  return {
    default: {
      getInfo: vi.fn()
    }
  };
});

const ytdl = await import('ytdl-core');

describe('Transcript Service', () => {
  const mockTranscriptData = [
    { text: 'First line', duration: 1, offset: 0 },
    { text: 'Second line', duration: 1, offset: 1 }
  ];

  const mockCaptionTrack = {
    baseUrl: 'https://example.com/captions',
    languageCode: 'en',
    name: { simpleText: 'English' }
  };

  const mockVideoInfo: Partial<VideoInfo> = {
    player_response: {
      captions: {
        playerCaptionsTracklistRenderer: {
          captionTracks: [mockCaptionTrack]
        }
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('getTranscript', () => {
    it('should fetch and format transcript correctly', async () => {
      (ytdl.default.getInfo as ReturnType<typeof vi.fn>).mockResolvedValue(mockVideoInfo);
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(
          `<transcript>
            <text start="0" dur="1">First line</text>
            <text start="1" dur="1">Second line</text>
          </transcript>`
        )
      });

      const result = await getTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

      expect(result.transcript).toBe('First line Second line');
      expect(result.segments).toEqual(mockTranscriptData);
      expect(ytdl.default.getInfo).toHaveBeenCalledWith('dQw4w9WgXcQ');
    });

    it('should handle language option', async () => {
      const mockSpanishTrack = {
        ...mockCaptionTrack,
        languageCode: 'es'
      };

      (ytdl.default.getInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
        player_response: {
          captions: {
            playerCaptionsTracklistRenderer: {
              captionTracks: [mockSpanishTrack]
            }
          }
        }
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(
          `<transcript>
            <text start="0" dur="1">Primera línea</text>
            <text start="1" dur="1">Segunda línea</text>
          </transcript>`
        )
      });

      await getTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { language: 'es' });
      expect(ytdl.default.getInfo).toHaveBeenCalledWith('dQw4w9WgXcQ');
    });

    it('should throw TranscriptError for invalid URLs', async () => {
      await expect(getTranscript('invalid-url')).rejects.toThrow(TranscriptError);
    });

    it('should handle API errors', async () => {
      (ytdl.default.getInfo as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'));
      await expect(
        getTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      ).rejects.toThrow(TranscriptError);
    });
  });
}); 