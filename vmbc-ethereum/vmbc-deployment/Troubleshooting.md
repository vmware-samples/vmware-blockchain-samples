# VMBC Deployment troubleshooting guide
## FAQ

- I am on Apple M1. I am having trouble deploying VMBC on Minikube.
  A. Please follow guide in [this page](./MAC-Apple-Silicon-README.md) for proper installation of Minikube on Mac M1.

- I am using Amazon EKS for deployment. My current Kubernetes version is 1.24. I am unable to deploy VMBC with storage class gp2.
  A. if >= 1.23 is used to deploy the EKS cluster then users must follow instructions from here to install the EBS CSI driver: https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi-migration-faq.html to ensure their pods are started correctly.

- I keep getting "ImagePullBackoff" error on my Minikube.
  A. Please see your internet connection. Generally using Hyperkit as the driver is faster to pull images. If that does not resolve your problem, use the below workaround
  ```
  minikube ssh 'USERNAME=<username>; PASSWORD=<password>; TAG=0.0.0.0.7849; docker login vmwaresaas.jfrog.io -u $USERNAME -p $PASSWORD; docker pull vmwaresaas.jfrog.io/vmwblockchain/concord-core:$TAG; docker pull vmwaresaas.jfrog.io/vmwblockchain/clientservice:$TAG; docker pull vmwaresaas.jfrog.io/vmwblockchain/ethrpc:$TAG; docker logout vmwaresaas.jfrog.io'
  ```

- I am on an Ubuntu VM on AWS EC2. I want to use minikube. I am unable to start Minikube with VirtualBox driver.
  A. Currently there is limited support for Minikube on nested virtual machines. See below for more information
  https://askubuntu.com/questions/1160354/running-minikube-on-ubuntu-in-virtualbox
  https://github.com/kubernetes/minikube/issues/4530
  https://github.com/kubernetes/minikube/issues/3900

  Please use docker driver to mitigate this. Remember to be a non-root user.

- The curl test is hung
  A. It takes a little while for ethrpc to boot up for the first time. Please wait for a few minutes.

- "minikube service list" is not showing me blockchain url.
  A. Run "minikube service client-0-ethrpc" to fetch the url.
