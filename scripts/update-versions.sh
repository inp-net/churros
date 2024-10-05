#!/bin/sh

yarn install --mode skip-build
changeset version
yarn install --mode update-lockfile