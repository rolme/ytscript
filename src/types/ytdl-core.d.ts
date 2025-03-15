declare module 'ytdl-core' {
  interface CaptionTrack {
    baseUrl: string;
    languageCode: string;
    name: { simpleText: string };
  }

  interface PlayerCaptions {
    playerCaptionsTracklistRenderer: {
      captionTracks: CaptionTrack[];
    };
  }

  interface VideoDetails {
    title: string;
    videoId: string;
    lengthSeconds: string;
    keywords: string[];
    channelId: string;
    isOwnerViewing: boolean;
    shortDescription: string;
    isCrawlable: boolean;
    thumbnail: {
      thumbnails: Array<{
        url: string;
        width: number;
        height: number;
      }>;
    };
    allowRatings: boolean;
    viewCount: string;
    author: string;
    isPrivate: boolean;
    isUnpluggedCorpus: boolean;
    isLiveContent: boolean;
  }

  interface VideoInfo {
    videoDetails: VideoDetails;
    player_response: {
      captions: PlayerCaptions;
    };
  }

  export function getInfo(videoId: string): Promise<VideoInfo>;
  export function validateURL(url: string): boolean;
  export function getURLVideoID(url: string): string;
} 