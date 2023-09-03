pod=$(kubectl get pods | grep api | head -1 | cut -d' ' -f1)
kubectl exec -it $pod -- bash
