## Host system pre-requisites
```
kubectl ( https://kubernetes.io/docs/tasks/tools/ )
helm chart ( https://helm.sh/docs/intro/install/ )
(optional) Minikube (https://minikube.sigs.k8s.io/docs/start/)
(optional) eksctl (https://eksctl.io/)
```
## Deploy VMBC Explorer

- Deployment with parameters. The blockchainUrl value should be set to the Eth RPC service URL.
    ```sh
      helm install <name-of-your-choice> . --set global.imageCredentials.registry=<registry> --set global.imageCredentials.username=<username> --set global.imageCredentials.password=<password> --set blockchainUrl=<blockchainURL>
    ```
- Access VMBC explorer webpage using service url
  - Minikube
    ```sh
      minikube service <name-of-your-choice>-service
    ```
  - EKS
    ```sh
      kubectl get service {name-of-your-choice}-service
    ```

## Remove VMBC Explorer
- Uninstall
  ```sh
    helm uninstall <name-of-your-choice>
  ```

## Detailed configurations for customization
- List of configurations available for vmbc explorer deployment. Use "--set" param for setting up the params.

| Name                             | Description                                      | Value                       | Type      |
|----------------------------------|--------------------------------------------------|-----------------------------|-----------|
| global.imageCredentials.registry | Url to download vmbc explorer                    | ""                          | Mandatory |
| global.imageCredentials.username | Username to access/download vmbc explorer        | ""                          | Mandatory |
| global.imageCredentials.password | Password to access/download vmbc explorer        | ""                          | Mandatory |
| global.imageCredentials.email    | Email to access/download vmbc explorer           | ""                          | Optional  |
| global.image.repository          | Image name to download for vmbc explorer         | vmwblockchain/vmbc-eth-explorer | Optional |
| global.image.tag                 | Tag version to download vmbc explorer            | 0.0.0.0.7849                | Optional  |
| blockchainUrl                    | Url to link blockchain with vmbc explorer webpage | ""                         | Mandatory |
| resources.explorer.cpuLimit      | CPU limit                                        | 100m                         | Optional  |
| resources.explorer.cpuRequest             | CPU request                             | 100m                         | Optional  |
| resources.explorer.memoryLimit            | Memory limit                            | 1Gi                       | Optional  |
| resources.explorer.memoryRequest          | Memory request                          | 1Gi                       | Optional  |
