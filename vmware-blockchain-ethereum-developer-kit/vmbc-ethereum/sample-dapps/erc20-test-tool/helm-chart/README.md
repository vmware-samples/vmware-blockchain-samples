## Host system pre-requisites
  ```sh
  kubectl ( https://kubernetes.io/docs/tasks/tools/ )
  helm chart ( https://helm.sh/docs/intro/install/ )
  (optional) minikube (https://minikube.sigs.k8s.io/docs/start/)
  (optional) eksctl (https://eksctl.io/)
  ```

### Deploy vmbc erc20 token transfer test
  - Deployment with parameters
  ```sh
  helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL}
  # Example: helm install --name-template vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545
  ```
        
### Run vmbc erc20 token transfer test
  ```sh
  helm test {name-of-your-choice}
  # Example: helm test vmbc-erc20test
  # Sample Result:
    # NAME: vmbc-erc20test
    # LAST DEPLOYED: Wed Sep 28 17:49:01 2022
    # NAMESPACE: default
    # STATUS: deployed
    # REVISION: 1
    # TEST SUITE:     vmbc-erc20test-test
    # Last Started:   Wed Sep 28 17:49:33 2022
    # Last Completed: Wed Sep 28 17:49:52 2022
    # Phase:          Succeeded

  # Note: Each testCount=n generates total of 1+2n transactions
    # 1 - Deploy the nft contract
    # 2n - Transactions from contract to account
  ```
        
### Remove vmbc erc20 token transfer test ( optional )
  - Uninstall
  ```sh
  helm uninstall {name-of-your-choice} && kubectl delete pod {name-of-your-choice}-test
  # Example: helm uninstall vmbc-erc20test && kubectl delete pod vmbc-erc20test-test
  ```

## VMBC erc20 token transfer test deployment
  - List of configurations available for vmbc erc20 token transfer test deployment. Use "--set" param for setting up the params.

| Name                             | Description                                                | Value                | Type      |
|----------------------------------|------------------------------------------------------------|----------------------|-----------|
| global.imageCredentials.registry | Url to download python image        | ""                   |   Mandatory        |
| global.imageCredentials.username |  Username to access/download python image       | ""                   |    Mandatory       |
| global.imageCredentials.password |  Password to access/download python image               | ""                   |   Mandatory        |
| global.imageCredentials.email    | Email to access/download python image        | ""                   |     Optional      |
| global.image.repository          |        Image name to download for python image        | vmwblockchain/python |   Optional        |
| global.image.tag                 |             Tag version to download python image               | "3.9.10"                   |    Optional       |
| blockchainUrl                    | Url to link blockchain with vmbc erc20 token transfer test | ""                   | Mandatory |
| testCount                        | Number of erc20 token transfer test                        | 2                    | Optional  |
| resources.erc20test.cpuLimit          | CPU limit                                                  | 100m                 |       Optional    |
| resources.erc20test.cpuRequest        | CPU request                                                | 100m                 |       Optional    |
| resources.erc20test.memoryLimit       | Memory limit                                               | 1Gi                  |     Optional      |
| resources.erc20test.memoryRequest     | Memory request                                             | 1Gi                  |     Optional      |
