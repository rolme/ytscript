import { getVideoId } from './videoId.js';
import ytdl from 'ytdl-core';

/**
 * Fetches the title of a YouTube video from its URL
 * @param url The YouTube video URL
 * @returns The video title
 */
export async function getTitleFromUrl(url: string): Promise<string> {
  try {
    const videoId = getVideoId(url);
    const info = await ytdl.getInfo(videoId);
    return info.videoDetails.title;
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid YouTube URL') {
      throw error;
    }
    throw new Error('Failed to fetch video title');
  }
}