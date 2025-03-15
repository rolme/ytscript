import type { TranscriptResult } from '../../types/transcript.js';
import { TranscriptError } from '../../types/transcript.js';
import { AIError, AIProvider, SummaryOptions } from '../../types/ai.js';

interface GoogleAPIResponse<T> {
  data: T;
  error?: {
    code: number;
    message: string;
  };
}

interface TranscriptResponse {
  text: string;
  segments: Array<{
    text: string;
    duration: number;
    offset: number;
  }>;
  videoId: string;
  title?: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GoogleProvider implements AIProvider {
  readonly name = 'google';
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Google API key is required');
    }
    this.apiKey = apiKey;
  }

  async getTranscript(videoId: string): Promise<TranscriptResult> {
    try {
      const result = await this.callGoogleAPI<TranscriptResponse>({
        endpoint: 'youtube/v3/captions',
        baseUrl: 'https://www.googleapis.com',
        params: { videoId }
      });

      if (!result || !result.text) {
        throw new Error('Invalid transcript response');
      }

      return {
        transcript: result.text,
        videoId: result.videoId,
        segments: result.segments
      };
    } catch (error) {
      throw new TranscriptError(error instanceof Error ? error.message : 'Failed to fetch transcript');
    }
  }

  async summarize(transcript: string, options: SummaryOptions = {}): Promise<string> {
    try {
      const style = options.style || 'concise';
      const maxLength = options.maxLength ? `Keep the summary under ${options.maxLength} characters.` : '';

      const prompt = `
        Please provide a ${style} summary of the following video transcript. ${maxLength}
        Focus on extracting the key points and main ideas while maintaining accuracy.

        Transcript:
        ${transcript}
      `.trim();

      const result = await this.callGoogleAPI<GeminiResponse>({
        endpoint: 'v1beta/models/gemini-pro:generateContent',
        baseUrl: 'https://generativelanguage.googleapis.com',
        params: {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 32,
            topP: 1,
            maxOutputTokens: options.maxLength ? Math.floor(options.maxLength / 4) : 1024,
          },
          safetySettings: [{
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }]
        }
      });

      if (!result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid summary response from Gemini API');
      }

      return result.candidates[0].content.parts[0].text;
    } catch (error) {
      throw new AIError(error instanceof Error ? error.message : 'Failed to generate summary');
    }
  }

  async callGoogleAPI<T>(config: { 
    endpoint: string; 
    baseUrl: string;
    params: Record<string, unknown>;
  }): Promise<T> {
    const url = new URL(`${config.baseUrl}/${config.endpoint}`);
    
    // Add API key to URL for GET requests or Gemini API
    if (config.endpoint.startsWith('youtube/') || config.baseUrl.includes('generativelanguage')) {
      url.searchParams.set('key', this.apiKey);
    }
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Only add Authorization for non-YouTube and non-Gemini endpoints
      if (!config.endpoint.startsWith('youtube/') && !config.baseUrl.includes('generativelanguage')) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify(config.params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: response.statusText } })) as { error?: { message: string } };
        throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json() as GoogleAPIResponse<T>;
      
      if (data.error) {
        throw new Error(`API error: ${data.error.message}`);
      }

      return data.data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('API request failed');
    }
  }
} 