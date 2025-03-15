import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SummaryService } from '../../../services/summary.js';
import { AIProviderFactory } from '../../../services/providers/factory.js';
import { AIProvider, AIOptions, SummaryOptions } from '../../../types/ai.js';
import { TranscriptResult, TranscriptSegment } from '../../../types/transcript.js';

vi.mock('../../../services/providers/factory.js');

describe('SummaryService', () => {
  let service: SummaryService;
  let mockProvider: AIProvider;

  beforeEach(() => {
    mockProvider = {
      name: 'google',
      summarize: vi.fn()
    };

    (AIProviderFactory.create as ReturnType<typeof vi.fn>).mockReturnValue(mockProvider);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('summarizeTranscript', () => {
    const mockSegment: TranscriptSegment = {
      text: 'Test segment content',
      duration: 60,
      offset: 0
    };

    const mockTranscript: TranscriptResult = {
      transcript: 'Test transcript content',
      segments: [mockSegment],
      videoId: 'test-video-id'
    };
    const mockSummary = 'Test summary';

    beforeEach(() => {
      (mockProvider.summarize as ReturnType<typeof vi.fn>).mockResolvedValue(mockSummary);
    });

    it('should summarize transcript with default options', async () => {
      service = new SummaryService();
      const result = await service.summarizeTranscript(mockTranscript);
      expect(result).toEqual({
        ...mockTranscript,
        summary: mockSummary,
        provider: 'google'
      });
      expect(mockProvider.summarize).toHaveBeenCalledWith(mockTranscript.transcript, {});
    });

    it('should use specified API key', async () => {
      const options: AIOptions = { apiKey: 'test-google-key' };
      service = new SummaryService(options);
      const result = await service.summarizeTranscript(mockTranscript);
      expect(result).toEqual({
        ...mockTranscript,
        summary: mockSummary,
        provider: 'google'
      });
      expect(AIProviderFactory.create).toHaveBeenCalledWith(options);
    });

    it('should pass style option to provider', async () => {
      service = new SummaryService();
      const options: SummaryOptions = { style: 'detailed' };
      const result = await service.summarizeTranscript(mockTranscript, options);
      expect(result).toEqual({
        ...mockTranscript,
        summary: mockSummary,
        provider: 'google'
      });
      expect(mockProvider.summarize).toHaveBeenCalledWith(mockTranscript.transcript, options);
    });

    it('should pass maxLength option to provider', async () => {
      service = new SummaryService();
      const options: SummaryOptions = { maxLength: 200 };
      const result = await service.summarizeTranscript(mockTranscript, options);
      expect(result).toEqual({
        ...mockTranscript,
        summary: mockSummary,
        provider: 'google'
      });
      expect(mockProvider.summarize).toHaveBeenCalledWith(mockTranscript.transcript, options);
    });

    it('should handle provider errors', async () => {
      service = new SummaryService();
      const error = new Error('Provider error');
      (mockProvider.summarize as ReturnType<typeof vi.fn>).mockRejectedValue(error);
      await expect(service.summarizeTranscript(mockTranscript)).rejects.toThrow('Summarization failed: Provider error');
    });

    it('should handle missing API key', async () => {
      const options: AIOptions = { apiKey: '' };
      (AIProviderFactory.create as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
        throw new Error('Google API key is required. Set GOOGLE_API_KEY environment variable or provide it in options.');
      });
      expect(() => new SummaryService(options)).toThrow('Google API key is required. Set GOOGLE_API_KEY environment variable or provide it in options.');
    });
  });
}); 