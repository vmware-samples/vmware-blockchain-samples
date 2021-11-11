#!/bin/sh

pushd  ../supply-chain

### Make sure we are in minikube env
eval $(minikube docker-env)

### Remove the older image
docker rmi vmbc-eth-starter-kit/vmbc-supply-chain:1.0 -f

### Build new image with cache
docker build --no-cache -f Dockerfile.starterkit -t vmbc-eth-starter-kit/vmbc-supply-chain:1.0 .

popd

