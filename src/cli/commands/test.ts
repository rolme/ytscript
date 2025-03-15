import { Command } from 'commander';
import { TranscriptSegment } from '../../types/transcript.js';

export function createTestCommand(): Command {
  const command = new Command('test');
  command
    .description('Test command for CI - returns mock data')
    .action(() => {
      const mockData = {
        success: true,
        videoId: 'test123',
        title: 'Test Video',
        transcript: 'This is a test transcript.',
        segments: [
          {
            text: 'This is a test transcript.',
            duration: 5,
            offset: 0
          }
        ] as TranscriptSegment[],
        metadata: {
          language: 'en',
          lastUpdated: new Date().toISOString()
        }
      };

      console.log(JSON.stringify(mockData, null, 2));
    });

  return command;
} 