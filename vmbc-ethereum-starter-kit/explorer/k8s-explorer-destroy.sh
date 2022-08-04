#!/bin/bash
set -e

. ../vmbc/script/utils.sh

infoln ''
infoln '---------------- Deleting Explorer configmap ----------------'
kubectl delete cm explorer-configmap --namespace vmbc-explorer

infoln ''
infoln '---------------- Deleting Explorer PoD ----------------'
kubectl delete -f k8s-explorer.yml --namespace vmbc-explorer

infoln ''
infoln '---------------- Deleting vmbc-explorer Namespace ----------------'
kubectl delete namespace vmbc-explorer

infoln ''
infoln '---------------- Removing tmp files ----------------'
rm -f k8s-explorer.yml k8s-explorer.ymlt

successln '========================== DONE ==========================='
infoln ''
