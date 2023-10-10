#!/usr/bin/env bash
./docker-build.sh && ./set-deployments.sh && git push && git push --tags
