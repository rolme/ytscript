export { getTranscript } from './services/transcript/index.js';
export type { TranscriptOptions, TranscriptResult } from './types/transcript.js';
export { TranscriptError } from './errors.js';

import { getTranscript } from './services/transcript/index.js';
import type { TranscriptOptions, TranscriptResult } from './types/transcript.js';
import ytdl from 'ytdl-core';

export interface VideoOptions extends TranscriptOptions {
  outputPath?: string;
}

export async function getVideoTranscript(url: string, options: VideoOptions = {}): Promise<TranscriptResult> {
  const info = await ytdl.getInfo(url);
  return getTranscript(info, options);
}