declare module 'youtube-dl-exec' {
  interface SubtitleItem {
    text: string;
    duration: number;
    start: number;
  }

  interface YoutubeDlOptions {
    dumpSingleJson?: boolean;
    noWarnings?: boolean;
    noCallHome?: boolean;
    noCheckCertificate?: boolean;
    preferFreeFormats?: boolean;
    youtubeSkipDashManifest?: boolean;
    writeSub?: boolean;
    writeAutoSub?: boolean;
    subLang?: string;
    skipDownload?: boolean;
  }

  interface YoutubeDlResponse {
    subtitles: Record<string, SubtitleItem[]>;
    automatic_captions: Record<string, SubtitleItem[]>;
  }

  export default function youtubeDl(url: string, options?: YoutubeDlOptions): Promise<YoutubeDlResponse>;
} 