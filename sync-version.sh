#!/bin/bash

echo "Syncing package.json version to jsr.json"

# Read package.json and get the version
version=$(jq -r '.version' package.json)

# Show the current package.json version
echo "🔹 package.json: $version"

# Check if jsr.json exists, else exit
if [ ! -f jsr.json ]; then
    echo "The file jsr.json does not exist"
    exit 1
fi

# Update the version in jsr.json
jq --arg version "$version" '.version = $version' jsr.json > tmp.json && mv tmp.json jsr.json

# Check if the version was updated
echo "🔹 jsr.json: $(jq -r '.version' jsr.json)"
