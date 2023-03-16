## Introduction
A Kubernetes based deployment of privacy dapps is demonstrated here. In this demo, we use minikube as the kubernetes engine and helm for managing resources related to the deployment. In this instance, minikube is configured to use docker as the driver, athough the user is free to choose a different one if necessary.

The focus here is on kubernetes deployment and not on the workflows supported by the DApp ecosystem. For pod specific workflows, please refer to their corresponding README files linked below:
For privacy admin workflows, refer [here](https://gitlab.eng.vmware.com/blockchain/vmwathena_blockchain/-/blob/master/privacy-demo/web3/privacy-dapp/admin-dapp/Readme.md).
For privacy user workflows, refer [here](https://gitlab.eng.vmware.com/blockchain/vmwathena_blockchain/-/blob/master/privacy-demo/web3/privacy-dapp/user-dapp/Readme.md).

## Pre-requisites
Make sure to have docker, minikube, helm installed. The versions used at the time of making this README are as follows:
```
$ helm version
version.BuildInfo{Version:"v3.11.1", GitCommit:"293b50c65d4d56187cd4e2f390f0ada46b4c4737", GitTreeState:"clean", GoVersion:"go1.18.10"}
$ docker version
Client:
 Version:           20.10.12
 API version:       1.41
 Go version:        go1.16.2
 Git commit:        20.10.12-0ubuntu2~18.04.1
 Built:             Fri Oct 21 08:25:48 2022
 OS/Arch:           linux/amd64
 Context:           default
 Experimental:      true

Server:
 Engine:
  Version:          20.10.12
  API version:      1.41 (minimum version 1.12)
  Go version:       go1.16.2
  Git commit:       20.10.12-0ubuntu2~18.04.1
  Built:            Mon Apr  4 20:53:56 2022
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          1.5.9-0ubuntu1~18.04.2
  GitCommit:        
 runc:
  Version:          1.1.0-0ubuntu1~18.04.1
  GitCommit:        
 docker-init:
  Version:          0.19.0
  GitCommit:        
$ minikube version
minikube version: v1.29.0
commit: ddac20b4b34a9c8c857fc602203b6ba2679794d3
```

Start the minikube server using the below command:
```
minikube start --disk-size=100g --memory 16384 --cpus 8 --driver=docker --feature-gates=StatefulSetAutoDeletePVC=true
```
Note: StatefulSetAutoDeletePVC is an experimental feature that lets minikube delete persistentVolumeClaims associated with StatefulSet replicas based on the policy set in the deployment config. The side-effect of not having StatefulSetAutoDeletePVC enabled is that the user is left to clean up persistent volumes after uninstalling the DApps.

## Limitations
The privacy capabilities are not currently supported with permission enabled blockchain. VMware Blockchain must be deployed with read and write permissions disabled before trying out privacy.

## Configuring the deployment.
Helm charts for the deployment are available [here](https://gitlab.eng.vmware.com/blockchain/vmwathena_blockchain/-/tree/master/privacy-demo/web3/privacy-dapp/k8s/helm-charts). The user can set the following configuration to deploy with the intended image.
1. global.imageCredentials.registry: Container registry for image downloads
2. global.imageCredentials.username: Username to access/download for registry
3. global.imageCredentials.password: Password to access/download for registry
4. blockchainURL: URL to connect to ETHRPC service.
5. blockchainPubSubUrl: URL to subscribe for events from the blockchain.
6. chainID: Blockchain ID

By default, one admin DApp and 3 user DApps are deployed by these charts. To scale up or down the number of user DApps, ether
1. Edit the field replicas in the file templates/deployment-user.yaml.
2. Use the kubectl scale/patch commands to scale up/down, respectively.

## Steps to deploy
1. Ensure the blockchain is up and running.
```
$ kubectl get pods
NAME                                                      READY   STATUS    RESTARTS   AGE
vmbc-deployment-client-0-clientservice-684db974f9-kcj6b   1/1     Running   0          3h19m
vmbc-deployment-client-0-cre-67654c54f5-pt7qm             1/1     Running   0          3h19m
vmbc-deployment-client-0-ethrpc-9458d574d-wvjtx           1/1     Running   0          3h19m
vmbc-deployment-replica-0-concord-5b98797757-t6b7d        1/1     Running   0          3h19m
vmbc-deployment-replica-1-concord-794fd8f84d-pmkkk        1/1     Running   0          3h19m
vmbc-deployment-replica-2-concord-574fd8d575-nl5ct        1/1     Running   0          3h19m
vmbc-deployment-replica-3-concord-85cdd66ff7-qnmlr        1/1     Running   0          3h19m
```
  
2. Note the URL by which the user can send requests to the blockchain
```
$ minikube service list
|-------------|-----------------|--------------|---------------------------|
|  NAMESPACE  |      NAME       | TARGET PORT  |            URL            |
|-------------|-----------------|--------------|---------------------------|
| default     | client-0        | No node port |
| default     | client-0-ethrpc | 8545/8545    | http://192.168.49.2:32175 |    <= ETHRPC listens on the URL seen here.
|             |                 | 8546/8546    | http://192.168.49.2:32326 |    <= URL to be used for the pub/sub impl.
| default     | kubernetes      | No node port |
| default     | replica-0       | No node port |
| default     | replica-1       | No node port |
| default     | replica-2       | No node port |
| default     | replica-3       | No node port |
| kube-system | kube-dns        | No node port |
|-------------|-----------------|--------------|---------------------------|
```
In the example shown above, ethrpc is listening on http://192.168.49.2:32175.

3. Ensure the system is responsive by sending a test request to the URL above.
```
$ curl -X POST --data '{"jsonrpc":"2.0","method":"eth_gasPrice","id":1}' --header "Content-Type: application/json" http://192.168.49.2:32175
{"id":1,"jsonrpc":"2.0","method":"eth_gasPrice","result":"0x0"}
```
The user can now deploy the privacy dapp ecosystem using the helm install command in the following manner.
```
helm install --set blockchainUrl="ETHRPC URL" --set blockchainPubSubUrl="PUB/SUB URL" <name of privacy app deployment> .
```

For example, based on the output of **minikube service list** above:
```
$ helm install --set blockchainUrl="http://192.168.49.2:32175" --set blockchainPubSubUrl="http://192.168.49.2:32326" privacy-dapp-ecosystem .
```

## Privacy application demo
At this point the user should be able to see both the blockchain and the privacy apps up and running. To verify, run kubectl get pods.

```
$ kubectl get pods
NAME                                                      READY   STATUS    RESTARTS   AGE
privacy-admin-dapp-0                                      2/2     Running   0          19s
privacy-user-dapp-0                                       2/2     Running   0          19s
privacy-user-dapp-1                                       2/2     Running   0          15s
privacy-user-dapp-2                                       2/2     Running   0          10s
vmbc-deployment-client-0-clientservice-684db974f9-kcj6b   1/1     Running   0          24h
vmbc-deployment-client-0-cre-67654c54f5-pt7qm             1/1     Running   0          24h
vmbc-deployment-client-0-ethrpc-9458d574d-wvjtx           1/1     Running   0          24h
vmbc-deployment-replica-0-concord-5b98797757-t6b7d        1/1     Running   0          24h
vmbc-deployment-replica-1-concord-794fd8f84d-pmkkk        1/1     Running   0          24h
vmbc-deployment-replica-2-concord-574fd8d575-nl5ct        1/1     Running   0          24h
vmbc-deployment-replica-3-concord-85cdd66ff7-qnmlr        1/1     Running   0          24h
```

The user can log into a pod using the **kubectl exec** command in the following manner.
```
kubectl exec -it pod-name -c container-name -- bash
```

The user can scale the number of privacy-user-dapp pods in the following manner.
```
kubectl scale sts privacy-user-dapp --replicas=5
```
This scales up the deployment to 5 user pods.

The user can remove all pods and associated resources by running **helm unintall <name of privacy app deployment>**.
```
helm uninstall privacy-dapp-ecosystem
```
