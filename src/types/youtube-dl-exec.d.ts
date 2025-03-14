declare module 'youtube-dl-exec' {
  interface YoutubeDlOutput {
    title: string;
    [key: string]: any;
  }

  interface YoutubeDlOptions {
    skipDownload?: boolean;
    dumpSingleJson?: boolean;
    [key: string]: any;
  }

  function youtubeDl(url: string, options?: YoutubeDlOptions): Promise<YoutubeDlOutput>;
  export = youtubeDl;
} 