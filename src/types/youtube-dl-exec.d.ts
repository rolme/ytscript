declare module 'youtube-dl-exec' {
  interface YoutubeDlOutput {
    title: string;
    description?: string;
    duration?: number;
    upload_date?: string;
    uploader?: string;
    view_count?: number;
    [key: string]: unknown;
  }

  interface YoutubeDlOptions {
    skipDownload?: boolean;
    dumpSingleJson?: boolean;
    format?: string;
    output?: string;
    [key: string]: unknown;
  }

  function youtubeDl(url: string, options?: YoutubeDlOptions): Promise<YoutubeDlOutput>;
  export = youtubeDl;
} 