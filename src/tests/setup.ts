// Global test configuration
beforeAll(() => {
  // Set up mock environment variables
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
});

afterAll(() => {
  // Clean up mock environment variables
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
}); 