# JSON Output Format Feature Specification

## Overview

Add support for JSON output format to both `download` and `summarize` commands, enabling better integration with scripts and automated workflows.

## Requirements

### Functional Requirements

1. Add JSON output format support for both commands
2. Allow users to select output format via CLI option
3. Maintain backward compatibility with text output
4. Support file output in both formats
5. Provide consistent JSON structure for both success and error cases

### Non-functional Requirements

1. Performance: JSON serialization should not impact command execution time
2. Maintainability: Output format handling should be modular and extensible
3. Usability: JSON output should be properly formatted and easily parseable
4. Compatibility: Support all Node.js versions ≥20

## Technical Design

### Command Line Interface

```bash
# New options for both commands
ytscript download <url> --format json
ytscript summarize <url> --format json

# Combined with existing options
ytscript download <url> --format json --output transcript.json
ytscript summarize <url> --format json --output summary.json --provider chatgpt
```

### JSON Output Structure

#### Success Response

```json
{
  "success": true,
  "data": {
    "videoId": "string",
    "transcript": "string",
    "segments": [
      {
        "text": "string",
        "duration": number,
        "offset": number
      }
    ],
    "summary": "string",  // Only for summarize command
    "metadata": {
      "timestamp": "ISO-8601 string",
      "options": {
        "language": "string",
        "style": "concise | detailed",
        "maxLength": number
      }
    }
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "TRANSCRIPT_ERROR | AI_ERROR | UNKNOWN_ERROR",
    "message": "string"
  }
}
```

### Implementation Details

#### New Components

1. **Output Format Interface**

   ```typescript
   interface OutputFormat {
     format: "text" | "json";
     outputPath?: string;
   }
   ```

2. **Output Handler Service**
   - Handles different output formats
   - Manages formatting and writing output
   - Supports future format extensions

#### File Structure Changes

```
src/
├── services/
│   └── output/
│       └── index.ts       # Output handler service
├── types/
│   └── output.ts         # Output format types
└── tests/
    └── unit/
        └── services/
            └── output/
                └── index.test.ts
```

### Implementation Phases

1. **Phase 1: Core Infrastructure**

   - Create output format types and interfaces
   - Implement output handler service
   - Update file handler to support JSON

2. **Phase 2: CLI Integration**

   - Add format option to commands
   - Update command handlers
   - Implement JSON error handling

3. **Phase 3: Testing and Documentation**
   - Add unit tests
   - Update documentation
   - Add integration tests

## Testing Strategy

### Unit Tests

1. Output format handling
2. JSON serialization
3. Error handling
4. File extension management

### Integration Tests

1. Command line option parsing
2. End-to-end output generation
3. File writing with different formats
4. Error scenarios

## Breaking Changes

- None. New functionality is opt-in via `--format` flag

## Security Considerations

1. Proper escaping of special characters in JSON
2. Safe file handling for different formats
3. Memory usage monitoring for large transcripts

## Future Considerations

1. Support for additional output formats (e.g., CSV, XML)
2. Streaming output for large files
3. Custom JSON schema options

```

```
