# Sample Deployment with Four Replica Nodes and One Client Node With Logging
The sample VMware Blockchain for Ethereum deployment includes a set of Helm charts for four Replica nodes and one Client node. The deployment on Kubernetes must only be on a supported host with a single cluster. 
Replica nodes are the participants in the consensus algorithm, concord-bft. Client nodes are the clients in the blockchain network running ethrpc.
The current sample deployment has been tested on the following components:
-	Minikube with VirtualBox
-	Hyperkit 
-	Docker drivers

## Deployment Prerequisites
Make sure that you implement all the required deployment prerequisites. See [System Requirements](./../README.md).

## Install Monitoring
VMware Blockchain for Ethereum collects monitoring metrics from your blockchain deployment nodes and uses third-party providers to analyze the metrics. VMware Blockchain for Ethereum uses the ELK stack platform for monitoring metrics.

- Add the Helm repository.
     ```sh
     helm repo add elastic https://helm.elastic.co
     helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
     helm repo update
     ```
- Install Elasticsearch.
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
- Install Kibana.
     ```sh
     cat <<KIBANA | helm install kibana elastic/kibana --version 7.17.3 -f -
     KIBANA
     ```

- Install Logstash.
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

## VMware Blockchain Nodes Deployment
You can deploy four Replica nodes and one Client node on Minikube.

#### Deploy Helm.
```sh
helm install <name of blockchain> . --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password=<password>i
```
**Note**: It might take up to 5 mins for the blockchain nodes to be operational after deployment. Open the pod logs ```vmbc-deployment-client-0-clientservice-xxx-yyy``` and wait for the ```client_id=8 is serving - the pool is ready``` notification.

#### Test your deployment.
- Get ethrpc endpoint.
    ```sh
    minikube service list
    ```
  **Note**: If you do not see a URL, try an alternate ```minikube service client-0-ethrpc``` command.
  
- Run ethrpc curl command.
    ```sh
    curl -H 'Content-Type: application/json' -H "Accept: application/json" -d '{"id": 1, "jsonrpc": "2.0", "method": "eth_getBlockByNumber", "params": ["0x00", true]}' <ethrpc url from above>
    ```
Sample output:
    ```json
    {"id":1,"jsonrpc":"2.0","method":"eth_getBlockByNumber","result":{"extraData":"0x","gasLimit":"0x7fffffffffffffff","gasUsed":"0x0","hash":"0x92e4414494ec1b4752faea0d80e79f618d447743f32eff4153c5e391be1d1a88","miner":"0x52a06a6cBEF9543244C530F52b602712FE5dfb74","nonce":"0x0000000000000000","number":"0x0","parentHash":"0x0000000000000000000000000000000000000000000000000000000000000000","size":1,"stateRoot":"0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470","timestamp":"0x1669680399","transactions":[{"blockHash":"0x92e4414494ec1b4752faea0d80e79f618d447743f32eff4153c5e391be1d1a88","blockNumber":"0x0","contractAddress":"0x","from":"0x0000000000000000000000000000000000000000","gas":"0x0","gasPrice":0,"hash":"0x77f5bd9e7dbe2c2772f58f53431dfdfa205991ec4ff0b2bc385adecefd8895be","input":"0x","logs":[],"nonce":"0x0","to":"0xfb389874fb4e03182a7358275eaf78008775c7ed","transactionIndex":"0x0","value":"0x0000000000000000000000000000000000000000000000007fffffffffffffff"}]}}
    ```
    
See, [Troubleshooting](./../Troubleshooting.md) to resolve any errors.

#### View logs in Kibana.
- Open a port-forward to Kibana.
    ```sh
    kubectl port-forward svc/kibana-kibana 5601:5601
    ```
- Open the following page to view
http://localhost:5601/app/discover# logs.
- For the inital log in, create an index.
 - Click **Create index pattern**.
 - Enter *logs-generic-default** in the Name option.
 - From the Timestamp field drop-down menu, select the **@timestamp** field.
 
   If you do not see *logs-generic-default*, wait a few minutes for the index to be created after deploying a blockchain.
   
   If you have not deployed a blockchain yet, return to this page after the blockchain is deployed. 
   The index is created when the first blockchain is deployed.
   
 - From the Create index pattern page, you can view the customize the index fields.
   
   You can accept the default index field values.
   
 - Search and view logs on this page, http://localhost:5601/app/discover#.
 
   You can filter logs based on blockchain ID, service name, etc.

#### Uninstall the VMware Blockchain nodes.
```sh
helm uninstall <name of blockchain>
```
#### Uninstall ELK.
```sh
helm delete elasticsearch 
helm delete logstash
helm delete kibana
```

### Deployment Configuration and Customization
You can customize your deployment configurations. A list of configurations is available in the values.yaml file. You can use the "--set" parameter value for configuration.

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
