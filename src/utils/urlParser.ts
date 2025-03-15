import { TranscriptError } from '../types/transcript.js';

export function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  throw new TranscriptError('Invalid YouTube URL format');
}

export function validateUrl(url: string): boolean {
  try {
    const videoId = extractVideoId(url);
    return videoId.length > 0;
  } catch (error) {
    return false;
  }
} 