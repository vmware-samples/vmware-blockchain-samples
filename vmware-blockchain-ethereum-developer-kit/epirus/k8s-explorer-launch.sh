#!/bin/bash
set -e

cd ../vmbc/script

. ./utils.sh

# Souce proper env
sourceEnv

# Check Pre-requisites
checkPreReqs

# Get the options
getOptions
cd -

# Check minikube status
if [ "$ENABLE_MINIKUBE" == "true" ] || [ "$ENABLE_MINIKUBE" == "True" ] || [ "$ENABLE_MINIKUBE" == "TRUE" ]; then
  isMinikubeRunning
fi

NAMESPACE="vmbc-epirus"

if [ ! -f ../vmbc/.env.config ]; then
   infoln ''
   fatalln '---------------- file ../vmbc/.env.config does not exist. ----------------'
fi


cp k8s-explorer.yml.tmpl k8s-explorer.yml

sed $OPTS "s!explorer_repo!${explorer_repo}!ig
        s!explorer_tag!${explorer_tag}!ig"  k8s-explorer.yml;

# registry login
registryLogin

infoln ''
infoln "---------------- Pulling image web3labs/epirus-free:latest, this may take several minutes... ----------------"
docker pull web3labs/epirus-free-api:latest
docker pull web3labs/epirus-free-web:latest
docker pull web3labs/epirus-free-ingestion:latest

infoln ''
infoln '---------------- Creating Explorer Configmaps ----------------'
kubectl create namespace ${NAMESPACE}
kubectl create cm explorer-configmap --from-env-file=../vmbc/.env.config --namespace ${NAMESPACE}
#kubectl create secret docker-registry regcred-explorer --docker-server=vmwaresaas.jfrog.io --docker-username='${benzeneu}' --docker-password='${benzene}' --docker-email=ask_VMware_blockchain@VMware.com --namespace=${NAMESPACE}
sleep 5

infoln ''
infoln '---------------- Creating Explorer PoD ----------------'
kubectl apply -f k8s-explorer.yml --namespace ${NAMESPACE}
sleep 10
infoln ''
infoln '---------------- Get the URL   ----------------'
if [ "$ENABLE_MINIKUBE" == "true" ] || [ "$ENABLE_MINIKUBE" == "True" ] || [ "$ENABLE_MINIKUBE" == "TRUE" ]; then
  minikube service vmbc-mongodb --url --namespace ${NAMESPACE}
else
   kubectl get service vmbc-mongodb  --namespace ${NAMESPACE}
fi
successln '========================== DONE ==========================='
infoln ''
