import '@jest/globals';
import { SummaryService } from '../../../services/summary';
import { AIProviderFactory } from '../../../services/providers/factory';
import { AIProvider, AIOptions, SummaryOptions } from '../../../types/ai';
import { TranscriptResult, TranscriptSegment } from '../../../types/transcript';

jest.mock('../../../services/providers/factory');

describe('SummaryService', () => {
  let service: SummaryService;
  let mockProvider: jest.Mocked<AIProvider>;

  beforeEach(() => {
    mockProvider = {
      summarize: jest.fn()
    };

    (AIProviderFactory.create as jest.Mock).mockReturnValue(mockProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      mockProvider.summarize.mockResolvedValue(mockSummary);
    });

    it('should summarize transcript with default options', async () => {
      service = new SummaryService();
      const result = await service.summarizeTranscript(mockTranscript);
      expect(result).toEqual({
        ...mockTranscript,
        summary: mockSummary,
        provider: 'chatgpt'
      });
      expect(mockProvider.summarize).toHaveBeenCalledWith(mockTranscript.transcript, {});
    });

    it('should use specified provider', async () => {
      const options: AIOptions = { provider: 'claude' };
      service = new SummaryService(options);
      const result = await service.summarizeTranscript(mockTranscript);
      expect(result).toEqual({
        ...mockTranscript,
        summary: mockSummary,
        provider: 'claude'
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
        provider: 'chatgpt'
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
        provider: 'chatgpt'
      });
      expect(mockProvider.summarize).toHaveBeenCalledWith(mockTranscript.transcript, options);
    });

    it('should handle provider errors', async () => {
      service = new SummaryService();
      const error = new Error('Provider error');
      mockProvider.summarize.mockRejectedValue(error);
      await expect(service.summarizeTranscript(mockTranscript)).rejects.toThrow('Summarization failed: Provider error');
    });
  });
}); 