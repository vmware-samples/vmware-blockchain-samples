#!/bin/bash
set -e

. ./utils.sh

REPLICA_COUNT=4
## Parse mode
MODE='None'
if [[ $# -lt 1 ]] ; then
  MODE='release'
else
  MODE=$1
fi
if [ "$MODE" == "internal" ]; then
  . ../config/.env
else
  . ../.env.release
fi

infoln ''
infoln '---------------- Deleting Namespace, PV, PVC ----------------'
kubectl delete namespace vmbc-client1
for ((i = 1 ; i <= ${REPLICA_COUNT} ; i++)); do
  kubectl delete -f k8s-replica-node${i}-deployment.yml --namespace=vmbc-replica${i}
  kubectl delete -f ../config/k8s-replica-node${i}-pvc.yml --namespace=vmbc-replica${i}
  kubectl delete namespace vmbc-replica${i} 
  if [ "$ENABLE_MINIKUBE" == "true" ] || [ "$ENABLE_MINIKUBE" == "True" ] || [ "$ENABLE_MINIKUBE" == "TRUE" ]; then
    minikube ssh "sudo rm -rf /tmp/hostpath_pv/vmware-blockchain-concord${i}"
  else
    sudo rm -rf /tmp/hostpath_pv/vmware-blockchain-concord${i}
  fi
done

if [ "$MODE" == "internal" ]; then
   infoln ''
   infoln '---------------- Deleting devdata ----------------'
   cd $(dirname "${0}") 
   CWD=$(pwd -L)
   cd - 
   cd $CWD/../config
   rm -rf devdata clientservice client1 config-concord* config-participant* replica* cre
   cd - 
fi

if [ -f ../.env.config ]; then
   infoln ''
   infoln '---------------- Delete .env ----------------'
   rm ../.env.config
fi

if [ -f /tmp/last-blkchn-id ]; then
   infoln ''
   infoln '---------------- Delete last-blkchn-id ----------------'
   rm /tmp/last-blkchn-id
fi

successln '========================== DONE ==========================='
infoln ''
