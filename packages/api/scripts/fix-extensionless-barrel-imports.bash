#!/usr/bin/env bash
shopt -s globstar
if [ $(pwd) != $(git rev-parse --show-toplevel)/packages/api ]; then
  echo "Please run this script from packages/api"
  exit 1
fi
for f in src/**/index.ts; do
  echo fixing extensionless barrel imports in $f
  sed -ri "s/(\bfrom\s+['\"]\..*)([\"'])/\1.js\2/" "$f"
  sed -ri "s/(\.js){2,}/.js/" "$f"
done
