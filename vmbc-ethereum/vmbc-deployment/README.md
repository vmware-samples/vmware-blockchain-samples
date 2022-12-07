# Developer Kit Deployment
## System Requirements for Minikube
| Components | Description |
|-----------|-------------|
|  Operating System | Apple® macOS® 12.x |
|                   | Linux Ubuntu® 16.x, 20.x |
|  Minikube         | 1.28 or newer |
|  CPUs             | 4 CPU (8 CPU with ELK) |
|  Memory           | 16 GB (22 GB with ELK) |
|  Disk Size        | 200 GB or more |

Note: If the Apple Laptop is with M1, Minikube setup has some additonal considerations, for more details follow [this page](./MAC-Apple-Silicon-README.md)

```sh
cd vmware-blockchain-samples/vmbc-ethereum/vmbc-four-node-one-client-deployment
helm install --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password=<password> <name of blockchain> .
```

# Cloud Deployment
## System Requirements for AWS EKS
| Components | Description |
|-----------|-------------|
|  Kubernetes       | 1.22 or newer |
|  EC2 Instances    | 6 nodes of m4.4xlarge |
|  EBS Volume Type  | gp2 |

```sh
cd vmware-blockchain-samples/vmbc-ethereum/vmbc-four-node-one-client-deployment
helm install --set global.storageClassName=gp2 --set resources.replica.cpuRequest=10000m --set resources.replica.cpuLimit=10000m --set resources.replica.memoryRequest=56Gi --set resources.replica.memoryLimit=56Gi --set resources.client.cpuRequest=5000m --set resources.client.cpuLimit=5000m --set resources.client.memoryRequest=28Gi --set resources.client.memoryLimit=28Gi --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password=<password> <name of blockchain> . 
```
