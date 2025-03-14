import { TranscriptResult } from '../../types';

export const mockTranscriptResult: TranscriptResult = {
  transcript: 'test transcript content',
  segments: [
    { text: 'test', duration: 1, offset: 0 }
  ],
  videoId: 'test-video-id'
};

export const mockVideoUrls = {
  valid: 'https://www.youtube.com/watch?v=test123',
  invalid: 'https://invalid-url.com/video',
  shortForm: 'https://youtu.be/test123'
};

export const mockApiKeys = {
  openai: 'test-openai-key',
  claude: 'test-claude-key'
}; 