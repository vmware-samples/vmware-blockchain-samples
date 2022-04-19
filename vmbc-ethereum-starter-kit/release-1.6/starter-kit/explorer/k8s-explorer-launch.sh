#!/bin/bash
set -e

ARCH=$(uname -s)
if [ "$ARCH" == "Darwin" ]; then
  OPTS="-it"
else
  OPTS="-i"
fi

cp k8s-explorer.yml.tmpl k8s-explorer.yml

# For explorer always pull images from JFrog
. ../vmbc/.env.release

echo ''
echo "---------------- Pulling image ${explorer_repo}:${explorer_tag} ----------------"
eval $(minikube docker-env)
echo "vuskIH\$N&^a7" > dockerpass.txt
cat dockerpass.txt |  docker login --username vmbc-ro-token --password-stdin  vmwaresaas.jfrog.io
docker pull ${explorer_repo}:${explorer_tag}
rm dockerpass.txt
eval $(minikube docker-env -u)

sed $OPTS "s!explorer_repo!${explorer_repo}!ig
        s!explorer_tag!${explorer_tag}!ig"  k8s-explorer.yml;

echo ''
echo '---------------- Creating DAPP Configmaps ----------------'
kubectl create cm explorer-configmap --from-env-file=../vmbc/.env.config --namespace vmbc
sleep 5 

echo ''
echo '---------------- Creating Explorer PoD ----------------'
kubectl apply -f k8s-explorer.yml --namespace vmbc
sleep 10
echo ''
echo '---------------- Get the URL   ----------------'
minikube service vmbc-explorer --url --namespace vmbc
echo '========================== DONE ==========================='
echo ''
