export enum OutputFormat {
  TEXT = 'text',
  JSON = 'json'
}

export interface Metadata {
  language: string;
  lastUpdated: string;
}

export interface TranscriptMetadata extends Metadata {
  provider?: string;
  style?: 'concise' | 'detailed';
}

export interface BaseResponse {
  videoId: string;
  title: string;
}

export interface TextResponse extends BaseResponse {
  format: OutputFormat.TEXT;
  text: string;
}

export interface JsonResponse extends BaseResponse {
  format: OutputFormat.JSON;
  transcript: string;
  segments: Array<{
    text: string;
    duration: number;
    offset: number;
  }>;
  metadata: Metadata;
}

export type TranscriptResponse = TextResponse | JsonResponse;

export interface OutputOptions {
  format?: OutputFormat;
  outputPath?: string;
  language?: string;
  provider?: string;
} 