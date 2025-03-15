import type { VideoInfo } from 'ytdl-core';

export interface TranscriptOptions {
  lang?: string;
}

export interface TranscriptResult {
  text: string;
  videoId: string;
}

export interface TranscriptService {
  getTranscript(videoInfo: VideoInfo, options?: TranscriptOptions): Promise<TranscriptResult>;
}

export interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
}

export interface TranscriptResponse {
  transcript: string;
  error: string | null;
} 