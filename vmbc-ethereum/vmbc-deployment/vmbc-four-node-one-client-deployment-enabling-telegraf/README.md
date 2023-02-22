# VMware Blockchain Four Node One Client Sample Deployment With Telegraf Metric Collection
The sample VMware Blockchain for Ethereum deployment includes a set of Helm charts for four Replica nodes and one Client node and a telegraf node. The deployment on Kubernetes must only be on a supported host with a single cluster.

Replica nodes are the participants in the consensus algorithm, concord-bft. Client nodes are the clients in the blockchain network running ethrpc.

The current sample deployment has been tested on the following components:
-	Minikube with VirtualBox, Hyperkit and Docker drivers

## Prerequisites
Make sure that you implement all the required prerequisites. See [Deployment Prerequisites](./../README.md).


## VMware Blockchain four node one client deployment

The below section explains how to install VMware Blockchain four node one client deployment on minikube.

### Quick Start
#### Deploy
```sh
helm install <name of blockchain> . --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password=<password>i
```
Note that it may take upto 5 mins for the blockchain to be operational the first time it's deployed. Please wait for 5 mins or until you see ```client_id=8 is serving - the pool is ready``` in the ```vmbc-deployment-client-0-clientservice-xxx-yyy``` pod logs.

#### Test
- Get ethrpc endpoint
    ```sh
    minikube service list
    ```
  Note: If you don't see a URL using the above command then try ```minikube service client-0-ethrpc```

- Run ethrpc curl
    ```sh
    curl -H 'Content-Type: application/json' -H "Accept: application/json" -d '{"id": 1, "jsonrpc": "2.0", "method": "eth_getBlockByNumber", "params": ["0x00", true]}' <ethrpc url from above>
    ```
  You should see a sample output similar to below
    ```json
    {"id":1,"jsonrpc":"2.0","method":"eth_getBlockByNumber","result":{"extraData":"0x","gasLimit":"0x7fffffffffffffff","gasUsed":"0x0","hash":"0x92e4414494ec1b4752faea0d80e79f618d447743f32eff4153c5e391be1d1a88","miner":"0x52a06a6cBEF9543244C530F52b602712FE5dfb74","nonce":"0x0000000000000000","number":"0x0","parentHash":"0x0000000000000000000000000000000000000000000000000000000000000000","size":1,"stateRoot":"0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470","timestamp":"0x1669680399","transactions":[{"blockHash":"0x92e4414494ec1b4752faea0d80e79f618d447743f32eff4153c5e391be1d1a88","blockNumber":"0x0","contractAddress":"0x","from":"0x0000000000000000000000000000000000000000","gas":"0x0","gasPrice":0,"hash":"0x77f5bd9e7dbe2c2772f58f53431dfdfa205991ec4ff0b2bc385adecefd8895be","input":"0x","logs":[],"nonce":"0x0","to":"0xfb389874fb4e03182a7358275eaf78008775c7ed","transactionIndex":"0x0","value":"0x0000000000000000000000000000000000000000000000007fffffffffffffff"}]}}
    ```
See [Troubleshooting](./../Troubleshooting.md) for any errors.

#### View Metrics in AWS Cloudwatc
- Open aws cloudwatch of us-west-1 region
- GoTo vmbc-samples namespace

#### Uninstall
##### Uninstall Blockchain
```sh
helm uninstall <name of blockchain>
```


### Detailed configurations for customization

- Configurations
  List of available configurations in values.yaml. Use "--set" param for setting up the params.

| Name                                | Description                                                            | Value                       | Type      |
|-------------------------------------|------------------------------------------------------------------------|-----------------------------|-----------|
| global.imageCredentials.registry    | Container registry for image downloads                                 | ""                          | Mandatory |
| global.imageCredentials.username    | Username to access/download for registry                               | ""                          | Mandatory |
| global.imageCredentials.password    | Password to access/download for registry                               | ""                          | Mandatory |
| global.storageClass                 | Storage class for deployment                                           | standard                    | Optional  |
| global.ethPermissioningWriteEnabled | eth write permission enabled                                           | false                       | Optional  |
| global.ethPermissioningReadEnabled  | eth read permission enabled                                            | false                       | Optional  |
| telegraf.endpoints                  | telegraf endpoints                                                     |     http://replica-0:9891,http://replica-1:9891,http://replica-2:9891,http://replica-3:9891 | Mandatory |
| telegraf.cloudwatch                 | cloudwatch credentials                                                 | ""                          | Mandatory |
| logManagement.endpoint_1.password   | logstash setup port                                                    | ""                          | Optional  |
| genesisBlock.timestamp              | blockchain creation time in UTC, 24 hours format - YYYY-MM-DD hh:mm:ss | 2022-12-02 00:01:00 | Optional  |

### Troubleshooting
The most common problems and errors are addressed with probable solutions to troubleshoot the problem. See, [Troubleshooting](./../Troubleshooting.md).
