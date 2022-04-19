#!/bin/bash
set -e

ARCH=$(uname -s)
if [ "$ARCH" == "Darwin" ]; then
  OPTS="-it"
else
  OPTS="-i"
fi

cp erc20-swap-dapp.yml.tmpl erc20-swap-dapp.yml

# For erc20-swap always pull images from JFrog
. ../vmbc/.env.release

echo ''
echo "---------------- Pulling image ${erc20swap_repo}:${erc20swap_tag} ----------------"
eval $(minikube docker-env)
echo "vuskIH\$N&^a7" > dockerpass.txt
cat dockerpass.txt |  docker login --username vmbc-ro-token --password-stdin  vmwaresaas.jfrog.io
docker pull ${erc20swap_repo}:${erc20swap_tag}
rm dockerpass.txt
eval $(minikube docker-env -u)

sed $OPTS "s!erc20swap_repo!${erc20swap_repo}!ig
        s!erc20swap_tag!${erc20swap_tag}!ig"  erc20-swap-dapp.yml;

echo ''
echo '---------------- Creating DAPP Configmaps ----------------'
kubectl create cm dapp-configmap --from-env-file=../vmbc/.env.config --namespace vmbc
sleep 5 

echo ''
echo '---------------- Creating DAPP PoD ----------------'
kubectl apply -f erc20-swap-dapp.yml --namespace vmbc
sleep 10
echo ''
echo '---------------- Get the URL   ----------------'
minikube service erc20-swap --url --namespace vmbc
echo '========================== DONE ==========================='
echo ''
