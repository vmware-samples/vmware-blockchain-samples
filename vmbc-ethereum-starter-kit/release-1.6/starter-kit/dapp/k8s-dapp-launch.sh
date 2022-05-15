#!/bin/bash
set -e

JFROG_PASSWORD=""

ARCH=$(uname -s)
if [ "$ARCH" == "Darwin" ]; then
  OPTS="-it"
else
  OPTS="-i"
fi

cp erc20-swap-dapp.yml.tmpl erc20-swap-dapp.yml

# For erc20-swap always pull images from JFrog
. ../vmbc/.env.release

sed $OPTS "s!erc20swap_repo!${erc20swap_repo}!ig
        s!erc20swap_tag!${erc20swap_tag}!ig"  erc20-swap-dapp.yml;

echo ''
echo '---------------- Creating DAPP Configmaps ----------------'
kubectl create namespace vmbc-dapp
kubectl create cm dapp-configmap --from-env-file=../vmbc/.env.config --namespace vmbc-dapp
kubectl create secret docker-registry regcred-dapp --docker-server=vmwaresaas.jfrog.io --docker-username=vmbc-ro-token --docker-password=${JFROG_PASSWORD} --docker-email=ask_VMware_blockchain@VMware.com --namespace=vmbc-dapp
sleep 5 

echo ''
echo '---------------- Creating DAPP PoD ----------------'
kubectl apply -f erc20-swap-dapp.yml --namespace vmbc-dapp
sleep 10
echo ''
echo '---------------- Get the URL   ----------------'
minikube service erc20-swap --url --namespace vmbc-dapp
echo '========================== DONE ==========================='
echo ''
