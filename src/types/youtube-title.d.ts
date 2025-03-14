declare module 'youtube-title' {
  function getYouTubeTitle(videoId: string): Promise<string>;
  export = getYouTubeTitle;
} 