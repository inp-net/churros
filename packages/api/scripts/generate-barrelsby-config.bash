#!/usr/bin/env bash

if [ "$(pwd)" != "$(git rev-parse --show-toplevel)/packages/api" ]; then
  echo "Please run this script from packages/api"
  exit 1
fi

echo '{ "structure": "flat", "delete": true, "location": "all" }' > barrelsby.config.json

for dir in src/{lib,server,modules/*}; do
    if [ ! -d "$dir" ]; then
        continue
    fi
    jq < barrelsby.config.json ".directory = .directory + [\"./$dir\"]" | sponge barrelsby.config.json
done
