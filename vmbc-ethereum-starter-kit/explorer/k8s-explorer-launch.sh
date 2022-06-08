#!/bin/bash
set -e

ARCH=$(uname -s)
if [ "$ARCH" == "Darwin" ]; then
  OPTS="-it"
else
  OPTS="-i"
fi

#Make sure you have set your env variable JFROG_PASSWORD

cp k8s-explorer.yml.tmpl k8s-explorer.yml

# For explorer always pull images from JFrog
. ../vmbc/.env.release

sed $OPTS "s!explorer_repo!${explorer_repo}!ig
        s!explorer_tag!${explorer_tag}!ig"  k8s-explorer.yml;

echo ''
echo '---------------- Creating DAPP Configmaps ----------------'
kubectl create namespace vmbc-explorer
kubectl create cm explorer-configmap --from-env-file=../vmbc/.env.config --namespace vmbc-explorer
kubectl create secret docker-registry regcred-explorer --docker-server=vmwaresaas.jfrog.io --docker-username=vmbc-ro-token --docker-password=${JFROG_PASSWORD} --docker-email=ask_VMware_blockchain@VMware.com --namespace=vmbc-explorer 
sleep 5 

echo ''
echo '---------------- Creating Explorer PoD ----------------'
kubectl apply -f k8s-explorer.yml --namespace vmbc-explorer
sleep 10
echo ''
echo '---------------- Get the URL   ----------------'
minikube service vmbc-explorer --url --namespace vmbc-explorer
echo '========================== DONE ==========================='
echo ''
