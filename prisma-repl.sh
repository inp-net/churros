#!/usr/bin/env bash
pod=$(kubectl --namespace=centraverse get pods | grep api | head -1 | cut -d' ' -f1)
kubectl --namespace=centraverse exec -it $pod -- sh prismaclient.sh


