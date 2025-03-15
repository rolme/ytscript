import type { VideoInfo } from 'ytdl-core';
import type { OutputFormat } from './output.js';

export interface TranscriptOptions {
  lang?: string;
  format?: OutputFormat;
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

export interface TranscriptService {
  getTranscript(videoInfo: VideoInfo, options?: TranscriptOptions): Promise<TranscriptResult>;
}

export class TranscriptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranscriptError';
  }
} 