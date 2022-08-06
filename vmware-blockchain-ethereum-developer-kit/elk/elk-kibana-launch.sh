#!/bin/bash
set -e

cd ../vmbc/script

. ./utils.sh

# Souce proper env
sourceEnv

cd -

echo ''
echo '---------------- Creating Kibana service ----------------'
kubectl apply -f kibana.yml

echo ''
echo '---------------- Get Kibana status ----------------'
kubectl rollout status deployment/kibana

# Check minikube 
if [ "$ENABLE_MINIKUBE" == "true" ] || [ "$ENABLE_MINIKUBE" == "True" ] || [ "$ENABLE_MINIKUBE" == "TRUE" ]; then
    echo ''
    echo '---------------- Get Kibana URL ----------------'
    KIBANA_URL=http://`minikube ip`:30561
    echo $KIBANA_URL
fi