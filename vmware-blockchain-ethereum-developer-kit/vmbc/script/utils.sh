#!/bin/bash

C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'
C_YELLOW='\033[0;33m'

# println echos string no color
function println() {
  echo -e "$1"
}

# red for error
function errorln() {
  println "${C_RED}${1}${C_RESET}"
}

# green for success
function successln() {
  println "${C_GREEN}${1}${C_RESET}"
}

# blue for information
function infoln() {
  println "${C_BLUE}${1}${C_RESET}"
}

# yellow for warning
function warnln() {
  println "${C_YELLOW}${1}${C_RESET}"
}

# red for fatal and exit 
function fatalln() {
  errorln "$1"
  exit 1
}

# Check pre-requisites are installed or not
function checkPreReqs() 
{
    getOptions
    sourceEnv
    if [ "$ENABLE_MINIKUBE" == "true" ] || [ "$ENABLE_MINIKUBE" == "True" ] || [ "$ENABLE_MINIKUBE" == "TRUE" ]; then
        if ! command minikube version --short >/dev/null 2>&1; then
            fatalln "minikube is NOT installed. Install minikube before proceeding further."
        fi
    fi
    
    if ! command kubectl  >/dev/null 2>&1; then
        fatalln "kubectl is NOT installed. Install kubectl before proceeding further."
    fi
    
    if [ "$ARCH" == "Darwin" ]; then
        if ! command VBoxManage -version >/dev/null 2>&1; then
            fatalln "VirtualBox is NOT installed. Install VirtualBox before proceeding further."
        fi
    else
        if ! command docker version --format '{{.Client.Version}}' >/dev/null 2>&1; then
            fatalln "docker is NOT installed. Install docker before proceeding further."
        fi
    fi
    
    if ! command python3 --version >/dev/null 2>&1; then
        fatalln "python3 is NOT installed. Install python3 before proceeding further."
    fi
    
}

# Check minikube is running or not
function isMinikubeRunning()
{
  isRunning=`minikube status | grep -e 'apiserver: Running' -e 'kubelet: Running' -e 'host: Running' -c`
  if [ $isRunning -eq 3 ]; then
    echo "Minikube is Running..."
  else 
    fatalln "Minikube is NOT running. Start the minikube before proceeding further."
  fi
}

# get options
function getOptions()
{
  ARCH=$(uname -s)
  if [ "$ARCH" == "Darwin" ]; then
    OPTS="-it"
  else
    OPTS="-i"
  fi
}

# souce env
function sourceEnv()
{
  MODE='release'
  if [ "$MODE" == "release" ]; then
    . ../.env.release
  else
    . ../config/.env
  fi
}

# Registry login
function registryLogin()
{
  if [ "$MODE" == "release" ]; then
    if [ "$ENABLE_MINIKUBE" == "true" ] || [ "$ENABLE_MINIKUBE" == "True" ] || [ "$ENABLE_MINIKUBE" == "TRUE" ]; then
      isMinikubeRunning=`minikube status | grep -e 'apiserver: Running' -e 'kubelet: Running' -e 'host: Running' -c`
      if [ $isMinikubeRunning -ne 3 ]; then
        fatalln "Minikube MODE is ON. But minikube is not running..."
      fi
      infoln ''
      infoln "---------------- Registry Login ----------------"
      minikube ssh "docker login vmwaresaas.jfrog.io --username '${benzeneu}' --password '${benzene}'"
      if [ "$?" -ne "0" ]; then
        fatalln "Invalid Credentials. Exiting.."
      fi
    else
      # Release mode, but non-minikube ( uses docker)
      if docker info > /dev/null 2>&1; then
        infoln ''
        infoln "---------------- Registry Login ----------------"
        docker login vmwaresaas.jfrog.io --username "${benzeneu}" --password "${benzene}"
        if [ "$?" -ne "0" ]; then
          fatalln "Invalid Credentials. Exiting.."
        fi
      else
        fatalln "This script uses docker, and it isn't running - please start docker and try again!"
      fi
    fi
  else
    if [ -z ${ARTIFACTORY_KEY} ]; then
        fatalln "ARTIFACTORY_KEY is unset. Please set the ARTIFACTORY_KEY for the docker registry"
    fi
fi
}
export -f sourceEnv
export -f registryLogin
export -f getOptions
export -f isMinikubeRunning
export -f checkPreReqs
export -f errorln
export -f successln
export -f infoln
export -f warnln
