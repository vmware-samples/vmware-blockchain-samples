# VMBC Four Node One Client Sample Deployment With Logging
This is a sample set of Helm charts for a four replica one client VMWare blockchain deployment on Kubernetes on choice of host on a single cluster only. Current sample has been tested with minikube with virtualbox driver as hosts.
Replica here refers to participants in consensus algorithm (concord-bft).
Client here refers to clients to the blockchain network running ethrpc.

## Host system pre-requisites

    kubectl ( https://kubernetes.io/docs/tasks/tools/ )
    helm chart ( https://helm.sh/docs/intro/install/ )
    (optional) Minikube

## Check pre-requisites commands before proceeding further

```
    kubectl version             # Verify kubectl is installed
    helm version                # Verify helm is installed
```
### ELK Setup

- Install Elasticsearch and Kibana
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

### Deploy vmbc four node deployment
- Minikube
   - Deploy
   ```sh
     helm install <name of blockchain> . --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password='<password>'
   ```
   - Test
      - Get ethrpc endpoint
        Run 
        ```sh
        minikube service list
        ```
        Fetch the ethrpc url displayed against the ethrpc service
      - Test ethrpc response
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

### View logs in Kibana
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

### Uninstall ELK (Optional)
  ```sh
     helm delete elasticsearch 
     helm delete logstash
     helm delete kibana
  ```

### Delete vmbc deployment
 ```sh
    helm uninstall <name of blockchain>
 ``` 
