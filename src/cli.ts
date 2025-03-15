#!/usr/bin/env node

import { createCli } from './cli/index.js';

// Create and parse the CLI
const program = createCli();
await program.parseAsync(process.argv);

// Export the program for testing
export { program }; 