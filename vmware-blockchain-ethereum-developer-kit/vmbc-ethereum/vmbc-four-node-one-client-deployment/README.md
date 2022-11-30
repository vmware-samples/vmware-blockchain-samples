# VMBC Four Node One Client Sample Deployment
This is a sample set of Helm charts for a four replica one client VMWare blockchain deployment on Kubernetes on choice of host on a single cluster only. Current sample has been tested with minikube with virtualbox driver and AWS EKS as hosts.
Replica here refers to participants in consensus algorithm (concord-bft).
Client here refers to clients to the blockchain network running ethrpc.

## Host system pre-requisites

    kubectl ( https://kubernetes.io/docs/tasks/tools/ )
    helm chart ( https://helm.sh/docs/intro/install/ )
    (optional) Minikube
    (optional) eksctl

## Check pre-requisites commands before proceeding further

```sh
kubectl version             # Verify kubectl is installed
helm version                # Verify helm is installed
```

## VMBC four node one client deployment

The below section explains how to install VMBC four node one client deployment on minikube and EKS.

### Quick Start
#### Deploy
- Minikube
```sh
helm install <name of blockchain> . --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password='<password>'
```

- EKS
```sh
helm install <name of blockchain> . --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password='<password>' --set global.storageClassName=gp2
```

#### Test
- Get ethrpc endpoint
  - Minikube
    ```sh
    minikube service list
    ```
  - EKS
    ```sh
    kubectl get svc
    ```
- Run ethrpc curl
```sh
curl -X POST '<ethrpc url from above>' -H 'Content-Type: application/json' -H "Accept: application/json" -d '{
			"id": 1,
			"jsonrpc": "2.0",
			"method": "eth_getBlockByNumber",
			"params": [
			"0x00",
			   true
			    ]
			}'
```
You should see a sample output similar to below
```sh
{"id":1,"jsonrpc":"2.0","method":"eth_getBlockByNumber","result":{"extraData":"0x","gasLimit":"0x7fffffffffffffff","gasUsed":"0x0","hash":"0x92e4414494ec1b4752faea0d80e79f618d447743f32eff4153c5e391be1d1a88","miner":"0x52a06a6cBEF9543244C530F52b602712FE5dfb74","nonce":"0x0000000000000000","number":"0x0","parentHash":"0x0000000000000000000000000000000000000000000000000000000000000000","size":1,"stateRoot":"0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470","timestamp":"0x1669680399","transactions":[{"blockHash":"0x92e4414494ec1b4752faea0d80e79f618d447743f32eff4153c5e391be1d1a88","blockNumber":"0x0","contractAddress":"0x","from":"0x0000000000000000000000000000000000000000","gas":"0x0","gasPrice":0,"hash":"0x77f5bd9e7dbe2c2772f58f53431dfdfa205991ec4ff0b2bc385adecefd8895be","input":"0x","logs":[],"nonce":"0x0","to":"0xfb389874fb4e03182a7358275eaf78008775c7ed","transactionIndex":"0x0","value":"0x0000000000000000000000000000000000000000000000007fffffffffffffff"}]}}
```
#### Uninstall
```sh
helm uninstall <name of blockchain>
```

### Detailed configurations for customization

- Configurations
  List of available configurations in values.yaml. Use "--set" param for setting up the params.

| Name                             | Description                                      | Value                       | Type      |
|----------------------------------|--------------------------------------------------|-----------------------------|-----------|
| global.imageCredentials.registry | Container registry for image downloads           | ""                          | Mandatory |
| global.imageCredentials.username | Username to access/download for registry         | ""                          | Mandatory |
| global.imageCredentials.password | Password to access/download for registry         | ""                          | Mandatory |
| global.storageClass              | Storage class for deployment                     | standard                    | Optional  |
| global.ethPermissioningWriteEnabled | eth write permission enabled                  | false                       | Optional  |
| global.ethPermissioningReadEnabled  | eth read permission enabled                   | false                       | Optional  |
          
