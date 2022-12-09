# Developer Kit Deployment - System Requirements and Prerequisites

## Minikube
### System Requirements
| Components | Description |
|-----------|-------------|
|  Operating System | Apple® macOS® 12.x |
|                   | Linux Ubuntu® 16.x, 20.x |
|  Processor Architecture | 64-bit (AMD64. x86-64) |
|  Minikube         | 1.28 or newer |
|  CPUs             | 4 CPU (8 CPU with ELK) |
|  Memory           | 16 GB (22 GB with ELK) |
|  Disk Size        | 200 GB or more |

Note: 
We do not currently support VMBC on Apple's M1 and ARM64 processor. We are working on adding support for this and will update the documentation when it's available.

### Prerequisites

Install the following
```
kubectl ( https://kubernetes.io/docs/tasks/tools/ )
helm chart ( https://helm.sh/docs/intro/install/ )
Minikube (https://minikube.sigs.k8s.io/docs/start/)
```

Make sure Minikube is running with required configs as presented above. To test, you may run
```
minikube status
minikube config view
```

## Amazon EKS
### System Requirements

The below system configurations ensures a high performant blockchain with 670 TPS.

| Components | Description |
|-----------|-------------|
|  Kubernetes       | 1.22 or newer |
|  EC2 Instances    | 6 nodes of m4.4xlarge |
|  EBS Volume Type  | gp2 |

Note: Current default version of Kubernetes on eks is 1.24+.
However, with storage class gp2, please see https://docs.aws.amazon.com/eks/latest/userguide/storage-classes.html.
Please deploy eks cluster with kubernetes version 1.22 for correct functionality with storage class gp2.

if >= 1.23 is used to deploy the EKS cluster then users must follow instructions from here to install the EBS CSI driver:
https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi-migration-faq.html
to ensure their pods are started correctly.

### Prerequisites

Install the following
```
kubectl ( https://kubernetes.io/docs/tasks/tools/ )
helm chart ( https://helm.sh/docs/intro/install/ )
eksctl (https://eksctl.io/)
```

Make sure you have created a cluster on EKS with above configurations and you are using EKS context.
