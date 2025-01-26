#!/bin/sh

yarn install --mode skip-build
node scripts/generate-renovate-changesets.js
git push
changeset version
node scripts/release-user-facing-changelog.js
yarn install --mode update-lockfile
