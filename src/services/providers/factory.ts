import { AIProvider, AIOptions, AIError } from '../../types/ai';
import { ChatGPTProvider } from './chatgpt';
import { ClaudeProvider } from './claude';

export class AIProviderFactory {
  static create(options: AIOptions): AIProvider {
    const provider = options.provider?.toLowerCase() || 'chatgpt';
    const apiKey = options.apiKey || this.getEnvironmentApiKey(provider);

    switch (provider) {
      case 'chatgpt':
        return new ChatGPTProvider(apiKey || '');
      case 'claude':
        return new ClaudeProvider(apiKey || '');
      default:
        throw new AIError(`Unsupported AI provider: ${provider}`);
    }
  }

  private static getEnvironmentApiKey(provider: string): string | undefined {
    switch (provider) {
      case 'chatgpt':
        return process.env.OPENAI_API_KEY;
      case 'claude':
        return process.env.ANTHROPIC_API_KEY;
      default:
        return undefined;
    }
  }
} 