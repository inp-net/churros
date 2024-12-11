#!/bin/sh

yarn install --mode skip-build
changeset version
node scripts/release-user-facing-changelog.js
yarn install --mode update-lockfile
