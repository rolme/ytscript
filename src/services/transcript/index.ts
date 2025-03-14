import { YoutubeTranscript } from 'youtube-transcript';
import { TranscriptOptions, TranscriptResult, TranscriptError } from '../../types/transcript';
import { validateUrl, extractVideoId } from '../../utils/urlParser';
import { saveToFile } from '../../utils/fileHandler';
import { getVideoTitle } from '../../utils/titleFetcher';

export async function getTranscript(url: string, options: TranscriptOptions = {}): Promise<TranscriptResult> {
  if (!validateUrl(url)) {
    throw new TranscriptError('Invalid YouTube URL');
  }

  try {
    const videoId = extractVideoId(url);
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: options.language
    });

    const segments = transcriptItems.map(item => ({
      text: item.text,
      duration: item.duration,
      offset: item.offset
    }));

    const transcript = segments.map(segment => segment.text).join('\n');

    return {
      transcript,
      segments,
      videoId
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new TranscriptError(`Failed to fetch transcript: ${message}`);
  }
}

export async function saveTranscript(url: string, options: TranscriptOptions = {}): Promise<string> {
  const { transcript, videoId } = await getTranscript(url, options);
  const title = await getVideoTitle(videoId);
  return saveToFile(transcript, title, options.outputPath);
} 