# ytscript

[![CI](https://github.com/rolme/ytscript/actions/workflows/ci.yml/badge.svg)](https://github.com/rolme/ytscript/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/ytscript.svg)](https://badge.fury.io/js/ytscript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)

A CLI tool to download YouTube video transcripts with automatic video title-based filenames. Use it as a CLI tool or import it into your project.

## Installation

```bash
# Install globally for CLI usage
npm install -g ytscript

# Install as a dependency in your project
npm install ytscript
```

## CLI Usage

```bash
# Basic usage - saves transcript with video title as filename
ytscript https://www.youtube.com/watch?v=VIDEO_ID

# Specify language
ytscript https://www.youtube.com/watch?v=VIDEO_ID -l en

# Custom output path
ytscript https://www.youtube.com/watch?v=VIDEO_ID -o transcript.txt
```

## API Usage

```typescript
import { getTranscript, saveTranscript } from "ytscript";

// Get transcript text and segments
const result = await getTranscript("https://www.youtube.com/watch?v=VIDEO_ID", {
  language: "en", // optional
});
console.log(result.transcript); // Clean, formatted transcript text
console.log(result.videoId); // Video ID for additional operations

// Save transcript to file (uses video title as filename by default)
const outputPath = await saveTranscript(
  "https://www.youtube.com/watch?v=VIDEO_ID",
  {
    language: "en", // optional
    outputPath: "transcript.txt", // optional, overrides title-based filename
  }
);
console.log(`Saved to: ${outputPath}`);
```

## Features

- Automatic video title-based filenames
- Clean, formatted transcript text (HTML entities are properly decoded)
- Support for multiple languages
- TypeScript support
- Both CLI and programmatic usage
- Custom output path option

## Options

- `language`: Language code (e.g., 'en', 'es', 'fr')
- `outputPath`: Custom file path for saving the transcript. If not provided, uses `{video-title}-{timestamp}.txt`

## Output Format

By default, transcripts are saved as:

- Filename: `{video-title}-{timestamp}.txt` (e.g., `build-ai-agents-that-evolve-over-time-2025-03-14T20-13-59-980Z.txt`)
- Content: Clean text with proper formatting and decoded HTML entities

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Build the project
npm run build

# Start the CLI tool locally
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
