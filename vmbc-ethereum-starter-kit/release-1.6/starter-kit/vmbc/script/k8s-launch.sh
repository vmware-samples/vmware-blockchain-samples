#!/bin/bash
set -e

REPLICA_COUNT=4
CLIENT_NODE_COUNT=1
BFT_CLIENT_COUNT=50

JFROG_PASSWORD=""

ARCH=$(uname -s)
if [ "$ARCH" == "Darwin" ]; then
  OPTS="-it"
else
  OPTS="-i"
fi

## Parse mode
MODE='None'
if [[ $# -lt 1 ]] ; then
  MODE='release'
else
  MODE=$1
fi

#
# Pull all VMBC docker images ethrpc, clientservice and concord
# 
pullVmbcImages() {
  echo ''
  echo "---------------- Pulling image ${concord_repo}:${concord_tag} ----------------"
  docker pull ${concord_repo}:${concord_tag}
  echo ''
  echo "---------------- Pulling image ${ethrpc_repo}:${ethrpc_tag} ----------------"
  docker pull ${ethrpc_repo}:${ethrpc_tag}
  echo ''
  echo "---------------- Pulling image ${clientservice_repo}:${clientservice_tag} ----------------"
  docker pull ${clientservice_repo}:${clientservice_tag}
}

#
# Perhaps there could be a new VMBC images, so we have to generate new .env 
# and pull new version of docker iamges from vmwathena and generate TLS certs.
# At last, copy all generated config files to vmbc/config dir
#
generateConfigFiles() {
  if [ "$MODE" == "internal" ]; then
    echo ''
    echo '---------------- Generate new config files ----------------'
    cd ../../../../../docker
    ./make-prebuilt-env.sh > new.env && mv new.env .env; 

    . .env
    
    export DOCKER_RUN_NOTTY=true
    pullVmbcImages
    
    rm -rf devdata; 
    ./gen-docker-concord-config.sh config-public/dockerConfigurationInput-eth.yaml
    ./gen-docker-client-config.sh config-public/dockerClientConfigInput-eth.yaml

    cd -

    echo ''
    echo '---------------- Creating new tls_certs ----------------'
    ../../../../../concord/submodules/concord-bft/scripts/linux/create_tls_certs.sh ${BFT_CLIENT_COUNT} ../config/tls_certs

    echo ''
    echo '---------------- Copying config files ----------------'
    cd ../config
    ./copyFiles.sh
    cd -
  fi
}

#
# Copy yml from template files so that we will not loose the template for next version of docker images
#
copyYmlFromTmplate() 
{
  echo ''
  echo '---------------- Replace new image and tag ----------------'
  cp ../k8s-clientservice.yml.tmpl ../k8s-clientservice.yml
  cp ../k8s-ethrpc.yml.tmpl ../k8s-ethrpc.yml
  cp ../k8s-replica-node1.yml.tmpl ../k8s-replica-node1.yml
  cp ../k8s-replica-node2.yml.tmpl ../k8s-replica-node2.yml
  cp ../k8s-replica-node3.yml.tmpl ../k8s-replica-node3.yml
  cp ../k8s-replica-node4.yml.tmpl ../k8s-replica-node4.yml
}

#
# The env file path is different for internal and release mode
# 
sourceEnvFile() 
{
  if [ "$MODE" == "internal" ]; then
    echo ''
    echo "---------------- Internal MODE... ----------------"
    envFile=../../../../../docker/.env
    . ${envFile}
  elif [ "$MODE" == "release" ]; then
    echo ''
    echo "---------------- Release MODE... ----------------"
    envFile=../.env.release
    . ${envFile}
  else 
    echo ''
    echo "---------------- Invalid MODE, MODE should be \'internal/release\' ----------------"
    exit 0
  fi
}

#
# Replace template docker image text with actual docker image path
#
replaceTemplWithImage()
{
  sed $OPTS "s!concord_repo!${concord_repo}!ig
                s!concord_tag!${concord_tag}!ig"  ../k8s-replica-node1.yml;
  sed $OPTS "s!concord_repo!${concord_repo}!ig
            s!concord_tag!${concord_tag}!ig"  ../k8s-replica-node2.yml;
  sed $OPTS "s!concord_repo!${concord_repo}!ig
            s!concord_tag!${concord_tag}!ig"  ../k8s-replica-node3.yml;
  sed $OPTS "s!concord_repo!${concord_repo}!ig
            s!concord_tag!${concord_tag}!ig"  ../k8s-replica-node4.yml;

  sed $OPTS "s!ethrpc_repo!${ethrpc_repo}!ig
            s!ethrpc_tag!${ethrpc_tag}!ig"  ../k8s-ethrpc.yml;
  sed $OPTS "s!clientservice_repo!${clientservice_repo}!ig
            s!clientservice_tag!${clientservice_tag}!ig"  ../k8s-clientservice.yml;
}


#
# Create configmaps, create Persistent Volume Claims and create PoD for concord
#
createConcordConfigmaps()
{
  concord="$1"
  namespace=vmbc-"$2"
  echo ''
  echo "---------------- Creating concord${concord} Configmaps ----------------"
  kubectl create cm concord${concord}-deployment-config --from-file=../config/config-concord${concord}/deployment.config --namespace=${namespace}
  kubectl create cm concord${concord}-application-config --from-file=../config/config-concord${concord}/application.config --namespace=${namespace}
  kubectl create cm concord${concord}-secrets-config --from-file=../config/config-concord${concord}/secrets.config --namespace=${namespace}
  kubectl create cm concord${concord}-configmap --from-file=../config/clientservice/tr_certs/concord${concord} --namespace=${namespace}
  kubectl create cm ethrpc-configmap --from-file=../config/config-public --namespace=${namespace}
  kubectl create cm concord-signing-configmap --from-file=../config/transaction_signing_keys --namespace=${namespace}
  kubectl create cm concord-signing-configmap-1 --from-file=../config/transaction_signing_keys/1 --namespace=${namespace}
  kubectl create cm concord-signing-configmap-2 --from-file=../config/transaction_signing_keys/2 --namespace=${namespace}
  kubectl create cm concord-signing-operator --from-file=../config/operator_signing_keys --namespace=${namespace}
  kubectl create secret docker-registry regcred-concord${concord} --docker-server=vmwaresaas.jfrog.io --docker-username=vmbc-ro-token --docker-password=${JFROG_PASSWORD} --docker-email=ask_VMware_blockchain@VMware.com --namespace=${namespace}
  createTLSConfigmaps $2
  echo ''
  echo '---------------- Creating Persistent Volume Claims ----------------'
  kubectl apply -f ../config/k8s-replica-node${concord}-pvc.yml --namespace=${namespace}
  echo ''
  echo '---------------- Creating Replica Node PoDs ----------------'
  kubectl apply -f ../k8s-replica-node${concord}.yml --namespace=${namespace}
}

#
# Create TLS configmaps ( make sure TLS certs already generated )
#
createTLSConfigmaps()
{
  namespace=vmbc-"$1"

  echo ''
  echo "---------------- Creating ${namespace} TLS certs Configmaps ----------------"

  for ((i = 0 ; i <= ((BFT_CLIENT_COUNT-1)) ; i++)); do
    kubectl create secret generic concord-tls-${i}-client-pk --from-file=../config/tls_certs/${i}/client/pk.pem --namespace=${namespace}
    kubectl create cm concord-tls-${i}-client-cert --from-file=../config/tls_certs/${i}/client/client.cert --namespace=${namespace}
    kubectl create secret generic concord-tls-${i}-server-pk --from-file=../config/tls_certs/${i}/server/pk.pem --namespace=${namespace}
    kubectl create cm concord-tls-${i}-server-cert --from-file=../config/tls_certs/${i}/server/server.cert --namespace=${namespace}
  done
}

#
# Create namespaces for VMBC components ( 1 namespace for 1 PoD )
# 
createNamespaces() 
{
  echo ''
  echo '---------------- Creating Namespaces ----------------'
  kubectl create namespace vmbc-client1
  for ((i = 1 ; i <= ${REPLICA_COUNT} ; i++)); do
    kubectl create namespace vmbc-replica${i}
  done
}

#
# Create secret for ethrpc
# 
createEthrpcSecret() {
  echo ''
  echo ''
  echo '---------------- Creating ethrpc Secret ----------------'
  kubectl create secret generic ethrpc-secret --from-file=../config/config-ethrpc1/keystore.p12 --namespace=vmbc-client1
  kubectl create secret docker-registry regcred-ethrpc1 --docker-server=vmwaresaas.jfrog.io --docker-username=vmbc-ro-token --docker-password=${JFROG_PASSWORD} --docker-email=ask_VMware_blockchain@VMware.com --namespace=vmbc-client1 
}

#
# Create clientservice configmaps
#
createClientServiceConfigMap() {
  echo ''
  echo '---------------- Creating clientservice Configmaps ----------------'
  kubectl create cm ethrpc-configmap --from-file=../config/config-public --namespace=vmbc-client1
  kubectl create cm ethrpc-participant --from-file=../config/config-participant0 --namespace=vmbc-client1
  kubectl create cm ethrpc-configmap-trcerts --from-file=../config/clientservice/tr_certs/clientservice1 --namespace=vmbc-client1
  kubectl create cm concord-signing-configmap-1 --from-file=../config/transaction_signing_keys/1 --namespace=vmbc-client1
  kubectl create secret docker-registry regcred-clientservice1 --docker-server=vmwaresaas.jfrog.io --docker-username=vmbc-ro-token --docker-password=${JFROG_PASSWORD} --docker-email=ask_VMware_blockchain@VMware.com --namespace=vmbc-client1 
  createTLSConfigmaps "client1"
}

#
# Create concord configmaps
#
createConcordConfigMapsPoD() {
  for ((j = 1 ; j <= ${REPLICA_COUNT}; j++)); do
    createConcordConfigmaps ${j} replica${j}
  done
}

#
# Create clientservice PoD
#
createClientservicePod() {
  echo ''
  echo '---------------- Creating Clientservice PoD ----------------'
  kubectl apply -f ../k8s-clientservice.yml --namespace=vmbc-client1
}

#
# Create ethrpc PoD
#
createEthrpcPod() {
  kubectl apply -f ../k8s-ethrpc.yml --namespace=vmbc-client1
}

#
# Display the env config file ( which can be used to interact with VMBC components)
#
displayConfigFile() {
  echo ''
  CONFIG_FILE=../.env.config
  echo "---------------- Creating ${CONFIG_FILE} ----------------"
  MINIP=`minikube ip`
  MINPORT=30545
  echo "MINIKUBE_IP=${MINIP}" > ${CONFIG_FILE}
  echo "MINIKUBE_PORT=${MINPORT}" >> ${CONFIG_FILE}
  echo "VMBC_URL=http://${MINIP}:${MINPORT}" >> ${CONFIG_FILE}
  cat ${CONFIG_FILE}
}

#
# Replace concord1/2/3/4 with concord1/2/3/4.vmbc-concord1/2/3/4..svc.cluster.local
#
replaceConcordWithNamespace() 
{
  ARCH=$(uname -s)
  
  for ((i = 1 ; i <= ${REPLICA_COUNT} ; i++)); do
    orgString=concord${i}
    repString=concord${i}\\.vmbc-replica${i}\\.svc\\.cluster\\.local
    if [ "$ARCH" == "Darwin" ]; then
      sed -i ''  "s/${orgString}$/${repString}/g" ../config/config-participant0/participant.config
      for ((j = 1 ; j <= ${REPLICA_COUNT} ; j++)); do
        orgString=concord${j}
        repString=concord${j}\\.vmbc-replica${j}\\.svc\\.cluster\\.local
        sed -i ''  "s/${orgString}$/${repString}/g" ../config/config-concord${i}/deployment.config
      done
    else
      sed -i  "s/${orgString}$/${repString}/g" ../config/config-participant0/participant.config
      for ((k = 1 ; k <= ${REPLICA_COUNT} ; k++)); do
        orgString=concord${k}
        repString=concord${k}\\.vmbc-replica${k}\\.svc\\.cluster\\.local
        sed -i "s/${orgString}$/${repString}/g" ../config/config-concord${i}/deployment.config
      done
    fi
  done
  
}

########################### M A I N ############################
# Generate config files if it is internal mode
generateConfigFiles

# deployment.config should have service.namespace for concord images
replaceConcordWithNamespace

# Source the env file internal/release mode
sourceEnvFile

# Copy yml files from template files
copyYmlFromTmplate

# Replace docker image template text with actual docker image
replaceTemplWithImage

# Create k8s namespaces
createNamespaces

# Create ethrpc secret
createEthrpcSecret

# Create clientservice configmap
createClientServiceConfigMap

# Create concord configmap, TLS certs and create PoD
createConcordConfigMapsPoD

# Create clientservice PoD
createClientservicePod

# Create ethrpc PoD
createEthrpcPod

# Display Config file for reference only for minikube
displayConfigFile

echo ''
echo '========================== DONE ==========================='
