#!/bin/bash

. ../vmbc/script/utils.sh

println ''
infoln '---------------- Starting minikube cluster ----------------'

case "$OSTYPE" in
  darwin*)  driver="virtualbox" ;;
  linux*)   driver="docker" ;;
  *)        fatalln "NOT Supported : $OSTYPE" ;;
esac

infoln "Using driver $driver..."
minikube start --force --vm-driver=$driver

successln '========================== DONE ==========================='
infoln ''
