# Introducing VMware Blockchain Ethereum Early Beta Developer Kit

We are so glad that you have found this repository!

The VMware Blockchain team has architected an extensible blockchain platform that is capable of supporting multiple smart contract lanauges, where each language runs on its own unique execution engine. Back in 2019, VMware Blockchain started first with the Daml smart contract language, highly ideal for mission critical capital market applications. Since then, we have received strong interest to support the Solidity smart contract language, tareted at a broad set of usecaes that can benefit from the power of blockchain. To support that, VMware Blockchain team integrated the EVMOne Ethereum virutal machine, and voila - you can now run Solidty on VMware Blockchain!



*** **Please note that the VMware Blockchain Ethereum Developer Kit is under early beta and functionality is subject to change** ***


# Target Persona and Deployment Model
Using the developer kit, Ethereum developer(s) can start developing or porting their existing decentralized applications (dApps) to a single host VMware Blockchain deployment on their local desktop/laptop or Cloud VM. 

# System Requirements 
| Components | Description |
|-----------|-------------|
|  Operating System | Apple® macOS® 12.x |
|                   |  Linux Ubuntu® 16.x, 20.x |
|  vCPU             | 4 vCPU or more |
|  RAM              | 12 GB of RAM or more |
|  Disk Space       | 50 GB of free disk space or more |

# Pre-requisites - System Software for Linux
| Software | Versions |
|-----------|-------------|
| minikube	|1.25.1 or more	https://minikube.sigs.k8s.io/docs/start/ |
| Kubectl	  |Client Version: v1.23.4 or more
|           |Server Version: v1.23.1 or more	https://kubernetes.io/docs/tasks/tools/ |
| docker	  | 18.06.1-ce, build e68fc7a or above	https://docs.docker.com/engine/install/ubuntu/ |

# Pre-requisites - System Software for macOS
| Software | Versions |
|-----------|-------------|
| minikube	| 1.25.1 or more	https://minikube.sigs.k8s.io/docs/start/ |
| Kubectl	  | Client Version: v1.23.4 or more |
|           | Server Version: v1.23.1 or more	https://kubernetes.io/docs/tasks/tools/ |
| VirutalBox |	6.x	https://www.virtualbox.org/wiki/Downloads |

# Pre-requisites - Install Python modules
```
cd vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit
pip3 install -r vmbc/config/requirements.txt
```

# Pre-requisites - Starting Minikube
See scripts under`minikube` folder that provides convenience scripts to start and delete minikube. 
```
cd vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit/minikube 
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

# VMware Blockchain Change directory
```
cd vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit/vmbc/script
```

# VMware Blockchain Set the username and password
```
./vmbc-cli --set-username-password --username username --password password
```

# VMware Blockchain Deployment
```
./vmbc-cli --deployment-type PROVISION 
```
# VMware Blockchain Healthcheck
``` 
./vmbc-cli --healthcheck 
```

# Deploy sample dapp (Optional)
```
cd vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit/dapp 
./k8s-dapp-launch.sh
```

# Deploy Explorer (Optional)
```
cd vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit/explorer 
./k8s-explorer-launch.sh
```

# Deploy ELK stack (Optional)
```
cd vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit/elk

./elk-elastic-launch.sh ; ( make sure that elasticsearch is working before moving further )

./elk-kibana-launch.sh ; ( make sure that kibana is working before moving further )

./elk-fluentd-lanch.sh
```

# VMware Blockchain Deployment Cleanup
```
cd vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit/vmbc/script
./vmbc-cli --deployment-type DEPROVISION
```

# Minikube Cleanup
```
cd vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit/minikube 
./minikube-delete.sh
```
# Popular tools to use with VMware Blockchain Ethereum Developer Kit
Hardhat

Truffle

Remix

Metamask

Mythril
