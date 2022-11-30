## Host system pre-requisites
  ```sh
    kubectl ( https://kubernetes.io/docs/tasks/tools/ )
    helm chart ( https://helm.sh/docs/intro/install/ )
  ```

### Deploy vmbc explorer
  - Deployment with parameters
  ```sh
    helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL}
    # Example: helm install --name-template vmbc-explorer . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set blockchainUrl=http://127.0.0.1:30545
  ```

  - Access vmbc explorer webpage using service url
  ```sh
    Minikube
      minikube service {name-of-your-choice}-service
      # Example: minikube service vmbc-explorer-service
    EKS
      kubectl get service {name-of-your-choice}-service
      # Example: kubectl get service vmbc-explorer-service
  ```
        
### Remove vmbc explorer ( optional )
  - Uninstall
  ```sh
    helm uninstall {name-of-your-choice}
    # Example: helm uninstall vmbc-explorer
  ```

## VMBC explorer deployment
  - List of configurations available for vmbc explorer deployment. Use "--set" param for setting up the params.

| Name                             | Description                                      | Value                           | Type      |
|----------------------------------|--------------------------------------------------|---------------------------------|-----------|
| global.imageCredentials.registry | Url to download vmbc explorer                    | ""                              | Mandatory |
| global.imageCredentials.username | Username to access/download vmbc explorer        | ""                              | Mandatory |
| global.imageCredentials.password | Password to access/download vmbc explorer        | ""                              | Mandatory |
| global.imageCredentials.email    | Email to access/download vmbc explorer           | ""                              | Optional  |
| global.image.repository          | Image name to download for vmbc explorer         | vmwblockchain/vmbc-eth-explorer | Optional |
| global.image.tag                 | Tag version to download vmbc explorer            | 0.0.0.0.7849                    | Optional  |
| blockchainUrl                    | Url to link blockchain with vmbc explorer webpage | ""                              | Mandatory |
| resources.explorer.cpuLimit      | CPU limit                                        | 100m                            | Optional  |
| resources.explorer.cpuRequest             | CPU request                             | 100m                            | Optional  |
| resources.explorer.memoryLimit            | Memory limit                            | 1Gi                             | Optional  |
| resources.explorer.memoryRequest          | Memory request                          | 1Gi                             | Optional  |
