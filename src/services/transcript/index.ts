import type { VideoInfo } from 'ytdl-core';
import type { TranscriptOptions, TranscriptResult } from '../../types/transcript.js';
import { TranscriptError } from '../../errors.js';

export async function getTranscript(videoInfo: VideoInfo, options: TranscriptOptions = {}): Promise<TranscriptResult> {
  try {
    const videoId = videoInfo.videoDetails.videoId;
    console.log('Video title:', videoInfo.videoDetails.title);

    const captions = videoInfo.player_response.captions;
    if (!captions || !captions.playerCaptionsTracklistRenderer) {
      throw new TranscriptError('No captions available for this video');
    }

    const captionTracks = captions.playerCaptionsTracklistRenderer.captionTracks;
    if (!captionTracks || captionTracks.length === 0) {
      throw new TranscriptError('No caption tracks found');
    }

    console.log('Available captions:', captionTracks.map(track => ({
      language: track.languageCode,
      name: track.name.simpleText
    })));

    // Find the requested language or default to English
    const targetLang = options.lang || 'en';
    const caption = captionTracks.find(track => track.languageCode === targetLang);

    if (!caption) {
      throw new TranscriptError(`No captions found for language: ${targetLang}`);
    }

    console.log('Selected caption:', {
      language: caption.languageCode,
      name: caption.name.simpleText
    });

    // Download the caption track
    const response = await fetch(caption.baseUrl);
    if (!response.ok) {
      throw new TranscriptError(`Failed to download caption track: ${response.statusText}`);
    }

    const xml = await response.text();
    
    // Parse the XML to extract just the text
    const text = xml
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove XML tags
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();

    return {
      text,
      videoId
    };
  } catch (error: unknown) {
    if (error instanceof TranscriptError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new TranscriptError(`Failed to download transcript: ${errorMessage}`);
  }
} 