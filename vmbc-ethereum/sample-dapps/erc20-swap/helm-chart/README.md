## Host system pre-requisites
  ```
  kubectl ( https://kubernetes.io/docs/tasks/tools/ )
  helm chart ( https://helm.sh/docs/intro/install/ )
  (optional) minikube (https://minikube.sigs.k8s.io/docs/start/)
  (optional) eksctl (https://eksctl.io/)
  ```

## Deploy vmbc erc20 swap dapp
  - Deployment with parameters
     ```sh
     # Change to Helm Chart directory of ERC20-Swap Sample DApp
     cd vmware-blockchain-samples/vmbc-ethereum/sample-dapps/erc20-swap/helm-chart

     # Helm install ERC20-Swap Sample DApp
     helm install {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set blockchainUrl={blockchainURL}
     ```

  - Access vmbc erc20 swap dapp webpage using service url
  
     Minikube
     ```sh
     minikube service {name-of-your-choice}-service
     ```
     
     EKS
     ```sh
     kubectl get service {name-of-your-choice}-service
     ```
                
## Remove vmbc erc20 swap dapp ( optional )
  - Uninstall
     ```sh
     helm uninstall {name-of-your-choice}
     ```

## VMBC erc20 swap dapp deployment configurations
  - List of configurations available for vmbc erc20 swap dapp deployment. Use "--set" param for setting up the params.

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
