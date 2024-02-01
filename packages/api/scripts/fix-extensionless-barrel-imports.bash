#!/usr/bin/env bash
# Required until https://github.com/bencoveney/barrelsby/issues/178 is closed

shopt -s globstar
if [ $(pwd) != $(git rev-parse --show-toplevel)/packages/api ]; then
  echo "Please run this script from packages/api"
  exit 1
fi
fixed_files_count=0
for f in src/**/index.ts; do
  sed -ri "s/(\bfrom\s+['\"]\..*)([\"'])/\1.js\2/" "$f"
  sed -ri "s/(\.js){2,}/.js/" "$f"
  fixed_files_count=$((fixed_files_count + 1))
done

echo Fixed extension-less imports from barrelsby in $fixed_files_count files
