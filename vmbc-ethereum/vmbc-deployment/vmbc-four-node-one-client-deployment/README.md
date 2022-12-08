# Sample Deployment with Four Replica Nodes and One Client Node

The sample VMware Blockchain for Ethereum deployment includes a set of Helm charts for four Replica nodes and one Client node. The deployment on Kubernetes must only be on a supported host with a single cluster. 

Replica nodes are the participants in the consensus algorithm, concord-bft. Client nodes are the clients in the blockchain network running ethrpc.

The current sample deployment has been tested on the following components:
-	Minikube with VirtualBox, Hyperkit and Docker drivers
-	Hosted on AWS EKS

## Deployment Prerequisites
Make sure that you implement all the required prerequisites. See [Deployment Prerequisites](./../README.md).

## VMware Blockchain Node Deployment

You can deploy four Replica nodes and one Client node on Minikube or EKS.

#### Run the following command to deploy Minikube. 
```sh
helm install <name of blockchain> . --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password=<password>
```

#### Run the following command to deploy EKS.
```sh
helm install <name of blockchain> . --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password=<password> --set global.storageClassName=gp2 --set resources.replica.cpuRequest=10000m --set resources.replica.cpuLimit=10000m --set resources.replica.memoryRequest=56Gi --set resources.replica.memoryLimit=56Gi --set resources.client.cpuRequest=5000m --set resources.client.cpuLimit=5000m --set resources.client.memoryRequest=28Gi --set resources.client.memoryLimit=28Gi
```
Note that it might take up to 5 mins for the blockchain nodes to be operational after deployment. Open the pod logs ```vmbc-deployment-client-0-clientservice-xxx-yyy``` and wait until you see the ```client_id=8 is serving - the pool is ready``` notification.

#### Test your deployment.
- Get the ethrpc endpoint.

  Run the following command to get ethrpc endpoint on Minikube
  ```sh
  minikube service list
  ```
    
  Run the following command to get ethrpc endpoint on EKS
  ```
  kubectl get svc
  ```
  
  Note: If you do not see a URL, try an alternate ```minikube service client-0-ethrpc``` command.
  
- Run the ethrpc curl command.
    ```sh
    curl -H 'Content-Type: application/json' -H "Accept: application/json" -d '{"id": 1, "jsonrpc": "2.0", "method": "eth_getBlockByNumber", "params": ["0x00", true]}' <ethrpc url from above>
    ```
  Sample output:
    ```json
    {"id":1,"jsonrpc":"2.0","method":"eth_getBlockByNumber","result":{"extraData":"0x","gasLimit":"0x7fffffffffffffff","gasUsed":"0x0","hash":"0x92e4414494ec1b4752faea0d80e79f618d447743f32eff4153c5e391be1d1a88","miner":"0x52a06a6cBEF9543244C530F52b602712FE5dfb74","nonce":"0x0000000000000000","number":"0x0","parentHash":"0x0000000000000000000000000000000000000000000000000000000000000000","size":1,"stateRoot":"0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470","timestamp":"0x1669680399","transactions":[{"blockHash":"0x92e4414494ec1b4752faea0d80e79f618d447743f32eff4153c5e391be1d1a88","blockNumber":"0x0","contractAddress":"0x","from":"0x0000000000000000000000000000000000000000","gas":"0x0","gasPrice":0,"hash":"0x77f5bd9e7dbe2c2772f58f53431dfdfa205991ec4ff0b2bc385adecefd8895be","input":"0x","logs":[],"nonce":"0x0","to":"0xfb389874fb4e03182a7358275eaf78008775c7ed","transactionIndex":"0x0","value":"0x0000000000000000000000000000000000000000000000007fffffffffffffff"}]}}
    ```
    
  See [Troubleshooting](./../Troubleshooting.md) for any errors.
  
#### Uninstall VMware Blockchain Nodes.
```sh
helm uninstall <name of blockchain>
```

### Deployment Configuration and Customization
You can customize your deployment configurations. A list of configurations is available in the values.yaml file. You can use the "--set" parameter value for configuration.

| Name                             | Description                                      | Value                       | Type      |
|----------------------------------|--------------------------------------------------|-----------------------------|-----------|
| global.imageCredentials.registry | Container registry for image downloads           | ""                          | Mandatory |
| global.imageCredentials.username | Username to access/download for registry         | ""                          | Mandatory |
| global.imageCredentials.password | Password to access/download for registry         | ""                          | Mandatory |
| global.storageClass              | Storage class for deployment                     | standard                    | Optional  |
| global.ethPermissioningWriteEnabled | Enabled eth write permission                   | false                       | Optional  |
| global.ethPermissioningReadEnabled  | Enabled eth read permission                  | false                       | Optional  |
| genesisBlock.timestamp           | Blockchain creation time in UTC, 24 hours format - YYYY-MM-DD hh:mm:ss | 2022-12-02 00:01:00 | Optional |

## Troubleshooting
The most common problems and errors are addressed with probable solutions to troubleshoot the problem. See, [Troubleshooting](./../Troubleshooting.md).
