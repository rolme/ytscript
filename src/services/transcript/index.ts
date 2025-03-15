import ytdl from 'ytdl-core';
import { writeFile } from 'fs/promises';
import { TranscriptError, TranscriptResult, TranscriptOptions } from '../../types/transcript.js';
import type { CaptionTrack } from 'ytdl-core';
import { getVideoId } from '../../utils/videoId.js';

export async function getTranscript(url: string, options: TranscriptOptions = {}): Promise<TranscriptResult> {
  try {
    const videoId = getVideoId(url);
    const info = await ytdl.getInfo(videoId);
    const captions = info.player_response.captions;

    if (!captions?.playerCaptionsTracklistRenderer?.captionTracks?.length) {
      throw new TranscriptError('No captions available for this video');
    }

    const track = captions.playerCaptionsTracklistRenderer.captionTracks.find(
      (track: CaptionTrack) => track.languageCode === (options.language || 'en')
    );

    if (!track) {
      throw new TranscriptError('No English captions available for this video');
    }

    const response = await fetch(track.baseUrl);
    if (!response.ok) {
      throw new TranscriptError(`Failed to fetch transcript: ${response.statusText}`);
    }

    const xml = await response.text();
    const textTags = xml.match(/<text[^>]*>([^<]*)<\/text>/g);

    if (!textTags) {
      throw new TranscriptError('Failed to parse transcript XML');
    }

    const segments = textTags.map(tag => {
      const startMatch = tag.match(/start="([^"]*)"/)!;
      const durMatch = tag.match(/dur="([^"]*)"/)!;
      const textMatch = tag.match(/>([^<]*)<\/text>/)!;

      const rawText = decodeURIComponent(textMatch[1].replace(/\+/g, ' '));
      const text = rawText.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
                         .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
                         .replace(/&amp;/g, '&')
                         .replace(/&lt;/g, '<')
                         .replace(/&gt;/g, '>')
                         .replace(/&quot;/g, '"')
                         .replace(/&#39;/g, "'")
                         .replace(/&apos;/g, "'");

      return {
        text,
        duration: parseFloat(durMatch[1]),
        offset: parseFloat(startMatch[1])
      };
    });

    return {
      transcript: segments.map(segment => segment.text).join(' '),
      segments,
      videoId: videoId
    };
  } catch (error: unknown) {
    if (error instanceof TranscriptError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new TranscriptError(`Failed to fetch transcript: ${errorMessage}`);
  }
}

export async function saveTranscript(
  transcript: string,
  outputPath: string
): Promise<void> {
  try {
    await writeFile(outputPath, transcript);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new TranscriptError(`Failed to save transcript: ${errorMessage}`);
  }
} 