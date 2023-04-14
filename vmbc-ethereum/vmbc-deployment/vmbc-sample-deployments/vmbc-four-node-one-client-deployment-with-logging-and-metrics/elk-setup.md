# ELK Setup
## Install Elasticsearch, Logstash and Kibana

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
  
## View logs in Kibana

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
- You can search for metric names to look for metric documents inserted to elastic search

## Uninstall ELK

```sh
helm delete elasticsearch 
helm delete logstash
helm delete kibana
```
