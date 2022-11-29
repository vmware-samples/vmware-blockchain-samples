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
    kubectl version             -> Verify kubectl is installed
    helm version                -> Verify helm is installed
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

### Deploy vmbc four node deployment
- Minikube
   - Deploy
     helm install <name of blockchain> . --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password='<password>'
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

    - eks (assuming storage class used is the default - gp2)
       - Deploy
         ```sh
         helm install <name of blockchain> . --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password='<password>' --set global.storageClass=gp2
         ```
       - Test
          - Get ethrpc endpoint
                 Run 
                 ```sh
                  kubectl get svc
                 ```
                 Fetch the ethrpc url displayed against the ethrpc service
          - Test ethrpc response
            ```sh
            curl -X POST '<ethrpc url from above>:8545' -H 'Content-Type: application/json' -H "Accept: application/json" -d '{
			"id": 1,
			"jsonrpc": "2.0",
			"method": "eth_getBlockByNumber",
			"params": [
			"0x00",
			   true
			    ]
			}'
            ```
### Delete vmbc deployment
    ```sh
    helm uninstall <name of blockchain>
    ```                 

