#!/bin/bash
set -e

cd ../vmbc/script
. ./utils.sh
cd -

infoln ''
infoln '---------------- Deleting DAPP configmap ----------------'
kubectl delete cm dapp-configmap --namespace vmbc-dapp
infoln ''
infoln '---------------- Deleting DAPP PoD ----------------'
kubectl delete -f erc20-swap-dapp.yml --namespace vmbc-dapp
infoln ''
infoln '---------------- Deleting vmbc-dapp Namespace ----------------'
kubectl delete namespace vmbc-dapp

infoln ''
infoln '---------------- Removing tmp files ----------------'
rm -f erc20-swap-dapp.yml erc20-swap-dapp.ymlt

successln '========================== DONE ==========================='
infoln ''
