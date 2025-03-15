import { AIProvider, AIError, SummaryOptions } from '../../types/ai.js';

interface ChatGPTResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class ChatGPTProvider implements AIProvider {
  readonly name = 'chatgpt';
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.apiKey = apiKey;
  }

  async summarize(transcript: string, options: SummaryOptions = {}): Promise<string> {
    try {
      const prompt = this.buildPrompt(transcript, options);
      const result = await this.callOpenAI(prompt);

      if (!result?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from OpenAI API');
      }

      return result.choices[0].message.content;
    } catch (error) {
      throw new AIError(error instanceof Error ? error.message : 'Failed to generate summary');
    }
  }

  private buildPrompt(transcript: string, options: SummaryOptions): string {
    const style = options.style || 'concise';
    const maxLength = options.maxLength ? `Keep the summary under ${options.maxLength} characters.` : '';

    return `
      Summarize the following transcript in a ${style} manner. ${maxLength}
      Focus on the key points and main ideas.

      Transcript:
      ${transcript}
    `.trim();
  }

  private async callOpenAI(prompt: string): Promise<ChatGPTResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes video transcripts accurately and concisely.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json() as ChatGPTResponse;
    return data;
  }
} 