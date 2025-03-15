import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';

// Global test configuration
beforeAll(() => {
  dotenv.config();
  // Set up mock environment variables
  process.env.GOOGLE_API_KEY = 'test-google-key';
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
});

afterAll(() => {
  // Clean up mock environment variables
  delete process.env.GOOGLE_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  // Clean up any resources if needed
}); 