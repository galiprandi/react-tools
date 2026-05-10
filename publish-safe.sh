#!/bin/bash

set -e

echo "🚀 Starting safe publication process..."

# Get version from package.json
VERSION=$(jq -r '.version' package.json)
PACKAGE_NAME=$(jq -r '.name' package.json)

echo "📦 Package: $PACKAGE_NAME"
echo "📌 Version: $VERSION"

# Check npm authentication
echo ""
echo "🔐 Checking npm authentication..."
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Not authenticated to npm. Please run: npm login"
    exit 1
fi
echo "✅ Authenticated to npm"

# Check jsr authentication
echo ""
echo "🔐 Checking jsr authentication..."
if ! npx jsr@latest whoami > /dev/null 2>&1; then
    echo "❌ Not authenticated to jsr. Please run: npx jsr@latest login"
    exit 1
fi
echo "✅ Authenticated to jsr"

# Sync versions
echo ""
echo "🔄 Syncing versions..."
npm run release:sync

# Build
echo ""
echo "🔨 Building..."
npm run build

# Check if version exists in npm
echo ""
echo "🔍 Checking if version $VERSION exists in npm..."
if npm view "$PACKAGE_NAME@$VERSION" > /dev/null 2>&1; then
    echo "⚠️  Version $VERSION already exists in npm"
    echo "📊 Skipping npm publish, will only publish to jsr"
    NPM_EXISTS=true
else
    echo "✅ Version $VERSION does not exist in npm"
    NPM_EXISTS=false
fi

# Run jsr dry-run to check for type errors
echo ""
echo "🔍 Running jsr dry-run to check for type errors..."
if ! npx jsr@latest publish --dry-run --allow-dirty > /dev/null 2>&1; then
    echo "❌ jsr dry-run failed. Please fix type errors first."
    echo "💡 Run: npx jsr@latest publish --dry-run --allow-dirty"
    exit 1
fi
echo "✅ jsr dry-run passed"

# Publish to npm if version doesn't exist
if [ "$NPM_EXISTS" = false ]; then
    echo ""
    echo "📤 Publishing to npm..."
    npm publish
    echo "✅ Published to npm"
else
    echo ""
    echo "⏭️  Skipping npm publish (version already exists)"
fi

# Publish to jsr
echo ""
echo "📤 Publishing to jsr..."
npx jsr@latest publish --allow-dirty
echo "✅ Published to jsr"

echo ""
echo "🎉 Publication complete!"
echo "📦 $PACKAGE_NAME@$VERSION"
