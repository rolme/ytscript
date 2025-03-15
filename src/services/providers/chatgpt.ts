import OpenAI from 'openai';
import { AIProvider, SummaryOptions, AIError } from '../../types/ai.js';

export class ChatGPTProvider implements AIProvider {
  private client: OpenAI;
  private defaultMaxTokens = 500;

  constructor(apiKey?: string) {
    if (!apiKey) {
      throw new AIError('OpenAI API key is required');
    }
    this.client = new OpenAI({ apiKey });
  }

  async summarize(text: string, options: SummaryOptions = {}): Promise<string> {
    try {
      const { style = 'concise', maxLength = this.defaultMaxTokens } = options;

      const prompt = style === 'detailed'
        ? 'Provide a detailed summary of the following transcript:'
        : 'Provide a concise summary of the following transcript:';

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        max_tokens: maxLength,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      if (error instanceof Error) {
        throw new AIError(`Failed to generate summary: ${error.message}`);
      }
      throw new AIError('Failed to generate summary');
    }
  }

  private buildPrompt(text: string, style: string): string {
    const basePrompt = `Please summarize the following YouTube video transcript:\n\n${text}\n\n`;
    
    if (style === 'detailed') {
      return basePrompt + 'Provide a detailed summary including key points, main ideas, and important details.';
    }
    
    return basePrompt + 'Provide a concise summary capturing the main points.';
  }
} 