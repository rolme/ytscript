import type { VideoInfo } from 'ytdl-core';
import type { TranscriptOptions, TranscriptResult, TranscriptSegment } from '../../types/transcript.js';
import { TranscriptError } from '../../errors.js';

function parseTimestamp(text: string): { duration: number; offset: number } | null {
  const match = text.match(/<text start="([0-9.]+)" dur="([0-9.]+)"/);
  if (!match) return null;
  return {
    offset: parseFloat(match[1]),
    duration: parseFloat(match[2])
  };
}

function parseXmlToSegments(xml: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const lines = xml.split('\n');
  
  for (const line of lines) {
    const timing = parseTimestamp(line);
    if (!timing) continue;
    
    const text = line
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove XML tags
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    
    if (text) {
      segments.push({
        text,
        ...timing
      });
    }
  }
  
  return segments;
}

export async function getTranscript(videoInfo: VideoInfo, options: TranscriptOptions = {}): Promise<TranscriptResult> {
  try {
    const captions = videoInfo.player_response.captions;
    if (!captions || !captions.playerCaptionsTracklistRenderer) {
      throw new TranscriptError('No captions available for this video');
    }

    const captionTracks = captions.playerCaptionsTracklistRenderer.captionTracks;
    if (!captionTracks || captionTracks.length === 0) {
      throw new TranscriptError('No caption tracks found');
    }

    // Find the requested language or default to English
    const targetLang = options.lang || 'en';
    const caption = captionTracks.find(track => track.languageCode === targetLang);

    if (!caption) {
      throw new TranscriptError(`No captions found for language: ${targetLang}`);
    }

    // Download the caption track
    const response = await fetch(caption.baseUrl);
    if (!response.ok) {
      throw new TranscriptError(`Failed to download caption track: ${response.statusText}`);
    }

    const xml = await response.text();
    const segments = parseXmlToSegments(xml);
    const text = segments.map(s => s.text).join('\n');

    return {
      transcript: text,
      segments,
      videoId: videoInfo.videoDetails.videoId
    };
  } catch (error: unknown) {
    if (error instanceof TranscriptError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new TranscriptError(`Failed to download transcript: ${errorMessage}`);
  }
} 