import { AIOptions, SummaryOptions, AIError } from '../types/ai.js';
import { AIProviderFactory } from './providers/factory.js';
import { TranscriptResult } from '../types/transcript.js';

export interface SummaryResult extends TranscriptResult {
  summary: string;
  provider: string;
}

export class SummaryService {
  private provider: string;
  private options: AIOptions;

  constructor(options: AIOptions = {}) {
    this.provider = options.provider || 'chatgpt';
    this.options = options;
  }

  async summarize(transcript: string, options: SummaryOptions = {}): Promise<string> {
    try {
      const provider = AIProviderFactory.create(this.options);
      return await provider.summarize(transcript, options);
    } catch (error) {
      if (error instanceof Error) {
        throw new AIError(`Summarization failed: ${error.message}`);
      }
      throw new AIError('Unknown error occurred during summarization');
    }
  }

  async summarizeTranscript(result: TranscriptResult, options: SummaryOptions = {}): Promise<SummaryResult> {
    const summary = await this.summarize(result.transcript, options);
    
    return {
      ...result,
      summary,
      provider: this.provider
    };
  }
} 