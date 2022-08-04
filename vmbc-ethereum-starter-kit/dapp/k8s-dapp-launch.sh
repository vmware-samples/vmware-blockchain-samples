#!/bin/bash
set -e
. ../vmbc/script/utils.sh

MODE='release'
if [ "$MODE" == "release" ]; then
  . ../vmbc/.env.release
else
  . ../vmbc/config/.env
fi

NAMESPACE="vmbc-dapp"

if [ ! -f ../vmbc/.env.config ]; then
   infoln ''
   fatalln '---------------- file ../vmbc/.env.config does not exist. ----------------'
fi

ARCH=$(uname -s)
if [ "$ARCH" == "Darwin" ]; then
  OPTS="-it"
else
  OPTS="-i"
fi

cp erc20-swap-dapp.yml.tmpl erc20-swap-dapp.yml

sed $OPTS "s!erc20swap_repo!${erc20swap_repo}!ig
        s!erc20swap_tag!${erc20swap_tag}!ig"  erc20-swap-dapp.yml;

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
infoln "---------------- Pulling image  ${erc20swap_repo}:${erc20swap_tag}, this may take several minutes... ----------------"
minikube ssh "docker pull ${erc20swap_repo}:${erc20swap_tag}"

infoln ''
infoln '---------------- Creating DAPP Configmaps ----------------'
kubectl create namespace ${NAMESPACE}
kubectl create cm dapp-configmap --from-env-file=../vmbc/.env.config --namespace ${NAMESPACE}
kubectl create secret docker-registry regcred-dapp --docker-server=vmwaresaas.jfrog.io --docker-username='${benzeneu}' --docker-password='${benzene}' --docker-email=ask_VMware_blockchain@VMware.com --namespace=${NAMESPACE}
sleep 5 

infoln ''
infoln '---------------- Creating DAPP PoD ----------------'
kubectl apply -f erc20-swap-dapp.yml --namespace ${NAMESPACE}
sleep 10
infoln ''
infoln '---------------- Get the URL   ----------------'
minikube service erc20-swap --url --namespace ${NAMESPACE}
successln '========================== DONE ==========================='
infoln ''
