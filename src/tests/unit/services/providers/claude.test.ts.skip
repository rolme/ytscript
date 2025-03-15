import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClaudeProvider } from '../../../../services/providers/claude.js';

const mockCreate = vi.fn();
const mockClient = {
  messages: {
    create: mockCreate
  }
};

vi.mock('@anthropic-ai/sdk', () => ({
  Anthropic: vi.fn().mockImplementation(() => mockClient)
}));

describe('ClaudeProvider', () => {
  const mockApiKey = 'test-api-key';
  let provider: ClaudeProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new ClaudeProvider(mockApiKey);
  });

  describe('initialization', () => {
    it('should throw error if API key is not provided', () => {
      expect(() => new ClaudeProvider('')).toThrow('Anthropic API key is required');
    });

    it('should create instance with valid API key', () => {
      expect(provider).toBeInstanceOf(ClaudeProvider);
    });
  });

  describe('summarize', () => {
    it('should return summary for concise style', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Test summary' }]
      });

      const result = await provider.summarize('Test text');
      expect(result).toBe('Test summary');
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'claude-3-opus-20240229',
        max_tokens: 500,
        messages: [
          { role: 'user', content: 'Provide a concise summary of the following transcript:\n\nTest text' }
        ]
      });
    });

    it('should return summary for detailed style', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Detailed summary' }]
      });

      const result = await provider.summarize('Test text', { style: 'detailed' });
      expect(result).toBe('Detailed summary');
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'claude-3-opus-20240229',
        max_tokens: 500,
        messages: [
          { role: 'user', content: 'Provide a detailed summary of the following transcript:\n\nTest text' }
        ]
      });
    });

    it('should handle API errors', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API error'));
      await expect(provider.summarize('Test text')).rejects.toThrow('Claude API error: API error');
    });

    it('should handle invalid response format', async () => {
      mockCreate.mockResolvedValueOnce({
        content: []
      });
      await expect(provider.summarize('Test text')).rejects.toThrow('Invalid response from Claude API');
    });

    it('should handle non-text content', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'image', url: 'test.jpg' }]
      });
      await expect(provider.summarize('Test text')).rejects.toThrow('Invalid response from Claude API');
    });

    describe('configuration', () => {
      it('should respect maxLength option', async () => {
        mockCreate.mockResolvedValueOnce({
          content: [{ type: 'text', text: 'Test summary' }]
        });

        await provider.summarize('Test text', { maxLength: 200 });
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
          max_tokens: 200
        }));
      });

      it('should use correct model', async () => {
        mockCreate.mockResolvedValueOnce({
          content: [{ type: 'text', text: 'Test summary' }]
        });

        await provider.summarize('Test text');
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
          model: 'claude-3-opus-20240229'
        }));
      });

      it('should use default maxLength when not specified', async () => {
        mockCreate.mockResolvedValueOnce({
          content: [{ type: 'text', text: 'Test summary' }]
        });

        await provider.summarize('Test text');
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
          max_tokens: 500
        }));
      });
    });
  });
}); 