# @rolme/ytscript

A powerful CLI tool and Node.js package for downloading and summarizing YouTube video transcripts.

## Features

- Download transcripts from YouTube videos
- Summarize transcripts using AI (ChatGPT or Claude)
- Support for multiple languages
- Both CLI and programmatic usage
- Customizable summary styles and lengths

## Installation

```bash
npm install @rolme/ytscript
```

## CLI Usage

### Download Transcript

```bash
# Basic usage
ytscript download https://youtube.com/watch?v=xxx

# Specify language
ytscript download https://youtube.com/watch?v=xxx -l es

# Custom output path
ytscript download https://youtube.com/watch?v=xxx -o transcript.txt
```

### Summarize Transcript

```bash
# Basic usage (uses ChatGPT by default)
ytscript summarize https://youtube.com/watch?v=xxx

# Use Claude with detailed summary
ytscript summarize https://youtube.com/watch?v=xxx -p claude -s detailed

# Customize summary length
ytscript summarize https://youtube.com/watch?v=xxx -m 1000

# Save to specific file with language preference
ytscript summarize https://youtube.com/watch?v=xxx -l en -o summary.txt
```

### CLI Options

#### Download Command

- `-l, --language <code>`: Language code (e.g., en, es, fr)
- `-o, --output <path>`: Output file path

#### Summarize Command

- `-l, --language <code>`: Language code (e.g., en, es, fr)
- `-o, --output <path>`: Output file path
- `-p, --provider <name>`: AI provider (chatgpt or claude)
- `-k, --api-key <key>`: AI provider API key
- `-s, --style <style>`: Summary style (concise or detailed)
- `-m, --max-length <number>`: Maximum length of the summary

## Programmatic Usage

### Basic Usage

```typescript
import { getTranscript, summarizeVideo } from "@rolme/ytscript";

// Download transcript
const result = await getTranscript("https://youtube.com/watch?v=xxx");
console.log(result.transcript);

// Summarize video
const summary = await summarizeVideo("https://youtube.com/watch?v=xxx");
console.log(summary.transcript); // Original transcript
console.log(summary.summary); // AI-generated summary
```

### Advanced Usage

```typescript
// Configure summarization options
const result = await summarizeVideo("https://youtube.com/watch?v=xxx", {
  provider: "claude",
  apiKey: "your-api-key",
  language: "en",
  summary: {
    style: "detailed",
    maxLength: 1000,
  },
});

// Save transcript and summary to file
const filePath = await saveSummary("https://youtube.com/watch?v=xxx", {
  outputPath: "output.txt",
  provider: "chatgpt",
  summary: {
    style: "concise",
  },
});
```

## API Keys

The package supports two AI providers:

1. ChatGPT (OpenAI)

   - Set `OPENAI_API_KEY` environment variable
   - Or provide via `apiKey` option

2. Claude (Anthropic)
   - Set `ANTHROPIC_API_KEY` environment variable
   - Or provide via `apiKey` option

You can use a `.env` file to store your API keys:

```env
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

## Error Handling

The package exports error types for specific handling:

```typescript
import { TranscriptError, AIError } from "@rolme/ytscript";

try {
  const result = await summarizeVideo("https://youtube.com/watch?v=xxx");
} catch (error) {
  if (error instanceof TranscriptError) {
    console.error("Failed to fetch transcript:", error.message);
  } else if (error instanceof AIError) {
    console.error("AI summarization failed:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
