import { getVideoId } from './videoId.js';
import { getInfo } from 'ytdl-core';
import { TranscriptError } from '../types/transcript.js';

/**
 * Fetches the title of a YouTube video from its URL
 * @param url The YouTube video URL
 * @returns The video title
 */
export async function getTitleFromUrl(url: string): Promise<string> {
  const videoId = getVideoId(url);
  const info = await getInfo(videoId);
  return info.videoDetails.title;
}

export async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const output = await youtubeDl(url, {
      skipDownload: true,
      dumpSingleJson: true,
    });
    
    const title = output.title as string;
    return title
      .replace(/[/\\?%*:|"<>]/g, '-') // Replace invalid filename characters with dash
      .replace(/\s+/g, '-') // Replace spaces with dash
      .toLowerCase(); // Convert to lowercase for consistency
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new TranscriptError(`Failed to fetch video title: ${message}`);
  }
}