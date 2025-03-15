import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTranscript } from '../../../../src/services/transcript/index.js';
import { TranscriptError } from '../../../../src/errors.js';
import type { VideoInfo } from 'ytdl-core';

// Mock ytdl-core
vi.mock('ytdl-core', () => ({
  default: {
    getInfo: vi.fn(),
    getURLVideoID: vi.fn()
  }
}));

describe('Transcript Service', () => {
  const mockTranscriptData = [
    { text: 'First line', duration: 1, offset: 0 },
    { text: 'Second line', duration: 1, offset: 1 }
  ];

  const mockCaptionTrack = {
    baseUrl: 'https://example.com/captions',
    languageCode: 'en',
    name: { simpleText: 'English' },
    vssId: '.en',
    isTranslatable: true
  };

  const mockVideoInfo = {
    videoDetails: {
      videoId: 'dQw4w9WgXcQ',
      title: 'Test Video',
      lengthSeconds: '123',
      keywords: ['test'],
      channelId: 'test-channel',
      isOwnerViewing: false,
      isCrawlable: true,
      isPrivate: false,
      isUnpluggedCorpus: false,
      isLiveContent: false,
      author: 'Test Channel',
      thumbnails: [],
      description: 'Test video description',
      viewCount: '0',
      category: 'Test',
      publishDate: '2024-01-01',
      uploadDate: '2024-01-01',
      video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      storyboards: [],
      chapters: [],
      likes: null,
      dislikes: null,
      age_restricted: false,
      channel_url: 'https://youtube.com/c/testchannel',
      embed: {
        iframeUrl: '',
        flashUrl: '',
        width: 0,
        height: 0,
        flashSecureUrl: ''
      },
      isLive: false,
      isUpcoming: false
    },
    player_response: {
      captions: {
        playerCaptionsTracklistRenderer: {
          captionTracks: [mockCaptionTrack]
        }
      }
    }
  } as unknown as VideoInfo;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  describe('getTranscript', () => {
    describe('successful cases', () => {
      beforeEach(() => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
          ok: true,
          text: () => Promise.resolve(
            `<transcript>
              <text start="0" dur="1">First line</text>
              <text start="1" dur="1">Second line</text>
            </transcript>`
          )
        } as Response);
      });

      it('should fetch and format transcript correctly', async () => {
        const result = await getTranscript(mockVideoInfo);

        expect(result.transcript).toBe('First line\nSecond line');
        expect(result.segments).toEqual(mockTranscriptData);
        expect(result.videoId).toBe('dQw4w9WgXcQ');

        expect(global.fetch).toHaveBeenCalledWith(mockCaptionTrack.baseUrl);
      });

      it('should handle language option', async () => {
        const mockSpanishTrack = {
          ...mockCaptionTrack,
          languageCode: 'es',
          name: { simpleText: 'Spanish' },
          vssId: '.es'
        };

        const mockSpanishVideoInfo = {
          ...mockVideoInfo,
          player_response: {
            captions: {
              playerCaptionsTracklistRenderer: {
                captionTracks: [mockSpanishTrack, mockCaptionTrack]
              }
            }
          }
        } as unknown as VideoInfo;

        const result = await getTranscript(mockSpanishVideoInfo, { lang: 'es' });
        expect(result.videoId).toBe('dQw4w9WgXcQ');
        expect(global.fetch).toHaveBeenCalledWith(mockSpanishTrack.baseUrl);
      });

      it('should default to English if no language specified', async () => {
        const mockMultiLangVideoInfo = {
          ...mockVideoInfo,
          player_response: {
            captions: {
              playerCaptionsTracklistRenderer: {
                captionTracks: [
                  { ...mockCaptionTrack, languageCode: 'es' },
                  mockCaptionTrack,
                  { ...mockCaptionTrack, languageCode: 'fr' }
                ]
              }
            }
          }
        } as unknown as VideoInfo;

        const result = await getTranscript(mockMultiLangVideoInfo);
        expect(result.videoId).toBe('dQw4w9WgXcQ');
        expect(global.fetch).toHaveBeenCalledWith(mockCaptionTrack.baseUrl);
      });
    });

    describe('error cases', () => {
      it('should handle missing captions object', async () => {
        const mockVideoInfoNoCaptions = {
          ...mockVideoInfo,
          player_response: {
            captions: null
          }
        } as unknown as VideoInfo;

        await expect(getTranscript(mockVideoInfoNoCaptions))
          .rejects.toThrow('No captions available for this video');
      });

      it('should handle missing caption tracks', async () => {
        const mockVideoInfoNoTracks = {
          ...mockVideoInfo,
          player_response: {
            captions: {
              playerCaptionsTracklistRenderer: {
                captionTracks: []
              }
            }
          }
        } as unknown as VideoInfo;

        await expect(getTranscript(mockVideoInfoNoTracks))
          .rejects.toThrow('No caption tracks found');
      });

      it('should handle unavailable language', async () => {
        await expect(getTranscript(mockVideoInfo, { lang: 'fr' }))
          .rejects.toThrow('No captions found for language: fr');
      });

      it('should handle fetch errors', async () => {
        global.fetch = vi.fn().mockRejectedValue(
          new Error('Network Error')
        );
        await expect(getTranscript(mockVideoInfo))
          .rejects.toBeInstanceOf(TranscriptError);
      });

      it('should handle non-OK fetch response', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
          ok: false,
          statusText: 'Not Found'
        } as Response);

        await expect(getTranscript(mockVideoInfo))
          .rejects.toThrow('Failed to download caption track: Not Found');
      });

      it('should handle invalid XML response', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
          ok: true,
          text: () => Promise.resolve('Invalid XML')
        } as Response);

        const result = await getTranscript(mockVideoInfo);
        expect(result.segments).toEqual([]);
        expect(result.transcript).toBe('');
      });
    });
  });
}); 