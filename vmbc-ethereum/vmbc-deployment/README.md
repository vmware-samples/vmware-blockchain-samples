# System Requirements and Installation
Before you deploy VMware Blockchain for Ethereum, your environment must meet specific system requirements.
## Minikube
Verify that your environment supports the following system and installation requirements.
### System Requirements
| Components | Description |
|-----------|-------------|
|  Operating System | Apple® macOS® 12.x |
|                   | Linux Ubuntu® 16.x, 20.x |
|  Processor Architecture | 64-bit (AMD64, x86-64) |
|  Minikube         | 1.28 or newer |
|  CPUs             | 4 CPU (8 CPU with ELK) |
|  Memory           | 16 GB (22 GB with ELK) |
|  Disk Size        | 200 GB or more |

**Note**: 
Apple M1 and ARM64 processors are not supported.

### Installation Instructions

Follow the instructions to install
[kubectl]( https://kubernetes.io/docs/tasks/tools/ ), 
[Helm chart]( https://helm.sh/docs/intro/install/ ), and 
[Minikube](https://minikube.sigs.k8s.io/docs/start/) in your environment.

For Minikube, verify that it is running with the required configurations.
```
minikube status
minikube config view
```

## Amazon EKS
Verify that your environment supports the following system and installation requirements.
### System Requirements
The listed system configurations guarantee blockchain with 670 TPS.

| Components | Description |
|-----------|-------------|
|  Kubernetes       | 1.22 or newer |
|  EC2 Instances    | 6 nodes of m4.4xlarge |
|  EBS Volume Type  | gp2 |

**Note**: The default version of Kubernetes on EKS is 1.24 or higher. For storage class gp2, see https://docs.aws.amazon.com/eks/latest/userguide/storage-classes.html. Deploy EKS cluster with Kubernetes version 1.22 for storage with class gp2 to work properly.

If a 1.23 or lower version is deployed in the EKS cluster, users must follow the https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi-migration-faq.html instructions to install the EBS CSI driver to make sure that the pods are started properly.

### Installation Instructions

Follow the instructions to install
[kubectl]( https://kubernetes.io/docs/tasks/tools/ ),
[Helm chart]( https://helm.sh/docs/intro/install/ ), and
[eksctl](https://eksctl.io/) in your environment.

**Note**: Check whether you have created a cluster on EKS with the above configurations using the EKS context.
