# VMBC ERC-20 Token Transfer Test

An application designed to test the ERC-20 token transfer functionality. The performance of the blockchain won't be
affected by this as it is packaged and deployed in a separate container. The tests run connected blockchain only when
its demanded.

## Host system pre-requisites

    kubectl ( https://kubernetes.io/docs/tasks/tools/ )
    helm chart ( https://helm.sh/docs/intro/install/ )

## Check pre-requisites commands before proceeding further

```sh
    kubectl version         -> Verify kubectl is installed
    helm version            -> Verify helm is installed
```

## VMBC erc-20 token transfer test deployment

- Configurations
  List of available configurations in values.yaml. Use "--set" param for setting up the params.

| Name                  | Description                                                | Value                | Type      |
|-----------------------|------------------------------------------------------------|----------------------|-----------|
|        global.imageCredentials.registry                | Url to download python image        | ""                   |   Mandatory        |
|           global.imageCredentials.username            |  Username to access/download python image       | ""                   |    Mandatory       |
|            global.imageCredentials.password           |  Password to access/download python image               | ""                   |   Mandatory        |
|       global.imageCredentials.email                  | Email to access/download python image        | ""                   |     Optional      |
|         global.image.repository                |        Image name to download for python image        | vmwblockchain/python |   Optional        |
|         global.image.tag               |             Tag version to download python image                | "3.9.10"                   |    Optional       |
| blockchainUrl         | Url to link blockchain with vmbc erc-20 token transfer test | ""                   | Mandatory |
| testCount             | Number of erc20 token transfer test                        | 2                    | Optional  |
| resources.cpuLimit    | CPU limit                                                  | 100m                 |       Optional    |
|              resources.cpuRequest         | CPU request                                                | 100m                 |       Optional    |
| resources.memoryLimit | Memory limit                                               | 1Gi                  |     Optional      |
|            resources.memoryRequest           | Memory request                                             | 1Gi                  |     Optional      |

    Note: Each testCount=n generates total of 1+2n transactions
        1 - Deploy the nft contract
        n - Transactions from contract to account
        n - Transactions from account to other account

### Deploy vmbc erc20 token transfer test
- Minikube
  - Without namespace
    - Deployment with "blockchainUrl" only
    ```sh
      helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL}
      Example: helm install --name-template vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545
    ```
      Note: Above instruction uses default testCount value of 2. To override "testCount" during installtion look for option (B)
    
    - Deployment with "blockchainUrl" and "testCount"
    ```sh
      helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL} --set testCount={testCount}
      Example: helm install --name-template vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545 --set testCount=5
    ```
    
    -  Verify vmbc erc20 token transfer test is installed
    ```sh
       helm list                   -> Verify {name-of-your-choice} helm chart is available
       Example: helm list          -> Check vmbc-erc20test is available
    ```
    
    - Verify configmap is deployed
    ```sh
      kubectl get configmap                   -> Verify {name-of-your-choice}-configmap is available
      Example: kubectl get configmap          -> Check vmbc-erc20test-configmap is available
    ```
    
- With namespace
  Note: Make sure namespace exists or create new before deployment
   - Deployment with namespace and "blockchainUrl" only
   ```sh
     helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL} -n {namespace-of-your-choice}
     Example: helm install --name-template vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545 -n vmbc-namespace
   ```
     Note: Above instruction uses default testCount value of 2. To override "testCount" during installtion with namespace look for option (B)
    
   - Deployment with namepsace and "blockchainUrl" and "testCount"
   ```sh
     helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL} --set testCount={testCount} -n {namespace-of-your-choice}
     Example: helm install --name-template vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545 --set testCount=5 -n vmbc-namespace
   ```
    
   - Verify vmbc erc20 token transfer test is installed
   ```sh
     helm list -n {namespace-of-your-choice}                -> Verify {name-of-your-choice} helm chart is available
     Example: helm list -n vmbc-namespace                   -> Check vmbc-erc20test is available
   ```
    
   - Verify configmap is deployed
   ```sh 
     kubectl get configmap -n {namespace-of-your-choice}    -> Verify {name-of-your-choice}-configmap is available
     Example: kubectl get configmap -n vmbc-namespace       -> Check vmbc-erc20test-configmap is available
   ```
        
### Run vmbc erc20 token transfer test
- Minikube
   - Without namespace
      - Without logs
      ```sh
        helm test {name-of-your-choice}
        Example: helm test vmbc-erc20test
        Sample Result:
          NAME: vmbc-erc20test
          LAST DEPLOYED: Wed Sep 28 17:49:01 2022
          NAMESPACE: default
          STATUS: deployed
          REVISION: 1
          TEST SUITE:     vmbc-erc20test-test
          Last Started:   Wed Sep 28 17:49:33 2022
          Last Completed: Wed Sep 28 17:49:52 2022
          Phase:          Succeeded
      ```
        Note: Above instruction uses default testCount value of 2 or with value set in Step 2->i->B. To override test count during installtion look for option (C)
            
      - With logs
      ```sh
        helm test {name-of-your-choice} --logs
        Example: helm test vmbc-erc20test --logs
        Sample Result:
          NAME: vmbc-erc20test
          LAST DEPLOYED: Wed Sep 28 17:49:01 2022
          NAMESPACE: default
          STATUS: deployed
          REVISION: 1
          TEST SUITE:     vmbc-erc20test-test
          Last Started:   Wed Sep 28 17:51:24 2022
          Last Completed: Wed Sep 28 17:51:45 2022
          Phase:          Succeeded
          POD LOGS:       vmbc-erc20test-test
          ======================== 3 passed, 26 warnings in 2.80s ========================
      ```
         Note: Above instruction uses default testCount value of 2 or with value set in Step 2->i->B. To override test count during installtion look for option (C)
    
      - Run with updated testCount value
      ```sh
        helm upgrade {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL} --set testCount={testCount}
        Example: helm upgrade vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545 --set testCount=5
      ```
        Proceed with above step (a) or (b) to run with the updated value
            
   - With namespace
      - Without logs
      ```sh
        helm test {name-of-your-choice} -n {namespace-of-your-choice}
        Example: helm test vmbc-erc20test -n vmbc-namespace
        Sample Result:
          NAME: vmbc-erc20test
          LAST DEPLOYED: Wed Sep 28 18:04:26 2022
          NAMESPACE: vmbc-namespace
          STATUS: deployed
          REVISION: 1
          TEST SUITE:     vmbc-erc20test-test
          Last Started:   Wed Sep 28 18:09:56 2022
          Last Completed: Wed Sep 28 18:10:17 2022
          Phase:          Succeeded
      ```
        Note: Above instruction uses default testCount value of 2 or with value set in Step 2->ii->B. To override test count during installtion look for option (C)
            
      - With logs
      ```sh
        helm test {name-of-your-choice} --logs -n {namespace-of-your-choice}
        Example: helm test vmbc-erc20test --logs -n vmbc-namespace
        Sample Result:
          NAME: vmbc-erc20test
          LAST DEPLOYED: Wed Sep 28 18:04:26 2022
          NAMESPACE: vmbc-namespace
          STATUS: deployed
          REVISION: 1
          TEST SUITE:     vmbc-erc20test-test
          Last Started:   Wed Sep 28 18:09:56 2022
          Last Completed: Wed Sep 28 18:10:17 2022
          Phase:          Succeeded
          POD LOGS:       vmbc-erc20test-test
          ======================== 3 passed, 26 warnings in 2.67s ========================
       ```
        Note: Above instruction uses default testCount value of 2 or with value set in Step 2->ii->B. To override test count during installtion look for option (C)
    
      - Run with updated testCount value
      ```sh
        helm upgrade {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL} --set testCount={testCount} -n {namespace-of-your-choice}
        Example: helm upgrade vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545 --set testCount=5 -n vmbc-namespace
      ```
        Proceed with above step (a) or (b) to run with the updated value
        
### Remove vmbc erc20 token transfer test ( optional )
- Minikube
   - Without namespace
      - Uninstall
      ```sh
        helm uninstall {name-of-your-choice} && kubectl delete pod {name-of-your-choice}-test
        Example: helm uninstall vmbc-erc20test && kubectl delete pod vmbc-erc20test-test
      ```
    
      - Verify vmbc erc20 token transfer test is uninstalled
      ```sh
        helm list                   -> Verify {name-of-your-choice} helm chart is not available
        Example: helm list          -> Check vmbc-erc20test is not available
      ```
    
      - Verify pod is removed
      ```sh
        kubectl get pod             -> Verify {name-of-your-choice}-test pod is not available
        Example: kubectl get pod    -> Check vmbc-erc20test is not available
      ```
    
   - With namespace
      - Uninstall
      ```sh
        helm uninstall {name-of-your-choice} -n {your-namespace-name-here} && kubectl delete pod {name-of-your-choice}-test -n {your-namespace-name-here}
        Example: helm uninstall vmbc-erc20test -n vmbc-namespace && kubectl delete pod vmbc-erc20test-test -n vmbc-namespace
      ```
    
      - Verify vmbc erc20 token transfer test is uninstalled
      ```sh
        helm list -n {your-namespace-name-here}         -> Verify {name-of-your-choice} helm chart is not available
        Example: helm list -n vmbc-namespace            -> Check vmbc-erc20test is not available
      ```
    
      - Verify pod is removed
      ```sh
        kubectl get pod -n {your-namespace-name-here}   -> Verify {name-of-your-choice}-test pod is not available
        Example: kubectl get pod -n vmbc-namespace      -> Check vmbc-erc20test-test is not available
      ```
