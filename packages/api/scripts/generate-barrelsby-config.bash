#!/usr/bin/env bash

if ! command -v jq &> /dev/null; then
    echo "Please install jq to use this script: https://stedolan.github.io/jq/"
    exit 1
fi

if [ "$(pwd)" != "$(git rev-parse --show-toplevel)/packages/api" ]; then
  echo "Please run this script from packages/api"
  exit 1
fi

jq < barrelsby.config.json ".directory = []" | sponge barrelsby.config.json

for dir in src/{lib,permissions,server,modules/*}; do
    if [ ! -d "$dir" ]; then
        continue
    fi
    jq < barrelsby.config.json ".directory = .directory + [\"./$dir\"]" | sponge barrelsby.config.json
done
