export { getTranscript, saveTranscript } from './services/transcript';
export { TranscriptOptions, TranscriptResult, TranscriptSegment, TranscriptError } from './types/transcript';
export { AIOptions, SummaryOptions, AIError } from './types/ai';
export { SummaryResult, SummaryService } from './services/summary';

import { getTranscript } from './services/transcript';
import { SummaryService, SummaryResult } from './services/summary';
import { AIOptions, SummaryOptions } from './types/ai';
import { TranscriptOptions } from './types/transcript';
import { saveToFile } from './utils/fileHandler';
import { getVideoTitle } from './utils/titleFetcher';

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
  const title = await getVideoTitle(result.videoId);
  const content = `Transcript:\n${result.transcript}\n\nSummary:\n${result.summary}`;
  return saveToFile(content, title, options.outputPath);
} 