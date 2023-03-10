# VMware Blockchain Deployment troubleshooting guide

## FAQ

### Is this a public or private network solution? 
Today, customers can build and run private and permissioned blockchain networks at scale with VMware Blockchain for Ethereum. In the future, we have a vision that customers build and operate layer-N networks and side chains that bridge back to various public main nets. Being an EVM-compatible platform, our goal is to enable customers using VMBC to interact with other EVM chains - both public and private.

### How can I view a demo of the deployment and installation process? 
You can view of demo of the latest beta release from our blockchain specialists at any time [here.](https://vimeo.com/779426439) You can also access previous webinar recordings in our #vmware-blockchain-beta Slack channel. Please [reach out to our team](mailto:ask_vmware_blockchain@vmware.com) if you do not have access.

### Which Ethereum APIs do you support?
Applications can interact with VMware Blockchain, read data, submit transactions in exactly the same way they do with other Ethereum clients i.e. using the JSON-RPC API. VMware Blockchain supports a majority of the APIs in the [Ethereum Execution API](https://github.com/ethereum/execution-apis) specification. For a full list of API endpoints supported, please see the VMware Blockchain product documentation.

### Which ERC standards do you support? 
We currently support ERC-20 and ERC-721.

### Is there support for MetaMask?
Yes. If you are using MetaMask, in the add network section, please make sure to use the URL of your VMBC deployment in the form of http://VMBC_URL:PORT and chainID 5000. Typically, in a default deployment using Minikube that URL will be 192.168.49.2 and the port will vary. Find the URL of the client-0-ethrpc service using the minikube service list command if you are using Minikube or in a typical Kubernetes deployment use the command kubectl get svc to find the URL. Note that MetaMask will need to be able to contact the RPC endpoint. Routing traffic into Minikube depends on your environment and you can read more about options [here.](https://minikube.sigs.k8s.io/docs/handbook/accessing/)

### Is it possible to deploy VMware Blockchain contracts on an existing private chain? 
Yes, solidity contracts can be deployed on VMware Blockchain if the private chain is industry standard EVM compatible.

### How would you set up your own instance of Hardhat? 
If you are using Hardhat, replace the url with the above VMBC_URL and chainid with 5000 in hardhat.config.ts. An example would be in the "networks" section, "concord" endpoint in https://github.com/vmware-samples/vmware-blockchain-samples/blob/master/hardhat/hardhat.config.ts.

### I am on Apple M1 and am having trouble deploying VMware Blockchain on Minikube.

We do not currently support VMware Blockchain on Apple's M1 processor. We are working on adding support for this and will update the documentation when it's available.

### I am using Amazon EKS for deployment. My current Kubernetes version is 1.24. I am unable to deploy VMware Blockchain with storage class gp2.

If >= 1.23 is used to deploy the EKS cluster then users must follow instructions from here to install the EBS CSI driver: https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi-migration-faq.html to ensure their pods are started correctly.

### I am on an Ubuntu VM on AWS EC2. I want to use Minikube. I am unable to start Minikube with VirtualBox driver.

Currently there is limited support for Minikube on nested virtual machines. See below for more information  
https://askubuntu.com/questions/1160354/running-minikube-on-ubuntu-in-virtualbox  
https://github.com/kubernetes/minikube/issues/4530  
https://github.com/kubernetes/minikube/issues/3900

Please use docker driver to mitigate this. Remember to be a non-root user.

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

### What is your max TPS?
VMware Blockchain for Daml supports thousands of complex transactions per second without sacrificing trust or privacy. VMware Blockchain for Ethereum beta is still in an early stage of performance testing and will achieve similar or better results once commercially available.

### The curl test is hung.

It takes a little while for ethrpc to boot up for the first time. Please wait for a few minutes. The system should be ready when you see the ``` client_id=8 is serving - the pool is ready ``` message in the vmbc-deployment-client-0-clientservice-xxx pod logs.

### "minikube service list" is not showing me blockchain url.

Run ```minikube service client-0-ethrpc``` to fetch the url. You can also use ```kubectl port-forward svc/client-0-ethrpc 8545:8545``` in case you want to use a particular port number.

### I am getting "CrashLoopBackOff" error when I do "kubectl get pods"
A. We have seen this issue in arm64 architecture and are working on it. Meanwhile please use amd64 machine instead. If you are not on arm64 and still seeing an issue, please raise an issue with details of your system and logs.

If your issues are not addressed above | feedback | suggestions, [please raise a ticket](https://github.com/vmware-samples/vmware-blockchain-samples/issues)
