# VMware Blockchain Deployment troubleshooting guide

## FAQ

### I am on Apple M1. I am having trouble deploying VMware Blockchain on Minikube.

We do not currently support VMware Blockchain on Apple's M1 processor. We are working on adding support for this and will update the documentation when it's available.

### I am using Amazon EKS for deployment. My current Kubernetes version is 1.24. I am unable to deploy VMware Blockchain with storage class gp2.

If >= 1.23 is used to deploy the EKS cluster then users must follow instructions from here to install the EBS CSI driver: https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi-migration-faq.html to ensure their pods are started correctly.

### I keep getting "ImagePullBackoff" error on my Minikube.

Please check your internet connection speed. Generally, using Hyperkit as the driver is faster to pull images. If that does not resolve your problem, use the workaround shown below.

```
$ minikube ssh

docker@minikube:~$ docker login vmwaresaas.jfrog.io
<use credentials here when prompted>
Authenticating with existing credentials...
https://docs.docker.com/engine/reference/commandline/login/#credentials-store
Login Succeeded

docker@minikube:~$ docker pull vmwaresaas.jfrog.io/vmwblockchain/clientservice:0.0.0.0.7849
docker@minikube:~$ docker pull vmwaresaas.jfrog.io/vmwblockchain/ethrpc:0.0.0.0.7849
docker@minikube:~$ docker pull vmwaresaas.jfrog.io/vmwblockchain/concord-core:0.0.0.0.7849
```

### I am on an Ubuntu VM on AWS EC2. I want to use Minikube. I am unable to start Minikube with VirtualBox driver.

Currently there is limited support for Minikube on nested virtual machines. See below for more information  
https://askubuntu.com/questions/1160354/running-minikube-on-ubuntu-in-virtualbox  
https://github.com/kubernetes/minikube/issues/4530  
https://github.com/kubernetes/minikube/issues/3900

Please use docker driver to mitigate this. Remember to be a non-root user.

### The curl test is hung

It takes a little while for ethrpc to boot up for the first time. Please wait for a few minutes. The system should be ready when you see the ``` client_id=8 is serving - the pool is ready ``` message in the vmbc-deployment-client-0-clientservice-xxx pod logs.

### "minikube service list" is not showing me blockchain url.

Run ```minikube service client-0-ethrpc``` to fetch the url. You can also use ```kubectl port-forward svc/client-0-ethrpc 8545:8545``` in case you want to use a particular port number.

### I am getting "CrashLoopBackOff" error when I do "kubectl get pods"
A. We have seen this issue in arm64 architecture and are working on it. Meanwhile please use amd64 machine instead. If you are not on arm64 and still seeing an issue, please raise an issue with details of your system and logs.



If your issues are not addressed above | feedback | suggestions, [please raise a ticket](https://github.com/vmware-samples/vmware-blockchain-samples/issues)
