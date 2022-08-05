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
if $ENABLE_MINIKUBE; then
  isMinikubeRunning
fi

NAMESPACE="vmbc-explorer"

if [ ! -f ../vmbc/.env.config ]; then
   infoln ''
   fatalln '---------------- file ../vmbc/.env.config does not exist. ----------------'
fi


cp k8s-explorer.yml.tmpl k8s-explorer.yml

sed $OPTS "s!explorer_repo!${explorer_repo}!ig
        s!explorer_tag!${explorer_tag}!ig"  k8s-explorer.yml;

# registry login
registryLogin

if $ENABLE_MINIKUBE; then
  infoln ''
  infoln "---------------- Pulling image  ${explorer_repo}:${explorer_tag}, this may take several minutes... ----------------"
  minikube ssh "docker pull ${explorer_repo}:${explorer_tag}"
fi

infoln ''
infoln '---------------- Creating Explorer Configmaps ----------------'
kubectl create namespace ${NAMESPACE}
kubectl create cm explorer-configmap --from-env-file=../vmbc/.env.config --namespace ${NAMESPACE}
kubectl create secret docker-registry regcred-explorer --docker-server=vmwaresaas.jfrog.io --docker-username='${benzeneu}' --docker-password='${benzene}' --docker-email=ask_VMware_blockchain@VMware.com --namespace=${NAMESPACE} 
sleep 5 

infoln ''
infoln '---------------- Creating Explorer PoD ----------------'
kubectl apply -f k8s-explorer.yml --namespace ${NAMESPACE}
sleep 10
infoln ''
infoln '---------------- Get the URL   ----------------'
minikube service vmbc-explorer --url --namespace ${NAMESPACE}
successln '========================== DONE ==========================='
infoln ''
