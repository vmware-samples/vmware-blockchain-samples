#!/bin/bash
set -e

echo ''
echo '---------------- Deleting Explorer configmap ----------------'
kubectl delete cm explorer-configmap --namespace vmbc-explorer

echo ''
echo '---------------- Deleting Explorer PoD ----------------'
kubectl delete -f k8s-explorer.yml --namespace vmbc-explorer

echo ''
echo '---------------- Deleting vmbc-explorer Namespace ----------------'
kubectl delete namespace vmbc-explorer

echo ''
echo '---------------- Removing tmp files ----------------'
rm -f k8s-explorer.yml k8s-explorer.ymlt

echo '========================== DONE ==========================='
echo ''
