import { AIProvider, SummaryOptions, AIError } from '../../types/ai';
import { Anthropic } from '@anthropic-ai/sdk';

export class ClaudeProvider implements AIProvider {
  private client: Anthropic;
  private defaultMaxTokens = 500;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new AIError('Anthropic API key is required');
    }
    this.client = new Anthropic({ apiKey });
  }

  async summarize(text: string, options: SummaryOptions = {}): Promise<string> {
    try {
      const { style = 'concise', maxLength = this.defaultMaxTokens } = options;

      const prompt = style === 'detailed'
        ? 'Provide a detailed summary of the following transcript:'
        : 'Provide a concise summary of the following transcript:';

      const response = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: maxLength,
        messages: [
          { role: 'user', content: `${prompt}\n\n${text}` }
        ]
      });

      const content = response.content[0];
      if (!content || content.type !== 'text') {
        throw new AIError('Invalid response from Claude API');
      }

      return content.text;
    } catch (error) {
      if (error instanceof Error) {
        throw new AIError(`Claude API error: ${error.message}`);
      }
      throw new AIError('Unknown error occurred while calling Claude API');
    }
  }
} 