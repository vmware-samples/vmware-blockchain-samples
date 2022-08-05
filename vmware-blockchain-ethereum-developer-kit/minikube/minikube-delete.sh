#!/bin/bash 


. ../vmbc/script/utils.sh

if [ -f /tmp/last-blkchn-id ]; then
   infoln ''
   infoln '---------------- Delete last-blkchn-id ----------------'
   rm /tmp/last-blkchn-id
fi

infoln ''
infoln  '---------------- Deleting minikube cluster ----------------'
minikube delete --all=true &
PID=$!
wait $PID 

successln '========================== DONE ==========================='
infoln ''
