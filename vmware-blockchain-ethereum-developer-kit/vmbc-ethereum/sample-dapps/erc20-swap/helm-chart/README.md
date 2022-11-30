# VMBC ERC-20-SWAP DAPP
A web application has been designed with token transfer functionality. The performance of the blockchain won't be affected by this as it is packaged and deployed in a separate container. This erc20 swap dapp will connect to blockchain only when its deployed and configured with a specific instance URL.

## Host system pre-requisites**

    kubectl ( https://kubernetes.io/docs/tasks/tools/ )
    helm chart ( https://helm.sh/docs/intro/install/ )

## Check pre-requisites commands before proceeding further**
```sh
    kubectl version                         # Verify kubectl is installed
    helm version                            # Verify helm is installed
```

## VMBC erc20 swap dapp deployment**

- Configurations
  List of available configurations in values.yaml. Use "--set" param for setting up the params.
  
| Name                             | Description                                  | Value                        | Type      |
|----------------------------------|----------------------------------------------|------------------------------|-----------|
| global.imageCredentials.registry | Url to download vmbc erc20 swap dapp                    | ""                           | Mandatory |
| global.imageCredentials.username | Username to access/download vmbc erc20 swap dapp        | ""                           | Mandatory |
| global.imageCredentials.password | Password to access/download vmbc erc20 swap dapp        | ""                           | Mandatory |
| global.imageCredentials.email    | Email to access/download vmbc erc20 swap dapp           | ""                           | Optional  |
| global.image.repository          | Image name to download for vmbc erc20 swap dapp         | vmwblockchain/vmbc-eth-erc20-swap | Optional |
| global.image.tag                 | Tag version to download vmbc erc20 swap dapp            | 0.0.0.0.7849                       | Optional  |
| blockchainUrl                    | Url to link blockchain with vmbc erc20 swap dapp webpage | ""                           | Mandatory |
| resources.erc20swap.cpuLimit     | CPU limit                                    | 1000m                          |   Optional        |
| resources.erc20swap.cpuRequest        | CPU request                                  | 100m                          |     Optional      |
| resources.erc20swap.meomoryLimit      | Memory limit                                 | 2Gi                        |    Optional       |
| resources.erc20swap.meomoryRequest    | Memory request                               | 1Gi                          |    Optional       |

### Deploy vmbc erc20 swap dapp
- Minikube
  - Without namespace
    - Deployment with parameters
    ```sh
      helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL}
      # Example: helm install --name-template vmbc-erc20swap . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545
    ```  
                    
    - Verify vmbc erc20 swap dapp is installed
    ```sh
      helm list                                           # Verify {name-of-your-choice} helm chart is available
      # Example: helm list                                # Check vmbc-erc20swap is available
    ```
    - Verify Deployments and Services are running
      Note: It may take some time to complete deployment and fully running the erc20 swap dapp.
    ```sh
      kubectl get all                                     # Verify {name-of-your-choice}-deployment and {name-of-your-choice}-service is available
      Example: kubectl get all                            # Verify vmbc-erc20swap-deployment and vmbc-erc20swap-service is available
    ```
    
    - Access vmbc erc20 swap dapp webpage using service url
    ```sh
      minikube service {name-of-your-choice}-service
      # Example: minikube service vmbc-erc20swap-service
    ```    
  - With namespace
    Note: Make sure namespace exists or create new before deployment
    - Deployment with parameters
    ```sh
      helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL} -n {namespace-of-your-choice}
      # Example: helm install --name-template vmbc-erc20swap . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545 -n vmbc-namespace
    ```  
                    
    - Verify vmbc erc20 swap dapp is installed
    ```sh
          helm list -n {namespace-of-your-choice}             # Verify {name-of-your-choice} helm chart is available
          # Example: helm list -n vmbc-namespace              # Check vmbc-erc20swap is available
    ```
    - Verify Deployments and Services are running
      Note: It may take some time to complete deployment and fully running the erc20 swap dapp.
      ```sh
        kubectl get all  -n {namespace-of-your-choice}      # Verify {name-of-your-choice}-deployment and {name-of-your-choice}-service is available
        # Example: kubectl get all -n vmbc-namespace        # Verify vmbc-erc20swap-deployment and vmbc-erc20swap-service is available
      ```

    -  Access vmbc erc20 swap dapp webpage using service url
        ```sh
           minikube service {name-of-your-choice}-service -n {namespace-of-your-choice}
           # Example: minikube service vmbc-erc20swap-service -n vmbc-namespace
        ```
                
### Remove vmbc erc20 swap dapp ( optional )
- Minikube
  - Without namespace
    - Uninstall
    ```sh
      helm uninstall {name-of-your-choice}
      # Example: helm uninstall vmbc-erc20swap
    ```
    
    - Verify vmbc erc20 swap dapp is removed
    ```sh
      helm list                                           # Verify {name-of-your-choice} helm chart is not available
      # Example: helm list                                # Check vmbc-erc20swap is not available
    ```
    
  - With namespace
    - Uninstall
    ```sh
      helm uninstall {name-of-your-choice} -n {your-namespace-name-here}
      # Example: helm uninstall vmbc-erc20swap -n vmbc-namespace
    ```
    - Verify vmbc erc20 swap dapp is removed
    ```sh
      helm list -n {your-namespace-name-here}             # Verify {name-of-your-choice} helm chart is not available
      # Example: helm list -n vmbc-namespace              # Check vmbc-erc20swap is not available
    ```
