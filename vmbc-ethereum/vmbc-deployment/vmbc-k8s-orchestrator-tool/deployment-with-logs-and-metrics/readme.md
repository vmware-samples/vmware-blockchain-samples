# VMware Blockchain deployment with logs and metrics

Logs and/or metrics can be published from deployed VMware blockchain to any desired platform as long as the URL is known and provided during helm chart generation.\

## Prerequisites
- If you are setting up logging in an external platform (eg ELK), you must have logging endpoint url, username and password with you.
- If you are setting up metrics in an external platform (eg ELK), you must have logging endpoint url, username and password with you.
- If you are setting up metrics on cloudwatch, your deployment must be on AWS EKS, you must have your token, secret key and access key for the AWS account.

## Available features
- You can set up both logging and metrics together or either logs or metrics in a deployment.
- Multiple endpoints can be set up for logging as well as metrics on a single deployment.
- If deployment is on AWS EKS, one of the metrics endpoint could be cloudwatch and one in other platform (example ELK) in a single deployment.

## Logging
Log collection typically happens using [fluentd](https://www.fluentd.org/) for all pods and containers used in VMware Blockchain.

### Deploy blockchain
- Generate helm charts following instructions in [k8s orchestrator tool](./../helm-chart).\
Modify your infrastructure descriptor based on [sample descriptor](./sample-descriptors/infrastructure_logs.json) provided.
- Install blockchain
```
helm install <name of blockchain> . --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password=<password>
```
You may install a blockchain on a single cluster or [multiple clusters](./../vmbc-multicluster-deployment).

### Helm chart details
You may edit `values.yaml` to set a different url, username or password during helm installation by changing the below section.
```
logManagement: 
  endpoint_1:
    url: "http://0.0.0.0:<port>"
    username: ""
    password: ""
```

## Metrics
Metrics are produced in [prometheus format](https://prometheus.io/docs/concepts/data_model/) and are collected by [telegraf](https://www.influxdata.com/time-series-platform/telegraf/) for all pods and containers used in VMware Blockchain.

### Deploy blockchain
- Generate helm charts following instructions in [k8s orchestrator tool](./../helm-chart).\
Modify your infrastructure descriptor based on [sample descriptor](./sample-descriptors/infrastructure_metrics.json) provided.
- Install blockchain
```
helm install <name of blockchain> . --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password=<password>
```

### Helm chart details
You may edit `values.yaml` to set a different url, username or password during helm installation by changing the below section.
```
url: http://<Replace Me>
username: <Replace Me>
password: <Replace Me>
```

