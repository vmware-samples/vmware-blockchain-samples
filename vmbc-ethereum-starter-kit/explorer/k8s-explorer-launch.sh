#!/bin/bash
set -e

. ../vmbc/script/utils.sh

MODE='release'
if [ "$MODE" == "release" ]; then
  . ../vmbc/.env.release
else
  . ../vmbc/config/.env
fi

NAMESPACE="vmbc-explorer"

ARCH=$(uname -s)
if [ "$ARCH" == "Darwin" ]; then
  OPTS="-it"
else
  OPTS="-i"
fi

if [ ! -f ../vmbc/.env.config ]; then
   infoln ''
   fatalln '---------------- file ../vmbc/.env.config does not exist. ----------------'
fi


cp k8s-explorer.yml.tmpl k8s-explorer.yml

sed $OPTS "s!explorer_repo!${explorer_repo}!ig
        s!explorer_tag!${explorer_tag}!ig"  k8s-explorer.yml;

if [ "$MODE" == "release" ]; then
    infoln ''
    infoln "---------------- Registry Login ----------------"
    minikube ssh "docker login vmwaresaas.jfrog.io --username '${benzeneu}' --password '${benzene}'"
    if [ "$?" -ne "0" ]; then
        fatalln "Invalid Credentials. Exiting.."
        exit 1
    fi
else
    if [ -z ${ARTIFACTORY_KEY} ]; then
        echo "ARTIFACTORY_KEY is unset. Please set the ARTIFACTORY_KEY for the docker registry"
        exit 1
    fi
fi

infoln ''
infoln "---------------- Pulling image  ${explorer_repo}:${explorer_tag}, this may take several minutes... ----------------"
minikube ssh "docker pull ${explorer_repo}:${explorer_tag}"

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
