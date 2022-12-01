## Host system pre-requisites
  ```
  kubectl ( https://kubernetes.io/docs/tasks/tools/ )
  helm chart ( https://helm.sh/docs/intro/install/ )
  (optional) minikube (https://minikube.sigs.k8s.io/docs/start/)
  (optional) eksctl (https://eksctl.io/)
  ```

### Deploy vmbc nft dapp
  - Deployment with parameters
     ```sh
     helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL}
     ```

  - Access vmbc nft dapp webpage using service url
  
     Minikube
     ```sh
     minikube service {name-of-your-choice}-service
     ```  
  
     EKS
     ```sh
     kubectl get service {name-of-your-choice}-service
     ```
                
### Remove vmbc nft dapp ( optional )
  ```sh
  helm uninstall {name-of-your-choice}
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
