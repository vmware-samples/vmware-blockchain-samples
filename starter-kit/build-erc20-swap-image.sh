#!/bin/sh

pushd  ../erc20-swap

### Make sure we are in minikube env
eval $(minikube docker-env)

### Remove the older image
docker rmi vmbc-eth-starter-kit/vmbc-erc20-swap:1.0 -f

### Build new image with cache
docker build --no-cache -f Dockerfile -t vmbc-eth-starter-kit/vmbc-erc20-swap:1.0 .

popd

