#!/bin/bash
set -e

eval $(minikube docker-env)

echo ''
echo '---------------- Creating Elasticsearch statefulset ----------------'
kubectl apply -f elasticsearch_statefulset.yml

echo ''
echo '---------------- Get Elasticsearch statefulset status ----------------'
kubectl rollout status sts/elasticsearch

echo ''
#echo '---------------- Test Elasticsearch statefulset ----------------'
#sleep 20
IP=`minikube ip`
TEST="curl http://$IP:30920/_cluster/state\?pretty"
echo $TEST

