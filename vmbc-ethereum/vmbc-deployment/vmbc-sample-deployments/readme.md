# VMware Blockchain Deployment Sample Helm Charts
The sample VMware Blockchain for Ethereum deployment includes:
- [four replia one client deployment](./vmbc-four-node-one-client-deployment)
- [four replica one client deployment with logging and metrics](./vmbc-four-node-one-client-deployment-with-logging-and-metrics)
- [four replica twelve client deployment](./vmbc-four-node-twelve-client-deployment)

The deployment samples on Kubernetes is only be on a supported host with a single cluster.

Replica nodes are the participants in the consensus algorithm, concord-bft. Client nodes are the clients in the blockchain network running ethrpc.\
Refering to [logging and metrics sample](),Telegraf node is a service used to collect metrics from replicas and clients. Fluentd runs as sidecar in each of replica and client pods.

Current samples are tested with
- Minikube with virtualbox, hyperkit and docker drivers.
- AWS EKS clusters of variable size.

## Prerequisites
Make sure that you implement all the required prerequisites. See [Deployment Prerequisites](./../README.md).

## Quick Start
For each of the samples, you could do the following.
### Deploy
```sh
helm install <name of blockchain> </patg/to/samples> --set global.storageClassName=<standard for minukube or gp2 for AWS EKS> --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password=<password>
```
### Test
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
    curl -X POST '<ethrpc url from above>:8545' -H 'Content-Type: application/json' -H "Accept: application/json" -d '{"id": 1, "jsonrpc":"2.0","method": "eth_getBlockByNumber","params": ["0x00",true]}' | jq
    ```
  Sample output:
```
% Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                           Dload  Upload   Total   Spent    Left  Speed
100  1083  100  1000  100    83     80      6  0:00:13  0:00:12  0:00:01   239
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "eth_getBlockByNumber",
  "result": {
    "extraData": "0x",
    "gasLimit": "0x7fffffffffffffff",
    "gasUsed": "0x0",
    "hash": "0x92e4414494ec1b4752faea0d80e79f618d447743f32eff4153c5e391be1d1a88",
    "miner": "0x52a06a6cBEF9543244C530F52b602712FE5dfb74",
    "nonce": "0x0000000000000000",
    "number": "0x0",
    "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "size": 1,
    "stateRoot": "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    "timestamp": "0x6439916d",
    "transactions": [
      {
        "blockHash": "0x92e4414494ec1b4752faea0d80e79f618d447743f32eff4153c5e391be1d1a88",
        "blockNumber": "0x0",
        "contractAddress": "0x",
        "from": "0x0000000000000000000000000000000000000000",
        "gas": "0x0",
        "gasPrice": 0,
        "hash": "0x77f5bd9e7dbe2c2772f58f53431dfdfa205991ec4ff0b2bc385adecefd8895be",
        "input": "0x",
        "logs": [],
        "nonce": "0x0",
        "to": "0xfb389874fb4e03182a7358275eaf78008775c7ed",
        "transactionIndex": "0x0",
        "v": "0x2733",
        "value": "0x0000000000000000000000000000000000000000000000007fffffffffffffff"
      }
    ]
  }
}
 ```
    
  See [Troubleshooting](./Troubleshooting.md) for any errors.
  
### Uninstall VMware Blockchain Nodes.
```sh
helm uninstall <name of blockchain>
```
