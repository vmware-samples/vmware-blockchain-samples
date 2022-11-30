# VMBC NFT DAPP
A web application has been designed with nft transfer functionality. The performance of the blockchain won't be affected by this as it is packaged and deployed in a separate container. This nft dapp will connect to blockchain only when its deployed and configured with a specific instance URL.

## Host system pre-requisites**

    kubectl ( https://kubernetes.io/docs/tasks/tools/ )
    helm chart ( https://helm.sh/docs/intro/install/ )

## Check pre-requisites commands before proceeding further**
```sh
    kubectl version                         # Verify kubectl is installed
    helm version                            # Verify helm is installed
```

## VMBC nft dapp deployment**

- Configurations
  List of available configurations in values.yaml. Use "--set" param for setting up the params.
  
| Name                             | Description                                       | Value                        | Type      |
|----------------------------------|---------------------------------------------------|------------------------------|-----------|
| global.imageCredentials.registry | Url to download vmbc nft dapp                     | ""                           | Mandatory |
| global.imageCredentials.username | Username to access/download vmbc nft dapp         | ""                           | Mandatory |
| global.imageCredentials.password | Password to access/download vmbc nft dapp         | ""                           | Mandatory |
| global.imageCredentials.email    | Email to access/download vmbc nft dapp            | ""                           | Optional  |
| global.image.repository          | Image name to download for vmbc nft dapp          | vmwblockchain/vmbc-eth-artemis | Optional |
| global.image.tag                 | Tag version to download vmbc nft dapp             | 0.0.0.0.7849                       | Optional  |
| blockchainUrl                    | Url to link blockchain with vmbc nft dapp webpage | ""                           | Mandatory |
| resources.nft.cpuLimit           | CPU limit                                         | 1000m                          |   Optional        |
| resources.nft.cpuRequest         | CPU request                                       | 100m                          |     Optional      |
| resources.nft.meomoryLimit       | Memory limit                                      | 2Gi                        |    Optional       |
| resources.nft.meomoryRequest     | Memory request                                    | 1Gi                          |    Optional       |

### Deploy vmbc nft dapp
- Minikube
  - Without namespace
    - Deployment with parameters
    ```sh
      helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL}
      # Example: helm install --name-template vmbc-nft . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545
    ```  
                    
    - Verify vmbc nft dapp is installed
    ```sh
      helm list                                           # Verify {name-of-your-choice} helm chart is available
      # Example: helm list                                # Check vmbc-nft is available
    ```
    - Verify Deployments and Services are running
      Note: It may take some time to complete deployment and fully running the nft dapp.
    ```sh
      kubectl get all                                     # Verify {name-of-your-choice}-deployment and {name-of-your-choice}-service is available
      Example: kubectl get all                            # Verify vmbc-nft-deployment and vmbc-nft-service is available
    ```
    
    - Access vmbc nft dapp webpage using service url
    ```sh
      minikube service {name-of-your-choice}-service
      # Example: minikube service vmbc-nft-service
    ```    
  - With namespace
    Note: Make sure namespace exists or create new before deployment
    - Deployment with parameters
    ```sh
      helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL} -n {namespace-of-your-choice}
      # Example: helm install --name-template vmbc-nft . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545 -n vmbc-namespace
    ```  
                    
    - Verify vmbc nft dapp is installed
    ```sh
          helm list -n {namespace-of-your-choice}             # Verify {name-of-your-choice} helm chart is available
          # Example: helm list -n vmbc-namespace              # Check vmbc-nft is available
    ```
    - Verify Deployments and Services are running
      Note: It may take some time to complete deployment and fully running the nft dapp.
      ```sh
        kubectl get all  -n {namespace-of-your-choice}      # Verify {name-of-your-choice}-deployment and {name-of-your-choice}-service is available
        # Example: kubectl get all -n vmbc-namespace        # Verify vmbc-nft-deployment and vmbc-nft-service is available
      ```

    -  Access vmbc nft dapp webpage using service url
        ```sh
           minikube service {name-of-your-choice}-service -n {namespace-of-your-choice}
           # Example: minikube service vmbc-nft-service -n vmbc-namespace
        ```
                
### Remove vmbc nft dapp ( optional )
- Minikube
  - Without namespace
    - Uninstall
    ```sh
      helm uninstall {name-of-your-choice}
      # Example: helm uninstall vmbc-nft
    ```
    
    - Verify vmbc nft dapp is removed
    ```sh
      helm list                                           # Verify {name-of-your-choice} helm chart is not available
      # Example: helm list                                # Check vmbc-nft is not available
    ```
    
  - With namespace
    - Uninstall
    ```sh
      helm uninstall {name-of-your-choice} -n {your-namespace-name-here}
      # Example: helm uninstall vmbc-nft -n vmbc-namespace
    ```
    - Verify vmbc nft dapp is removed
    ```sh
      helm list -n {your-namespace-name-here}             # Verify {name-of-your-choice} helm chart is not available
      # Example: helm list -n vmbc-namespace              # Check vmbc-nft is not available
    ```
