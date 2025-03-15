import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatGPTProvider } from '../../../../services/providers/chatgpt.js';

const mockCreate = vi.fn();
const mockClient = {
  chat: {
    completions: {
      create: mockCreate
    }
  }
};

// Mock OpenAI with default export
vi.mock('openai', () => {
  const OpenAI = vi.fn().mockImplementation(() => mockClient);
  return {
    default: OpenAI
  };
});

describe('ChatGPTProvider', () => {
  const mockApiKey = 'test-api-key';
  let provider: ChatGPTProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new ChatGPTProvider(mockApiKey);
  });

  describe('initialization', () => {
    it('should throw error if API key is not provided', () => {
      expect(() => new ChatGPTProvider('')).toThrow('OpenAI API key is required');
    });

    it('should create instance with valid API key', () => {
      expect(provider).toBeInstanceOf(ChatGPTProvider);
    });
  });

  describe('summarize', () => {
    it('should return summary for concise style', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Test summary' } }]
      });

      const result = await provider.summarize('Test text');
      expect(result).toBe('Test summary');
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Provide a concise summary of the following transcript:' },
          { role: 'user', content: 'Test text' }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
    });

    it('should return summary for detailed style', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Detailed summary' } }]
      });

      const result = await provider.summarize('Test text', { style: 'detailed' });
      expect(result).toBe('Detailed summary');
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Provide a detailed summary of the following transcript:' },
          { role: 'user', content: 'Test text' }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
    });

    it('should handle API errors', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API error'));
      await expect(provider.summarize('Test text')).rejects.toThrow('ChatGPT API error: API error');
    });

    it('should handle empty response', async () => {
      mockCreate.mockResolvedValueOnce({ choices: [] });
      const result = await provider.summarize('Test text');
      expect(result).toBe('');
    });

    describe('configuration', () => {
      it('should respect maxLength option', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: 'Test summary' } }]
        });

        await provider.summarize('Test text', { maxLength: 200 });
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
          max_tokens: 200
        }));
      });

      it('should use default maxLength when not specified', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: 'Test summary' } }]
        });

        await provider.summarize('Test text');
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
          max_tokens: 500
        }));
      });

      it('should use correct temperature', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: 'Test summary' } }]
        });

        await provider.summarize('Test text');
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
          temperature: 0.7
        }));
      });

      it('should use correct model', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: 'Test summary' } }]
        });

        await provider.summarize('Test text');
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
          model: 'gpt-3.5-turbo'
        }));
      });
    });
  });
}); 