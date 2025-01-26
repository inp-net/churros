#!/bin/sh

yarn install --mode skip-build
node scripts/generate-renovate-changesets.js
changeset version
node scripts/release-user-facing-changelog.js
yarn install --mode update-lockfile
