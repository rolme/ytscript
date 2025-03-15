import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GoogleProvider } from '../../../../services/providers/google.js';
import { TranscriptError } from '../../../../types/transcript.js';
import { AIError } from '../../../../types/ai.js';

describe('GoogleProvider', () => {
  let provider: GoogleProvider;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    provider = new GoogleProvider(mockApiKey);
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create instance with API key', () => {
      expect(provider).toBeInstanceOf(GoogleProvider);
    });

    it('should throw error if API key is missing', () => {
      expect(() => new GoogleProvider('')).toThrow('Google API key is required');
    });
  });

  describe('getTranscript', () => {
    it('should fetch transcript successfully', async () => {
      const mockResponse = {
        data: {
          text: 'Test transcript',
          segments: [{ text: 'Test', duration: 1, offset: 0 }],
          videoId: 'test-video-id'
        }
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await provider.getTranscript('test-video-id');

      expect(result).toEqual({
        transcript: 'Test transcript',
        segments: [{ text: 'Test', duration: 1, offset: 0 }],
        videoId: 'test-video-id'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://www.googleapis.com/youtube/v3/captions?key=test-api-key'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: 'test-video-id' })
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: { message: 'Invalid request' } })
      });

      await expect(provider.getTranscript('test-video-id')).rejects.toThrow(TranscriptError);
    });

    it('should handle rate limiting', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } })
      });

      await expect(provider.getTranscript('test-video-id')).rejects.toThrow(TranscriptError);
    });

    it('should handle invalid response format', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} })
      });

      await expect(provider.getTranscript('test-video-id')).rejects.toThrow(TranscriptError);
    });
  });

  describe('summarize', () => {
    const mockGeminiResponse = {
      data: {
        candidates: [{
          content: {
            parts: [{
              text: 'Summary of the transcript'
            }]
          }
        }]
      }
    };

    it('should generate summary successfully', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeminiResponse)
      });

      const result = await provider.summarize('Sample transcript');

      expect(result).toBe('Summary of the transcript');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=test-api-key'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should use default options when none provided', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeminiResponse)
      });

      await provider.summarize('Sample transcript');

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody.generationConfig).toEqual({
        temperature: 0.3,
        topK: 32,
        topP: 1,
        maxOutputTokens: 1024
      });
    });

    it('should handle API errors in summarization', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: { message: 'Invalid request' } })
      });

      await expect(provider.summarize('Sample transcript')).rejects.toThrow(AIError);
    });

    it('should handle invalid summary response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} })
      });

      await expect(provider.summarize('Sample transcript')).rejects.toThrow(AIError);
    });
  });

  describe('callGoogleAPI', () => {
    it('should handle successful API response', async () => {
      const mockResponse = { data: 'test' };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await provider.callGoogleAPI({
        endpoint: 'test',
        baseUrl: 'https://api.test.com',
        params: { test: true }
      });

      expect(result).toEqual('test');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          }
        })
      );
    });

    it('should handle API error response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: { message: 'Bad Request' } })
      });

      await expect(provider.callGoogleAPI({
        endpoint: 'test',
        baseUrl: 'https://api.test.com',
        params: {}
      })).rejects.toThrow('API error: Bad Request');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network Error'));

      await expect(provider.callGoogleAPI({
        endpoint: 'test',
        baseUrl: 'https://api.test.com',
        params: {}
      })).rejects.toThrow('Network Error');
    });

    it('should handle non-OK response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.reject()
      });

      await expect(provider.callGoogleAPI({
        endpoint: 'test',
        baseUrl: 'https://api.test.com',
        params: {}
      })).rejects.toThrow('API error: Not Found');
    });
  });
}); 