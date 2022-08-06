#!/bin/bash
set -e

echo ''
echo '---------------- Deleting Elasticsearch statefulset ----------------'
kubectl delete -f elasticsearch_statefulset.yml

echo ''
echo '---------------- Destroying Kibana service ----------------'
kubectl delete -f kibana.yml

echo ''
echo '---------------- Destroying fluentd service ----------------'
kubectl delete -f fluentd.yml



