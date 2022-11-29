# VMBC Explorer
A web application has been designed and implemented with universal search, block and transaction detail views. The Auto refresh feature will keep the dashboard live with the updated details. The refresh interval is set to disabled by default, and it can be altered as per the needs, and also it can be disabled when it's not needed. The Browser cache feature will keep accumulating the data fetched in local storage, which will prevent duplicate requests to the EthRPC API. It uses Angular With Clarity Design Framework to adhere to VMWare Web Application Standards. The performance of the blockchain won't be affected by this as it is packaged and deployed in a separate container. The explorer will connect to blockchain only when its deployed and configured with a specific instance URL. With the help of cache and auto refresh interval, the interaction between the blockchain and the explorer can be improved further.

## Host system pre-requisites**

    kubectl ( https://kubernetes.io/docs/tasks/tools/ )
    helm chart ( https://helm.sh/docs/intro/install/ )

## Check pre-requisites commands before proceeding further**

```sh
    kubectl version             # Verify kubectl is installed
    helm version                # Verify helm is installed
```

## VMBC explorer deployment**

- Configurations
  List of available configurations in values.yaml. Use "--set" param for setting up the params.

| Name                             | Description                                      | Value                       | Type      |
|----------------------------------|--------------------------------------------------|-----------------------------|-----------|
| global.imageCredentials.registry | Url to download vmbc explorer                    | ""                          | Mandatory |
| global.imageCredentials.username | Username to access/download vmbc explorer        | ""                          | Mandatory |
| global.imageCredentials.password | Password to access/download vmbc explorer        | ""                          | Mandatory |
| global.imageCredentials.email    | Email to access/download vmbc explorer           | ""                          | Optional  |
| global.image.repository          | Image name to download for vmbc explorer         | vmwblockchain/vmbc-eth-explorer | Optional |
| global.image.tag                 | Tag version to download vmbc explorer            | 0.0.0.0.7820                | Optional  |
| blockchainUrl                    | Url to link blockchain with vmbc explorer webpage | ""                         | Mandatory |
| resources.explorer.cpuLimit      | CPU limit                                        | 100m                         | Optional  |
| resources.explorer.cpuRequest             | CPU request                             | 100m                         | Optional  |
| resources.explorer.memoryLimit            | Memory limit                            | 1Gi                       | Optional  |
| resources.explorer.memoryRequest          | Memory request                          | 1Gi                       | Optional  |

### Deploy vmbc explorer
- Minikube
    - Without namespace
      - Deployment with parameters
      ```sh
        helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL}
        # Example: helm install --name-template vmbc-explorer . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545
      ```
                    
      - Verify vmbc explorer is installed
      ```sh
        helm list                                           # Verify {name-of-your-choice} helm chart is available
        # Example: helm list                                # Check vmbc-explorer is available
      ```
    
      - Verify Deployments and Services are running
        Note: It may take some time to complete deployment and fully running the explorer.
      ```sh
        kubectl get all                                     # Verify {name-of-your-choice}-deployment and {name-of-your-choice}-service is available
        # Example: kubectl get all                          # Verify vmbc-explorer-deployment and vmbc-explorer-service is available
      ```
    
      - Access vmbc explorer webpage using service url
      ```sh
        minikube service {name-of-your-choice}-service
        # Example: minikube service vmbc-explorer-service
      ```
            
    - With namespace
      Note: Make sure namespace exists or create new before deployment
      - Deployment with parameters
        ```sh
        helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL} -n {namespace-of-your-choice}
        # Example: helm install --name-template vmbc-explorer . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545 -n vmbc-namespace
        ```
       
      - Verify vmbc explorer is installed
        ```sh
        helm list -n {namespace-of-your-choice}             # Verify {name-of-your-choice} helm chart is available
        # Example: helm list -n vmbc-namespace              # Check vmbc-explorer is available
        ```
    
      - Verify Deployments and Services are running
        Note: It may take some time to complete deployment and fully running the explorer.
      ```sh
        kubectl get all  -n {namespace-of-your-choice}      # Verify {name-of-your-choice}-deployment and {name-of-your-choice}-service is available
        # Example: kubectl get all -n vmbc-namespace        # Verify vmbc-explorer-deployment and vmbc-explorer-service is available
      ```
    
      - Access vmbc explorer webpage using service url
      ```sh
        minikube service {name-of-your-choice}-service -n {namespace-of-your-choice}
        # Example: minikube service vmbc-explorer-service -n vmbc-namespace
      ```
        
### Remove vmbc explorer ( optional )
- Minikube
    - Without namespace
      - Uninstall
      ```sh
        helm uninstall {name-of-your-choice}
        # Example: helm uninstall vmbc-explorer
      ```
    
      - Verify vmbc explorer is removed
      ```sh
        helm list                                           # Verify {name-of-your-choice} helm chart is not available
        # Example: helm list                                # Check vmbc-explorer is not available
      ```
    
    - With namespace
      - Uninstall
      ```sh
        helm uninstall {name-of-your-choice} -n {your-namespace-name-here}
        # Example: helm uninstall vmbc-explorer -n vmbc-namespace
      ```
    
      - Verify vmbc explorer is removed
      ```sh
        helm list -n {your-namespace-name-here}             # Verify {name-of-your-choice} helm chart is not available
        # Example: helm list -n vmbc-namespace              # Check vmbc-explorer is not available
      ```
