#!/bin/sh

### minikube configurations ###

# Make sure we are in minikube environment
eval $(minikube docker-env)

# Make sure the image is from local NOT from docker repo
# imagePullPolicy: Never (check in deploy file)
#minikube image load vmbc-eth-starter-kit/vmbc-supply-chain:1.0

### Deploy now 
kubectl apply -f ./k8s-supply-chain.yml

### Get the URL and run it on browser
minikube service supply-chain --url

