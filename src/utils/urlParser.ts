import { TranscriptError } from '../errors.js';

export function getVideoId(url: string): string {
  try {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get('v');
    if (!videoId) {
      throw new TranscriptError('Invalid YouTube URL: Missing video ID');
    }
    return videoId;
  } catch (error) {
    if (error instanceof TranscriptError) {
      throw error;
    }
    throw new TranscriptError('Invalid YouTube URL');
  }
}

export function validateUrl(url: string): boolean {
  try {
    const videoId = getVideoId(url);
    return videoId.length > 0;
  } catch (error) {
    return false;
  }
} 