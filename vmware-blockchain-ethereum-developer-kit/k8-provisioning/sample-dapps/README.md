# VMBC ERC-20-SWAP DAPP
A web application has been designed with token transfer functionality. The performance of the blockchain won't be affected by this as it is packaged and deployed in a separate container. This dapp will connect to blockchain only when its deployed and configured with a specific instance URL.

**Host system pre-requisites**

    kubectl ( https://kubernetes.io/docs/tasks/tools/ )
    helm chart ( https://helm.sh/docs/intro/install/ )

**Check pre-requisites commands before proceeding further**

    kubectl version                         -> Verify kubectl is installed
    helm version                            -> Verify helm is installed

**VMBC dapp deployment**

    1. Configurations
        List of available configurations in values.yaml. Use "--set" param for setting up the params.
| Name                             | Description                                  | Value                        | Type      |
|----------------------------------|----------------------------------------------|------------------------------|-----------|
| global.imageCredentials.registry | Url to download vmbc dapp                    | ""                           | Mandatory |
| global.imageCredentials.username | Username to access/download vmbc dapp        | ""                           | Mandatory |
| global.imageCredentials.password | Password to access/download vmbc dapp        | ""                           | Mandatory |
| global.imageCredentials.email    | Email to access/download vmbc dapp           | ""                           | Optional  |
| global.image.repository          | Image name to download for vmbc dapp         | vmwblockchain/eth-erc20-swap | Optional |
| blockchainUrl                    | Url to link blockchain with vmbc dapp webpage | ""                           | Mandatory |
| resources.dapp.cpuLimit          | CPU limit                                    | 10m                          |   Optional        |
| resources.dapp.cpuRequest             | CPU request                                  | 10m                          |     Optional      |
| resources.dapp.meomoryLimit           | Memory limit                                 | 100Mi                        |    Optional       |
| resources.dapp.meomoryRequest         | Memory request                               | 100Mi                          |    Optional       |

    2. Deploy vmbc dapp
        i) Minikube
            A) Without namespace
                a) Deployment with parameters
                    helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL}
                    Example: helm install --name-template vmbc-dapp . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=0.1.0 --set blockchainUrl=http://127.0.0.1:30545
                    
                b) Verify vmbc dapp is installed
                    helm list                                           -> Verify {name-of-your-choice} helm chart is available
                    Example: helm list                                  -> Check vmbc-dapp is available
    
                c) Verify Deployments and Services are running
                    Note: It may take some time to complete deployment and fully running the dapp.
                    kubectl get all                                     -> Verify {name-of-your-choice}-deployment and {name-of-your-choice}-service is available
                    Example: kubectl get all                            -> Verify vmbc-dapp-deployment and vmbc-dapp-service is available
    
                d) Access vmbc dapp webpage using service url
                    minikube service {name-of-your-choice}-service
                    Example: minikube service vmbc-dapp-service
            
            B) With namespace
                Note: Make sure namespace exists or create new before deployment
                a) Deployment with parameters
                    helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL} -n {namespace-of-your-choice}
                    Example: helm install --name-template vmbc-dapp . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=0.1.0 --set blockchainUrl=http://127.0.0.1:30545 -n vmbc-namespace
                    
                d) Verify vmbc dapp is installed
                    helm list -n {namespace-of-your-choice}             -> Verify {name-of-your-choice} helm chart is available
                    Example: helm list -n vmbc-namespace                -> Check vmbc-dapp is available
    
                c) Verify Deployments and Services are running
                    Note: It may take some time to complete deployment and fully running the dapp.
                    kubectl get all  -n {namespace-of-your-choice}      -> Verify {name-of-your-choice}-deployment and {name-of-your-choice}-service is available
                    Example: kubectl get all -n vmbc-namespace          -> Verify vmbc-dapp-deployment and vmbc-dapp-service is available

                d) Access vmbc dapp webpage using service url
                    minikube service {name-of-your-choice}-service -n {namespace-of-your-choice}
                    Example: minikube service vmbc-dapp-service -n vmbc-namespace
        
        ii) DECC
            a) Prerequisites
                - An account on DECC
                - The kubeconfig file for the account
                - The namespace assigned to you
            
            b) Deployment with parameters
                helm --kubeconfig <your-kubeconfig-file> install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL}
                Example: helm --kubeconfig /users/ara-k8s.yaml install --name-template vmbc-dapp . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=0.1.0 --set blockchainUrl=http://client-0-ethrpc.ara-k8s.decc.vmware.com:24157
                    
            c) Verify vmbc dapp is installed
                helm --kubeconfig <your-kubeconfig-file> list                           -> Verify {name-of-your-choice} helm chart is available
                Example: helm --kubeconfig /users/ara-k8s.yaml list                     -> Check vmbc-dapp is available
    
            d) Verify Deployments and Services are running
                Note: It may take some time to complete deployment and fully running the dapp.
                kubectl --kubeconfig <your-kubeconfig-file> get all                     -> Verify {name-of-your-choice}-deployment and {name-of-your-choice}-service is available
                Example: kubectl --kubeconfig /users/ara-k8s.yaml get all               -> Verify vmbc-dapp-deployment and vmbc-dapp-service is available
            
            e) Check vmbc dapp service url and port
                kubectl --kubeconfig <your-kubeconfig-file> get service {name-of-your-choice}-service   -> Verify {name-of-your-choice}-service is available
                Example: kubectl --kubeconfig /users/ara-k8s.yaml get service vmbc-dapp-service         -> Verify vmbc-dapp-service is available
                
                Example Output:
                NAME                TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)          AGE
                vmbc-dapp-service   LoadBalancer   172.21.224.8   10.168.5.36   8545:31317/TCP   3d23h
                Note: The external port mapping in this example is '31317'
           
            f) Access vmbc dapp webpage using service url
                http://{name-of-your-choice}-service.ara.decc.vmware.com:<port-number>
                Example: http://vmbc-dapp-service.ara.decc.vmware.com:31317
                Note: Here "ara" is the DECC testbed used for this example
                
    3. Remove vmbc dapp ( optional )
        i) Minikube
            A) Without namespace
                a) Uninstall
                    helm uninstall {name-of-your-choice}
                    Example: helm uninstall vmbc-dapp
    
                b) Verify vmbc dapp is removed
                    helm list                                           -> Verify {name-of-your-choice} helm chart is not available
                    Example: helm list                                  -> Check vmbc-dapp is not available
    
            B) With namespace
                a) Uninstall
                    helm uninstall {name-of-your-choice} -n {your-namespace-name-here}
                    Example: helm uninstall vmbc-dapp -n vmbc-namespace
    
                b) Verify vmbc dapp is removed
                    helm list -n {your-namespace-name-here}             -> Verify {name-of-your-choice} helm chart is not available
                    Example: helm list -n vmbc-namespace                -> Check vmbc-dapp is not available
        
        ii) DECC
            a) Uninstall
                helm --kubeconfig <your-kubeconfig-file> uninstall {name-of-your-choice}
                Example: helm --kubeconfig /users/ara-k8s.yaml uninstall vmbc-explorer
    
            b) Verify vmbc explorer is removed
                helm --kubeconfig <your-kubeconfig-file> list               -> Verify {name-of-your-choice} helm chart is not available
                Example: helm --kubeconfig /users/ara-k8s.yaml list         -> Check vmbc-explorer is not available
