#!/bin/bash
set -e

echo ''
echo '---------------- Deleting DAPP configmap ----------------'
kubectl delete cm dapp-configmap --namespace vmbc
echo ''
echo '---------------- Deleting DAPP PoD ----------------'
kubectl delete -f erc20-swap-dapp.yml --namespace vmbc

echo ''
echo '---------------- Removing tmp files ----------------'
rm -f erc20-swap-dapp.yml erc20-swap-dapp.ymlt

echo '========================== DONE ==========================='
echo ''
