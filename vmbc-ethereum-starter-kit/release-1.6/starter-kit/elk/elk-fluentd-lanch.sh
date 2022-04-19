#!/bin/bash
set -e

eval $(minikube docker-env)

echo ''
echo '---------------- Creating fluentd service ----------------'
kubectl apply -f fluentd.yml
