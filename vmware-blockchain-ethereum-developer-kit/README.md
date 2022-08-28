# VMware Blockchain Ethereum Developer Kit

We are so glad that you have found this repository!

The VMware Blockchain team has architected an extensible blockchain platform that is capable of supporting multiple smart contract languages, where each language runs on its own unique execution engine. Back in 2019, VMware Blockchain started first with the Daml smart contract language, highly ideal for mission critical capital market applications. Since then, we have received strong interest to support the Solidity smart contract language, which is targeted at a broad set of use cases that can benefit from the power of blockchain. To support that, VMware Blockchain team integrated the EVMOne Ethereum virtual machine, and voila - you can now run Solidity on VMware Blockchain! 


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

# VMware Blockchain Gas Free Mode for Ethereum
...
In the public Ethereum network, gas refers to the cost necessary to perform a transaction on the network. Miners set the price of gas based on supply and demand for the computational power of the network needed to process smart contracts and other transactions. Requiring a fee for every transaction executed on the network provides a layer of security to the Ethereum network by making it too expensive for malicious users to spam the network. VMware Blockchain is a private, permissioned, and managed network, therefore it is not necessary to charge for computation power. In addition, the SBFT protocol it uses protects it from byzantine attacks. Since gas fees are not needed, VMBC supports a gas-free mode which simplifies Dapp deployment. 
...

# Deploy Block Explorer (Optional)
Block Explorer can be used to view transactions and blocks in the VMware Blockchain for Ethereum
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

# Deploy sample dapp (Optional)
```
cd vmware-blockchain-samples/vmware-blockchain-ethereum-developer-kit/dapp 
./k8s-dapp-launch.sh
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

# Supported JSON-RPC API endpoints aligning with reference to APIs in https://ethereum.org/en/developers/docs/apis/json-rpc/
eth_accounts

eth_blockNumber

eth_call

eth_chainId (Reference is EIP-695)

eth_estimateGas

eth_gasPrice

eth_getBalance

eth_getBlockByHash

eth_getBlockByNumber

eth_getBlockTransactionCountByHash

eth_getBlockTransactionCountByNumber

eth_getCode

eth_getLogs

eth_getStorageAt

eth_getTransactionByBlockHashAndIndex

eth_getTransactionByBlockNumberAndIndex

eth_getTransactionByHash

eth_getTransactionCount

eth_getTransactionReceipt

eth_sendRawTransaction

eth_sendTransaction

net_listening

net_version
