export { getTranscript, saveTranscript } from './services/transcript/index.js';
export { TranscriptOptions, TranscriptResult, TranscriptSegment, TranscriptError } from './types/transcript.js';
export { AIOptions, SummaryOptions, AIError } from './types/ai.js';
export { SummaryResult, SummaryService } from './services/summary.js';

import { getTranscript } from './services/transcript/index.js';
import { SummaryService, SummaryResult } from './services/summary.js';
import { AIOptions, SummaryOptions } from './types/ai.js';
import { TranscriptOptions } from './types/transcript.js';
import { saveToFile } from './utils/fileHandler.js';
import { getTitleFromUrl } from './utils/titleFetcher.js';

export interface VideoOptions extends AIOptions, TranscriptOptions {
  summary?: SummaryOptions;
}

export async function summarizeVideo(url: string, options: VideoOptions = {}): Promise<SummaryResult> {
  const transcriptResult = await getTranscript(url, options);
  const summaryService = new SummaryService(options);
  return summaryService.summarizeTranscript(transcriptResult, options.summary);
}

export async function saveSummary(url: string, options: VideoOptions = {}): Promise<string> {
  const result = await summarizeVideo(url, options);
  const title = await getTitleFromUrl(url);
  const content = `Transcript:\n${result.transcript}\n\nSummary:\n${result.summary}`;
  return saveToFile(content, title, options.outputPath);
} 