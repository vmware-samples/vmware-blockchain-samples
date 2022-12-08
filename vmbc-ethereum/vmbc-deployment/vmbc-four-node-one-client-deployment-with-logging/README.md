# VMBC Four Node One Client Sample Deployment With Logging
This is a sample set of Helm charts for a four replica one client VMWare blockchain deployment on Kubernetes on choice of host on a single cluster only. Current sample has been tested with minikube with virtualbox driver as hosts.
Replica here refers to participants in consensus algorithm (concord-bft).
Client here refers to clients to the blockchain network running ethrpc.

## Prerequisites
Please follow information in [this page](./../README.md)

### ELK Setup

#### Install Elasticsearch, Logstash and Kibana
- Add helm repo if not already added
     ```sh
     helm repo add elastic https://helm.elastic.co
     helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
     helm repo update
     ```
- Install Elasticsearch
     ```sh
     cat <<ELASTICSEARCH | helm install elasticsearch elastic/elasticsearch --version 7.17.3 -f -
     antiAffinity: "soft"
     esJavaOpts: "-Xmx256m -Xms256m"
     resources:
       requests:
        cpu: "100m"
        memory: "1024M"
       limits:
        cpu: "1000m"
        memory: "1024M"
     volumeClaimTemplate:
       storageClassName: "standard"
       resources:
         requests:
          storage: "200M"
     ELASTICSEARCH
     ```
- Install Kibana
     ```sh
     cat <<KIBANA | helm install kibana elastic/kibana --version 7.17.3 -f -
     KIBANA
     ```

- Install logstash
     ```sh
     cat <<LOGSTASH | helm install logstash elastic/logstash --version 7.17.3 -f -
     persistence:
       enabled: true
     logstashConfig:
       logstash.yml: |
         http.host: 0.0.0.0
         xpack.monitoring.enabled: false
     logstashPipeline:
       vmbc.conf: | 
         input {
            http {
              id => "vmbc-logs"
            }
         }
         filter {
            split {
            }
            json {
              source => "message"
            }
            date {
              match => [ "logtime", "yyyy-MM-dd'T'HH:mm:ss','SSS','Z", "yyyy-MM-dd HH:mm:ss','SSS" ]
            }
            mutate {
              remove_field => [ "host", "headers", "logtime" ]
            }
         }
         output {
            elasticsearch {
              hosts => [ "elasticsearch-master.default.svc.cluster.local:9200" ]
              data_stream => "true"
            }
         }
     service:
       type: ClusterIP
       ports:
          - name: http
            port: 8080
            protocol: TCP
            targetPort: 8080
     LOGSTASH
     ```

## VMBC four node one client deployment

The below section explains how to install VMBC four node one client deployment on minikube.

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

#### View logs in Kibana
- Open a port-forward to Kibana
    ```sh
    kubectl port-forward svc/kibana-kibana 5601:5601
    ```
- Open the following page to see logs
http://localhost:5601/app/discover#
- On first open, it will ask to create an index.
 - Click on "Create index pattern"
 - Type logs-generic-default* in the Name field and select the @timestamp field from the Timestamp field drop down.
   If you don't see logs-generic-default, wait a few minutes for the index to be created after a blockchain has been deployed.
   If you haven't deployed a blockchain yet, then you will have to return to this page after the blockchain is deployed.
   The index is automatically created when the first blockchain is deployed.
 - After you click Create index pattern on the page above, you should see a page to customize the index fields.
   You can leave this page as is as the defaults are fine.
 - Now you can search and view logs on this page: http://localhost:5601/app/discover#. You can filter logs based on blockhain ID, service name etc.

#### Uninstall
##### Uninstall Blockchain
```sh
helm uninstall <name of blockchain>
```
##### Uninstall ELK
```sh
helm delete elasticsearch 
helm delete logstash
helm delete kibana
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
| logManagement.endpoint_1.url        | logstash endpoint url                         | http://logstash-logstash.default.svc.cluster.local | Optional |
| logManagement.endpoint_1.username   | logstash setup username                       | ""                          | Optional  |
| logManagement.endpoint_1.password   | logstash setup port                           | ""                          | Optional  |
| genesisBlock.timestamp           | blockchain creation time in UTC, 24 hours format - YYYY-MM-DD hh:mm:ss | 2022-12-02 00:01:00 | Optional |

### Troubleshooting
The most common problems and errors are addressed with probable solutions to troubleshoot the problem. See, [Troubleshooting](./../Troubleshooting.md).
