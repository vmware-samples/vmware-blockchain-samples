#!/bin/bash
set -e

cd ../vmbc/script

. ./utils.sh

# Souce proper env
sourceEnv

cd -

echo ''
echo '---------------- Creating Elasticsearch statefulset ----------------'
kubectl apply -f elasticsearch_statefulset.yml

echo ''
echo '---------------- Get Elasticsearch statefulset status ----------------'
kubectl rollout status sts/elasticsearch

# Check minikube 
if [ "$ENABLE_MINIKUBE" == "true" ] || [ "$ENABLE_MINIKUBE" == "True" ] || [ "$ENABLE_MINIKUBE" == "TRUE" ]; then
    IP=`minikube ip`
    TEST="curl http://$IP:30920/_cluster/state\?pretty"
    echo $TEST
fi

