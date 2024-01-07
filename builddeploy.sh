#!/usr/bin/env bash
[[ "$@" == "prod" ]] && yearn release
./docker-build.sh && ./set-deployments.sh $@ && git push && git push --tags
