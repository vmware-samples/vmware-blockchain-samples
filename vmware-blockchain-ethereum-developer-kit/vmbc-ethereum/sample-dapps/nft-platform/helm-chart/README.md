## Host system pre-requisites
  ```sh
    kubectl ( https://kubernetes.io/docs/tasks/tools/ )
    helm chart ( https://helm.sh/docs/intro/install/ )
  ```

### Deploy vmbc nft dapp
  - Deployment with parameters
  ```sh
    helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL}
    # Example: helm install --name-template vmbc-nft . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545
  ```

  - Access vmbc nft dapp webpage using service url
  ```sh
    Minikube
      minikube service {name-of-your-choice}-service
      # Example: minikube service vmbc-nft-service
    EKS
      kubectl get service {name-of-your-choice}-service
      # Example: kubectl get service vmbc-nft-service
  ```
                
### Remove vmbc nft dapp ( optional )
  - Uninstall
  ```sh
    helm uninstall {name-of-your-choice}
    # Example: helm uninstall vmbc-nft
  ```

## VMBC nft dapp deployment configurations
  - List of configurations available for vmbc nft dapp deployment. Use "--set" param for setting up the params.

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
