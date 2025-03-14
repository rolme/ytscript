export interface AIOptions {
  provider?: string;
  apiKey?: string;
  options?: Record<string, unknown>;
}

export interface SummaryOptions {
  style?: 'concise' | 'detailed';
  maxLength?: number;
}

export interface AIProvider {
  summarize(text: string, options?: SummaryOptions): Promise<string>;
}

export class AIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIError';
    Object.setPrototypeOf(this, AIError.prototype);
  }
} 