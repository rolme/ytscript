# ESM Migration Technical Specification

## Overview

This document outlines the technical approach for migrating the ytscript package from CommonJS to ES Modules to resolve global installation issues and ensure consistent module system usage.

## Current State

- Package uses ES Module imports in source code
- TypeScript configured for CommonJS output
- Global installation fails due to module system mismatch
- Dependencies use ES Module syntax

## Requirements

### Functional Requirements

1. Package must work when installed globally
2. All existing functionality must continue working
3. CLI commands must execute without module errors
4. Programmatic API must remain compatible

### Non-functional Requirements

1. Maintain TypeScript type safety
2. Ensure backward compatibility where possible
3. Follow Node.js best practices for ES Modules
4. Maintain test coverage

## Technical Design

### 1. Package.json Updates

```json
{
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "ytscript": "./dist/cli.js"
  },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### 2. TypeScript Configuration

```json
{
  "compilerOptions": {
    "module": "ES2020",
    "moduleResolution": "node",
    "target": "es2018",
    "outDir": "./dist",
    "declaration": true
  }
}
```

### 3. File Updates Required

1. Update import/export statements:

   ```typescript
   // Before
   const { Command } = require('commander');
   module.exports = { ... };

   // After
   import { Command } from 'commander';
   export { ... };
   ```

2. Update file extensions:

   - Source files: Keep `.ts` extension
   - Compiled output: Use `.js` (Node.js will treat them as ESM due to package.json type)

3. Update path references:
   - Add `.js` extensions to all imports
   - Update relative imports to use full file extensions

### 4. Testing Updates

1. Update Jest configuration for ESM:

   ```javascript
   export default {
     preset: "ts-jest/presets/default-esm",
     extensionsToTreatAsEsm: [".ts"],
     moduleNameMapper: {
       "^(\\.{1,2}/.*)\\.js$": "$1",
     },
   };
   ```

2. Update test imports to use ESM syntax

### 5. Build Process Updates

1. Update build scripts:

   ```json
   {
     "scripts": {
       "build": "tsc",
       "prepare": "npm run build"
     }
   }
   ```

2. Update CI/CD pipeline if necessary

## Implementation Plan

### Phase 1: Configuration Updates

1. Update package.json

   - Add "type": "module"
   - Update main and module fields
   - Update bin configuration

2. Update TypeScript configuration
   - Change module system
   - Update module resolution
   - Verify declaration file generation

### Phase 2: Code Migration

1. Update source files

   - Convert require() to import
   - Convert module.exports to export
   - Add file extensions to imports
   - Update path references

2. Update tests
   - Convert test files to ESM
   - Update Jest configuration
   - Fix any broken imports

### Phase 3: Build and Test

1. Verify build process

   - Test compilation
   - Verify output structure
   - Check declaration files

2. Run test suite
   - Fix any failing tests
   - Verify coverage

### Phase 4: Verification

1. Test global installation

   - Install package globally
   - Verify CLI functionality
   - Test all commands

2. Test programmatic usage
   - Verify imports work
   - Test all exported functions
   - Check type definitions

## Rollback Plan

1. Keep git branch with CommonJS version
2. Maintain version tags for last CommonJS release
3. Document rollback process in case of issues

## Success Criteria

1. Global installation works without errors
2. All tests pass
3. CLI commands execute successfully
4. Programmatic API functions correctly
5. Type definitions work as expected
6. No regression in functionality

## Timeline

1. Configuration Updates: 1 day
2. Code Migration: 2 days
3. Testing and Fixes: 1 day
4. Documentation: 1 day
5. Review and Refinement: 1 day

Total: 6 days

## Risks and Mitigation

### Risks

1. Breaking changes for existing users
2. Compatibility issues with older Node.js versions
3. Dependencies not compatible with ESM
4. Type definition issues

### Mitigation

1. Thorough testing of all use cases
2. Clear documentation of changes
3. Version bump following semver
4. Comprehensive test coverage
5. Staged rollout if necessary

## Documentation Updates Required

1. Update README.md with new import syntax
2. Update API documentation
3. Add migration guide for existing users
4. Update contributing guidelines

## References

1. [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
2. [TypeScript ESM Support](https://www.typescriptlang.org/docs/handbook/esm-node.html)
3. [Jest ESM Support](https://jestjs.io/docs/ecmascript-modules)
