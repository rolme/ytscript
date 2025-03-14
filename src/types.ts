export interface TranscriptOptions {
  language?: string;
  outputPath?: string;
}

export interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
}

export interface TranscriptResult {
  transcript: string;
  segments: TranscriptSegment[];
  videoId: string;
}

export class TranscriptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranscriptError';
  }
} 