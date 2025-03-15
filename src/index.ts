export { getTranscript } from './services/transcript/index.js';
export type { TranscriptOptions, TranscriptResult } from './types/transcript.js';
export { TranscriptError } from './errors.js';
export { AIError } from './types/ai.js';
export type { AIOptions, SummaryOptions } from './types/ai.js';

import { getTranscript } from './services/transcript/index.js';
import type { TranscriptOptions, TranscriptResult } from './types/transcript.js';
import ytdl from 'ytdl-core';
import { SummaryService } from './services/summary.js';
import type { AIOptions, SummaryOptions } from './types/ai.js';

export interface VideoOptions extends TranscriptOptions {
  outputPath?: string;
}

export interface SummaryResult extends TranscriptResult {
  summary: string;
  provider: string;
}

export async function getVideoTranscript(url: string, options: VideoOptions = {}): Promise<TranscriptResult> {
  const info = await ytdl.getInfo(url);
  return getTranscript(info, options);
}

export async function summarizeVideo(url: string, options: AIOptions & VideoOptions & SummaryOptions = {}): Promise<SummaryResult> {
  const transcript = await getVideoTranscript(url, options);
  const summaryService = new SummaryService(options);
  const { style, maxLength } = options;
  return summaryService.summarizeTranscript(transcript, { style, maxLength });
}