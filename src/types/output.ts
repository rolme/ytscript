import { TranscriptSegment } from './transcript.js';

export type OutputFormat = 'text' | 'json';

export interface OutputOptions {
  format?: OutputFormat;
  outputPath?: string;
  language?: string;
  provider?: string;
  style?: 'concise' | 'detailed';
  maxLength?: number;
}

export interface JSONOutputMetadata {
  timestamp: string;
  options: {
    language?: string;
    style?: 'concise' | 'detailed';
    maxLength?: number;
    provider?: string;
  };
}

export interface JSONSuccessResponse {
  success: true;
  data: {
    videoId: string;
    transcript: string;
    segments?: TranscriptSegment[];
    summary?: string;
    metadata: JSONOutputMetadata;
  };
}

export interface JSONErrorResponse {
  success: false;
  error: {
    code: 'TRANSCRIPT_ERROR' | 'AI_ERROR' | 'UNKNOWN_ERROR';
    message: string;
  };
}

export type JSONResponse = JSONSuccessResponse | JSONErrorResponse; 