#!/bin/bash
set -e

REPLICA_COUNT=4

echo ''
echo '---------------- Deleting Namespace ----------------'
kubectl delete namespace vmbc-client1
for ((i = 1 ; i <= ${REPLICA_COUNT} ; i++)); do
  kubectl delete namespace vmbc-replica${i}
done

echo ''
echo '---------------- Deleting devdata ----------------'
cd $(dirname "${0}") 
CWD=$(pwd -L)
cd - 
cd $CWD/../config
rm -rf devdata
cd - 

echo ''
echo '---------------- Delete .env ----------------'
rm ../.env.config

echo ''
echo '---------------- Delete tmp files ----------------'
rm -f ../k8s-ethrpc.yml ../k8s-clientservice.yml ../k8s-replica-node1.yml ../k8s-replica-node2.yml ../k8s-replica-node3.yml ../k8s-replica-node4.yml 

echo '========================== DONE ==========================='
echo ''