import { AIProvider, AIError, SummaryOptions } from '../../types/ai.js';

interface ClaudeResponse {
  content: Array<{
    text: string;
  }>;
}

export class ClaudeProvider implements AIProvider {
  readonly name = 'claude';
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }
    this.apiKey = apiKey;
  }

  async summarize(transcript: string, options: SummaryOptions = {}): Promise<string> {
    try {
      const prompt = this.buildPrompt(transcript, options);
      const result = await this.callClaude(prompt);

      if (!result?.content?.[0]?.text) {
        throw new Error('Invalid response from Claude API');
      }

      return result.content[0].text;
    } catch (error) {
      throw new AIError(error instanceof Error ? error.message : 'Failed to generate summary');
    }
  }

  private buildPrompt(transcript: string, options: SummaryOptions): string {
    const style = options.style || 'concise';
    const maxLength = options.maxLength ? `Keep the summary under ${options.maxLength} characters.` : '';

    return `
      Please provide a ${style} summary of the following video transcript. ${maxLength}
      Focus on extracting the key points and main ideas while maintaining accuracy.

      Transcript:
      ${transcript}
    `.trim();
  }

  private async callClaude(prompt: string): Promise<ClaudeResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-client': 'ytscript/2.0.2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        system: 'You are a helpful assistant that summarizes video transcripts accurately and concisely.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(`Claude API request failed: ${response.statusText}${error ? ` - ${JSON.stringify(error)}` : ''}`);
    }

    const data = await response.json() as ClaudeResponse;
    return data;
  }
} 