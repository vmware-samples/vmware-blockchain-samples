#!/bin/bash
set -e

eval $(minikube docker-env)

echo ''
echo '---------------- Creating Kibana service ----------------'
kubectl apply -f kibana.yml

echo ''
echo '---------------- Get Kibana status ----------------'
kubectl rollout status deployment/kibana

echo ''
echo '---------------- Get Kibana URL ----------------'
KIBANA_URL=http://`minikube ip`:30561
echo $KIBANA_URL
