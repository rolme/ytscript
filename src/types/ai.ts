export interface AIOptions {
  provider?: 'google' | 'chatgpt' | 'claude';
  apiKey?: string;
}

export interface SummaryOptions {
  style?: 'concise' | 'detailed';
  maxLength?: number;
}

export interface AIProvider {
  name: string;
  summarize(transcript: string, options?: SummaryOptions): Promise<string>;
}

export class AIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIError';
  }
} 