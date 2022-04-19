#!/bin/bash 

echo ''
echo '---------------- Deleting minikube cluster ----------------'
minikube delete --all=true &
PID=$!
wait $PID 
echo '========================== DONE ==========================='
echo ''
