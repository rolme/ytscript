import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClaudeProvider } from '../../../../src/services/providers/claude.js';
import { AIError } from '../../../../src/types/ai.js';

describe('ClaudeProvider', () => {
  let provider: ClaudeProvider;

  beforeEach(() => {
    provider = new ClaudeProvider('test-anthropic-key');
    vi.clearAllMocks();
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  describe('initialization', () => {
    it('should create instance with API key', () => {
      expect(provider).toBeInstanceOf(ClaudeProvider);
      expect(provider.name).toBe('claude');
    });

    it('should throw error if API key is missing', () => {
      expect(() => new ClaudeProvider('')).toThrow('Anthropic API key is required');
    });
  });

  describe('summarize', () => {
    const mockTranscript = 'Sample transcript for summarization';
    const mockResponse = {
      content: [
        {
          text: 'Generated summary of the video'
        }
      ]
    };

    it('should generate summary successfully with default options', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      }) as unknown as typeof fetch;

      const result = await provider.summarize(mockTranscript);
      expect(result).toBe(mockResponse.content[0].text);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'x-api-key': 'test-anthropic-key',
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
            'anthropic-client': 'ytscript/2.0.2'
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
      expect(requestBody.messages[0].content).toContain('detailed');
      expect(requestBody.messages[0].content).toContain('1000');
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
        json: () => Promise.resolve({ content: [] })
      });

      await expect(provider.summarize(mockTranscript)).rejects.toThrow('Invalid response from Claude API');
    });

    it('should use correct model and parameters', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await provider.summarize(mockTranscript);

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody).toEqual(expect.objectContaining({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user'
          })
        ])
      }));
    });

    it('should include key points instruction in prompt', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await provider.summarize(mockTranscript);

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody.messages[0].content).toContain('Focus on extracting the key points and main ideas');
    });
  });
}); 