import { AIOptions, AIProvider } from '../../types/ai.js';
import { GoogleProvider } from './google.js';
import { ChatGPTProvider } from './chatgpt.js';
import { ClaudeProvider } from './claude.js';

export class AIProviderFactory {
  static create(options: AIOptions = {}): AIProvider {
    const provider = options.provider || 'google';
    let apiKey: string | undefined;

    switch (provider) {
      case 'claude':
        apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new Error('Claude API key is required. Set ANTHROPIC_API_KEY environment variable or provide it in options.');
        }
        return new ClaudeProvider(apiKey);

      case 'chatgpt':
        apiKey = options.apiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable or provide it in options.');
        }
        return new ChatGPTProvider(apiKey);

      case 'google':
      default:
        apiKey = options.apiKey || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
          throw new Error('Google API key is required. Set GOOGLE_API_KEY environment variable or provide it in options.');
        }
        return new GoogleProvider(apiKey);
    }
  }
} 