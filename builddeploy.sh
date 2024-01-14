#!/usr/bin/env bash
[[ "$@" == "prod" ]] && yarn release
./docker-build.sh && ./set-deployments.sh $@ && git push && git push --tags
