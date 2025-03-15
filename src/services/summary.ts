import { AIOptions, SummaryOptions } from '../types/ai.js';
import { TranscriptResult } from '../types/transcript.js';
import { AIProviderFactory } from './providers/factory.js';

interface SummaryResult extends TranscriptResult {
  summary: string;
  provider: string;
}

export class SummaryService {
  private provider;

  constructor(options: AIOptions = {}) {
    this.provider = AIProviderFactory.create(options);
  }

  async summarizeTranscript(
    transcript: TranscriptResult,
    options: SummaryOptions = {}
  ): Promise<SummaryResult> {
    try {
      const summary = await this.provider.summarize(transcript.transcript, options);

      return {
        ...transcript,
        summary,
        provider: 'google'
      };
    } catch (error) {
      throw new Error(
        `Summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
} 