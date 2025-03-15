import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatGPTProvider } from '../../../../src/services/providers/chatgpt.js';
import { AIError } from '../../../../src/types/ai.js';
import { TranscriptResult } from '../../../../src/types/transcript.js';

describe('ChatGPTProvider', () => {
  let provider: ChatGPTProvider;

  beforeEach(() => {
    provider = new ChatGPTProvider('test-openai-key');
    vi.clearAllMocks();
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  describe('initialization', () => {
    it('should create instance with API key', () => {
      expect(provider).toBeInstanceOf(ChatGPTProvider);
      expect(provider.name).toBe('chatgpt');
    });

    it('should throw error if API key is missing', () => {
      expect(() => new ChatGPTProvider('')).toThrow('OpenAI API key is required');
    });
  });

  describe('summarize', () => {
    const mockTranscript = 'Sample transcript for summarization';
    const mockResponse = {
      choices: [
        {
          message: {
            content: 'Generated summary of the video'
          }
        }
      ]
    };

    it('should generate summary successfully with default options', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await provider.summarize(mockTranscript);
      expect(result).toBe(mockResponse.choices[0].message.content);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-openai-key',
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('concise')
        })
      );
    });

    it('should use provided style and length options', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await provider.summarize(mockTranscript, {
        style: 'detailed',
        maxLength: 1000
      });

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody.messages[1].content).toContain('detailed');
      expect(requestBody.messages[1].content).toContain('1000');
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Rate limit exceeded'
      });

      await expect(provider.summarize(mockTranscript)).rejects.toThrow(AIError);
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      await expect(provider.summarize(mockTranscript)).rejects.toThrow(AIError);
    });

    it('should handle invalid API response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [] })
      });

      await expect(provider.summarize(mockTranscript)).rejects.toThrow('Invalid response from OpenAI API');
    });

    it('should include system message in API request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await provider.summarize(mockTranscript);

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody.messages[0]).toEqual({
        role: 'system',
        content: 'You are a helpful assistant that summarizes video transcripts accurately and concisely.'
      });
    });

    it('should use correct model and parameters', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      }) as unknown as typeof fetch;

      await provider.summarize(mockTranscript);

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody).toEqual(expect.objectContaining({
        model: 'gpt-4-turbo-preview',
        temperature: 0.3,
        max_tokens: 500
      }));
    });
  });
}); 