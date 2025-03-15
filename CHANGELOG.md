# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-03-14

### Added

- JSON output format support for both download and summarize commands
- `--format` option to specify output format (text or json)
- Structured JSON output with success/error status
- Test command for CI environment
- Installation test script for local development
- Comprehensive CI workflow for testing package installation
- Type definitions for external dependencies

### Changed

- Refactored CLI architecture to use modular command structure
- Improved error handling with consistent error responses
- Enhanced output formatting for both text and JSON modes
- Updated documentation with new format options

### Fixed

- Improved package structure and file organization
- Better type safety with additional TypeScript definitions
- More reliable installation process

## [1.0.0] - 2024-03-01

### Added

- Initial release
- Basic transcript download functionality
- AI-powered summary generation
- Support for multiple languages
- CLI interface with basic commands
