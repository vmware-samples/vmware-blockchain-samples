#!/bin/bash

echo ''
echo '---------------- Starting minikube cluster ----------------'

case "$OSTYPE" in
  darwin*)  driver="virtualbox" ;;
  linux*)   driver="docker" ;;
  *)        echo "NOT Supported : $OSTYPE" ;;
esac

echo "Using driver $driver..."
minikube start --vm-driver=$driver --cpus 4 --memory 12288 --disk-size 50g

echo '========================== DONE ==========================='
echo ''