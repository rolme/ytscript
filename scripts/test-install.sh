#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔍 Testing local installation..."

# Build the package
npm run build > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"

# Link the package
npm link > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ npm link failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Package linked${NC}"

# Test basic commands
echo "Testing CLI commands..."
if ytscript --version > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Version command works${NC}"
else
    echo -e "${RED}❌ Version command failed${NC}"
    exit 1
fi

if ytscript --help > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Help command works${NC}"
else
    echo -e "${RED}❌ Help command failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}✨ All basic installation tests passed!${NC}"
echo "Note: Full installation tests will run in CI" 