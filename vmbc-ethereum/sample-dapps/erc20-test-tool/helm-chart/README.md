## Host system pre-requisites
  ```
  kubectl ( https://kubernetes.io/docs/tasks/tools/ )
  helm chart ( https://helm.sh/docs/intro/install/ )
  (optional) minikube (https://minikube.sigs.k8s.io/docs/start/)
  (optional) eksctl (https://eksctl.io/)
  ```

### Deploy VMware Blockchain erc20 token transfer test
  - Deployment with parameters. Replace the blockchainUrl value with the Eth RPC service URL.
     ```sh
     # Change to Helm Chart directory of ERC20 Test Tool Sample DApp
     cd vmware-blockchain-samples/vmbc-ethereum/sample-dapps/erc20-test-tool/helm-chart

     # Helm install ERC20 Test Tool Sample DApp
     helm install <name-of-your-choice> . --set global.imageCredentials.registry=<registry> --set global.imageCredentials.username=<username> --set global.imageCredentials.password=<password> --set blockchainUrl=<blockchainURL>
     ```
        
### Run VMware Blockchain erc20 token transfer test
  ```sh
  helm test <name-of-your-choice> --logs
  ```
        
### Remove VMware Blockchain erc20 token transfer test ( optional )
  - Uninstall
     ```sh
     helm uninstall <name-of-your-choice> && kubectl delete pod <name-of-your-choice>-test
     ```

## VMware Blockchain erc20 token transfer test deployment
  - List of configurations available for VMware Blockchain erc20 token transfer test deployment. Use "--set" param for setting up the params.

| Name                             | Description                                                | Value                | Type      |
|----------------------------------|------------------------------------------------------------|----------------------|-----------|
| global.imageCredentials.registry | Url to download python image        | ""                   |   Mandatory        |
| global.imageCredentials.username |  Username to access/download python image       | ""                   |    Mandatory       |
| global.imageCredentials.password |  Password to access/download python image               | ""                   |   Mandatory        |
| global.imageCredentials.email    | Email to access/download python image        | ""                   |     Optional      |
| global.image.repository          |        Image name to download for python image        | vmwblockchain/erc20-python |   Optional        |
| global.image.tag                 |             Tag version to download python image               | "1.0"                   |    Optional       |
| blockchainUrl                    | Url to link blockchain with vmbc erc20 token transfer test | ""                   | Mandatory |
| testCount                        | Number of erc20 token transfer test                        | 2                    | Optional  |
| resources.erc20test.cpuLimit          | CPU limit                                                  | 100m                 |       Optional    |
| resources.erc20test.cpuRequest        | CPU request                                                | 100m                 |       Optional    |
| resources.erc20test.memoryLimit       | Memory limit                                               | 1Gi                  |     Optional      |
| resources.erc20test.memoryRequest     | Memory request                                             | 1Gi                  |     Optional      |
