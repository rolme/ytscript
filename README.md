# @rolme/ytscript

[![npm version](https://img.shields.io/npm/v/@rolme/ytscript.svg)](https://www.npmjs.com/package/@rolme/ytscript)
[![License](https://img.shields.io/npm/l/@rolme/ytscript.svg)](https://github.com/rolme/ytscript/blob/main/LICENSE)
[![Build Status](https://github.com/rolme/ytscript/workflows/CI/badge.svg)](https://github.com/rolme/ytscript/actions)
[![npm downloads](https://img.shields.io/npm/dm/@rolme/ytscript.svg)](https://www.npmjs.com/package/@rolme/ytscript)
[![node version](https://img.shields.io/node/v/@rolme/ytscript.svg)](https://www.npmjs.com/package/@rolme/ytscript)

A powerful CLI tool and Node.js package for downloading and summarizing YouTube video transcripts using AI (ChatGPT and Claude).

## Features

- Download transcripts from YouTube videos
- Generate AI-powered summaries using:
  - OpenAI's ChatGPT for concise, accurate summaries
  - Anthropic's Claude for detailed, nuanced analysis
- Customize summary style (concise or detailed)
- Control summary length and format
- Support for multiple languages
- Both CLI and programmatic usage
- Flexible output options (console or file)

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
# Basic usage with ChatGPT
ytscript summarize https://youtube.com/watch?v=xxx

# Use Claude with detailed summary style
ytscript summarize https://youtube.com/watch?v=xxx -p claude -s detailed

# ChatGPT with concise summary and max length
ytscript summarize https://youtube.com/watch?v=xxx -p chatgpt -s concise -m 500

# Save Claude summary to file with language preference
ytscript summarize https://youtube.com/watch?v=xxx -p claude -l en -o summary.txt
```

### CLI Options

#### Download Command

- `-l, --language <code>`: Language code (e.g., en, es, fr)
- `-o, --output <path>`: Output file path
- `-f, --format <format>`: Output format (text or json)

#### Summarize Command

- `-l, --language <code>`: Language code (e.g., en, es, fr)
- `-o, --output <path>`: Output file path
- `-p, --provider <n>`: AI provider (chatgpt or claude)
- `-k, --api-key <key>`: AI provider API key
- `-s, --style <style>`: Summary style (concise or detailed)
- `-m, --max-length <number>`: Maximum length of the summary
- `-f, --format <format>`: Output format (text or json)

### Output Formats

#### Text Format (Default)

The default text format outputs the transcript or summary directly to the console or file.

#### JSON Format

Using `--format json` outputs structured data in JSON format:

For download command:

```json
{
  "videoId": "xxx",
  "title": "Video Title",
  "transcript": "Full transcript text",
  "segments": [
    {
      "text": "Segment text",
      "duration": 10.5,
      "offset": 0
    }
  ],
  "metadata": {
    "language": "en",
    "lastUpdated": "2024-03-14T12:00:00Z"
  }
}
```

For summarize command:

```json
{
  "videoId": "xxx",
  "title": "Video Title",
  "transcript": "Original transcript",
  "summary": "AI-generated summary",
  "metadata": {
    "language": "en",
    "provider": "chatgpt",
    "style": "concise",
    "lastUpdated": "2024-03-14T12:00:00Z"
  }
}
```

## Programmatic Usage

### Basic Usage

```typescript
import { getTranscript, summarizeVideo, OutputFormat } from "@rolme/ytscript";

// Download transcript with JSON output
const result = await getTranscript("https://youtube.com/watch?v=xxx", {
  format: OutputFormat.JSON,
});
console.log(result.transcript); // Access transcript text
console.log(result.segments); // Access transcript segments

// Summarize video with JSON output
const summary = await summarizeVideo("https://youtube.com/watch?v=xxx", {
  format: OutputFormat.JSON,
});
console.log(summary.transcript); // Original transcript
console.log(summary.summary); // AI-generated summary
console.log(summary.metadata); // Access metadata
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

## AI Provider Features

### ChatGPT (OpenAI)

- Ideal for concise, to-the-point summaries
- Great for technical content and factual accuracy
- Supports multiple summary styles:
  - `concise`: Brief, focused summaries
  - `detailed`: Comprehensive analysis with key points

### Claude (Anthropic)

- Excellent for nuanced, contextual understanding
- Strong at capturing subtle details and themes
- Summary styles available:
  - `concise`: Clear, efficient summaries
  - `detailed`: In-depth analysis with context
