# VMBC Ethereum Developer Kit

*** **Please note that the developer kit is under tech preview and functionality is subject to change** ***

# System Requirements 
| Components | Description |
|-----------|-------------|
|  Operating System | Apple® macOS® 12.x |
|                   |  Linux Ubuntu® 16.x, 20.x|
|  vCPU             | 4 vCPU or more |
|  RAM              | 12 GB of RAM or more |
|  Disk Space       | 50 GB of free disk space or more |

# Pre-requisites - System Software for Linux
| Software | Versions |
|-----------|-------------|
| minikube	|1.25.1 or more	https://minikube.sigs.k8s.io/docs/start/|
| Kubectl	  |Client Version: v1.23.4 or more
|           |Server Version: v1.23.1 or more	https://kubernetes.io/docs/tasks/tools/ |
| docker	  | 18.06.1-ce, build e68fc7a or above	https://docs.docker.com/engine/install/ubuntu/ |

# Pre-requisites - System Software for macOS
| Software | Versions |
|-----------|-------------|
| minikube	| 1.25.1 or more	https://minikube.sigs.k8s.io/docs/start/|
| Kubectl	  | Client Version: v1.23.4 or more |
|           | Server Version: v1.23.1 or more	https://kubernetes.io/docs/tasks/tools/ |
| VirutalBox |	6.x	https://www.virtualbox.org/wiki/Downloads |

# Pre-requisites - Install Python modules
```
cd vmware-blockchain-samples/vmbc-ethereum-starter-kit
pip3 install -r vmbc/config/requirements.txt
```

# Pre-requisites - Starting Minikube
See scripts under`minikube` folder that provides convenience scripts to start and delete minikube. 
```
cd vmware-blockchain-samples/vmbc-ethereum-starter-kit/minikube 
./minikube-start.sh
```

## Make sure 'minikube status' has the expected output described below.
```
minikube status 
 
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

# VMBC Change directory
```
cd vmware-blockchain-samples/vmbc-ethereum-starter-kit/vmbc/script
```

# VMBC Set the username and password
```
./vmbc-cli --set-username-password --username username --password password
```

# VMBC Deployment
```
./vmbc-cli --deployment-type PROVISION 
```
# VMBC Healthcheck
``` 
./vmbc-cli --healthcheck 
```

# Deploy sample dapp (Optional)
```
cd vmware-blockchain-samples/vmbc-ethereum-starter-kit/dapp 
./k8s-dapp-launch.sh
```

# Deploy Explorer (Optional)
```
cd vmware-blockchain-samples/vmbc-ethereum-starter-kit/explorer 
./k8s-explorer-launch.sh
```

# Deploy ELK stack (Optional)
```
cd vmware-blockchain-samples/vmbc-ethereum-starter-kit/elk

./elk-elastic-launch.sh ; ( make sure that elasticsearch is working before moving further )

./elk-kibana-launch.sh ; ( make sure that kibana is working before moving further )

./elk-fluentd-lanch.sh
```

# VMBC Deployment Cleanup
```
cd vmware-blockchain-samples/vmbc-ethereum-starter-kit/vmbc/script
./vmbc-cli --deployment-type DEPROVISION
```

# Minikube Cleanup
```
cd vmware-blockchain-samples/vmbc-ethereum-starter-kit/minikube 
./minikube-delete.sh
```

