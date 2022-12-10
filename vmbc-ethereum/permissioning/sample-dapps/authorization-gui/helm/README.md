## Host system pre-requisites
  ```
  kubectl ( https://kubernetes.io/docs/tasks/tools/ )
  helm chart ( https://helm.sh/docs/intro/install/ )
  (optional) minikube (https://minikube.sigs.k8s.io/docs/start/)
  (optional) eksctl (https://eksctl.io/)
  ```

### Deploy VMware Blockchain permissioning-ui dapp
  - Deployment with parameters
     ```sh
     helm install {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL}
     ```

  - Access VMware Blockchain permissioning dapp webpage using service url
  
     Minikube
     ```sh
     minikube service {name-of-your-choice}-service
     ```  
  
     EKS
     ```sh
     kubectl get service {name-of-your-choice}-service
     ```
                
### Remove VMware Blockchain permissioning dapp ( optional )
  ```sh
  helm uninstall {name-of-your-choice}
  ```

## VMware Blockchain permissioning dapp deployment configurations
  - List of configurations available for VMware Blockchain permissioning dapp deployment. Use "--set" param for setting up the params.

| Name                             | Description                                       | Value                        | Type      |
|----------------------------------|---------------------------------------------------|------------------------------|-----------|
| global.imageCredentials.registry | Url to download vmbc permissioning dapp                     | ""                           | Mandatory |
| global.imageCredentials.username | Username to access/download vmbc permissioning dapp         | ""                           | Mandatory |
| global.imageCredentials.password | Password to access/download vmbc permissioning dapp         | ""                           | Mandatory |
| global.imageCredentials.email    | Email to access/download vmbc permissioning dapp            | ""                           | Optional  |
| global.image.repository          | Image name to download for vmbc permissioning dapp          | vmwblockchain/vmbc-eth-artemis | Optional |
| global.image.tag                 | Tag version to download vmbc permissioning dapp             | 0.0.0.0.7849                       | Optional  |
| blockchainUrl                    | Url to link blockchain with vmbc permissioning dapp webpage | ""                           | Mandatory |
| resources.permissioning.cpuLimit           | CPU limit                                         | 1000m                          |   Optional        |
| resources.permissioning.cpuRequest         | CPU request                                       | 100m                          |     Optional      |
| resources.permissioning.meomoryLimit       | Memory limit                                      | 2Gi                        |    Optional       |
| resources.permissioning.meomoryRequest     | Memory request                                    | 1Gi                          |    Optional       |
