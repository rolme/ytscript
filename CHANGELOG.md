# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.3] - 2024-03-15

### Fixed

- Updated ChatGPT model from `gpt-4` to `gpt-4-turbo-preview`
- Fixed Claude API headers with correct `anthropic-version`
- Enhanced XML parsing and validation in transcript service
- Improved error handling for non-XML responses
- Added comprehensive API key setup instructions in documentation
- Updated `.env.example` with all required API keys

## [2.0.2] - 2024-03-15

### Fixed

- URI malformed error when fetching transcripts from certain YouTube videos
- Added proper URL decoding for caption track URLs

## [2.0.1] - 2024-03-14

### Added

- JSON output format support with new `--format json` option
- Structured JSON output for both download and summarize commands
- Improved error handling and output formatting
- Enhanced TypeScript type definitions for JSON output

### Changed

- Refactored CLI architecture for better modularity
- Updated documentation with JSON format examples
- Improved package structure and build process

### Fixed

- Package structure to include all necessary files
- TypeScript definitions and build configuration
- Installation test reliability in CI environment

## [1.0.0] - 2024-03-01

### Added

- Initial release
- Download transcripts from YouTube videos
- Generate AI-powered summaries using ChatGPT and Claude
- Support for multiple languages
- Flexible output options
- Both CLI and programmatic usage
