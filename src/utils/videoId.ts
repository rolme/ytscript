/**
 * Extracts the video ID from a YouTube URL
 * @param url The YouTube video URL
 * @returns The video ID
 * @throws Error if the URL is invalid or the video ID cannot be extracted
 */
export function getVideoId(url: string): string {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = url.match(regex);
  
  if (!match) {
    throw new Error('Invalid YouTube URL');
  }

  return match[1];
} 