# VMBC Explorer
A web application has been designed and implemented with universal search, block and transaction detail views. The Auto refresh feature will keep the dashboard live with the updated details. The refresh interval is set to disabled by default, and it can be altered as per the needs, and also it can be disabled when it's not needed. The Browser cache feature will keep accumulating the data fetched in local storage, which will prevent duplicate requests to the EthRPC API. It uses Angular With Clarity Design Framework to adhere to VMWare Web Application Standards. The performance of the blockchain won't be affected by this as it is packaged and deployed in a separate container. The explorer will connect to blockchain only when its deployed and configured with a specific instance URL. With the help of cache and auto refresh interval, the interaction between the blockchain and the explorer can be improved further.

**Host system pre-requisites**

    kubectl ( https://kubernetes.io/docs/tasks/tools/ )
    helm chart ( https://helm.sh/docs/intro/install/ )

**Check pre-requisites commands before proceeding further**

    kubectl version             -> Verify kubectl is installed
    helm version                -> Verify helm is installed

**VMBC explorer deployment**

    1. Configurations
        List of available configurations in values.yaml. Use "--set" param for setting up the params.
| Name                             | Description                                      | Value                       | Type      |
|----------------------------------|--------------------------------------------------|-----------------------------|-----------|
| global.imageCredentials.registry | Url to download vmbc explorer                    | ""                          | Mandatory |
| global.imageCredentials.username | Username to access/download vmbc explorer        | ""                          | Mandatory |
| global.imageCredentials.password | Password to access/download vmbc explorer        | ""                          | Mandatory |
| global.imageCredentials.email    | Email to access/download vmbc explorer           | ""                          | Optional  |
| global.image.repository          | Image name to download for vmbc explorer         | vmwblockchain/eth-ui-explorer | Optional |
| blockchainUrl                    | Url to link blockchain with vmbc explorer webpage | ""                         | Mandatory |
| resources.explorer.cpuLimit      | CPU limit                                        | 10m                         | Optional  |
| resources.explorer.cpuRequest             | CPU request                             | 10m                         | Optional  |
| resources.explorer.memoryLimit            | Memory limit                            | 100Mi                       | Optional  |
| resources.explorer.memoryRequest          | Memory request                          | 100Mi                       | Optional  |

    2. Deploy vmbc explorer
        i) Minikube
            A) Without namespace
                a) Deployment with parameters
                    helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL}
                    Example: helm install --name-template vmbc-explorer . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=0.0.1 --set blockchainUrl=http://127.0.0.1:30545
                    
                b) Verify vmbc explorer is installed
                    helm list                                           -> Verify {name-of-your-choice} helm chart is available
                    Example: helm list                                  -> Check vmbc-explorer is available
    
                c) Verify Deployments and Services are running
                    Note: It may take some time to complete deployment and fully running the explorer.
                    kubectl get all                                     -> Verify {name-of-your-choice}-deployment and {name-of-your-choice}-service is available
                    Example: kubectl get all                            -> Verify vmbc-explorer-deployment and vmbc-explorer-service is available
    
                d) Access vmbc explorer webpage using service url
                    minikube service {name-of-your-choice}-service
                    Example: minikube service vmbc-explorer-service
            
            B) With namespace
                Note: Make sure namespace exists or create new before deployment
                a) Deployment with parameters
                    helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL} -n {namespace-of-your-choice}
                    Example: helm install --name-template vmbc-explorer . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=0.1.0 --set blockchainUrl=http://127.0.0.1:30545 -n vmbc-namespace
                    
                b) Verify vmbc explorer is installed
                    helm list -n {namespace-of-your-choice}             -> Verify {name-of-your-choice} helm chart is available
                    Example: helm list -n vmbc-namespace                -> Check vmbc-explorer is available
    
                c) Verify Deployments and Services are running
                    Note: It may take some time to complete deployment and fully running the explorer.
                    kubectl get all  -n {namespace-of-your-choice}      -> Verify {name-of-your-choice}-deployment and {name-of-your-choice}-service is available
                    Example: kubectl get all -n vmbc-namespace          -> Verify vmbc-explorer-deployment and vmbc-explorer-service is available
    
                d) Access vmbc explorer webpage using service url
                    minikube service {name-of-your-choice}-service -n {namespace-of-your-choice}
                    Example: minikube service vmbc-explorer-service -n vmbc-namespace
        
        ii) DECC
            a) Prerequisites
                - An account on DECC
                - The kubeconfig file for the account
                - The namespace assigned to you
            
            b) Deployment with parameters
                helm --kubeconfig <your-kubeconfig-file> install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL}
                Example: helm --kubeconfig /users/ara-k8s.yaml install --name-template vmbc-explorer . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=0.0.1 --set blockchainUrl=http://client-0-ethrpc.ara-k8s.decc.vmware.com:24157
                    
            c) Verify vmbc explorer is installed
                helm --kubeconfig <your-kubeconfig-file> list                           -> Verify {name-of-your-choice} helm chart is available
                Example: helm --kubeconfig /users/ara-k8s.yaml list                     -> Check vmbc-explorer is available
    
            d) Verify Deployments and Services are running
                Note: It may take some time to complete deployment and fully running the explorer.
                kubectl --kubeconfig <your-kubeconfig-file> get all                     -> Verify {name-of-your-choice}-deployment and {name-of-your-choice}-service is available
                Example: kubectl --kubeconfig /users/ara-k8s.yaml get all               -> Verify vmbc-explorer-deployment and vmbc-explorer-service is available
            
            e) Check vmbc explorer service url and port
                kubectl --kubeconfig <your-kubeconfig-file> get service {name-of-your-choice}-service       -> Verify {name-of-your-choice}-service is available
                Example: kubectl --kubeconfig /users/ara-k8s.yaml get service vmbc-explorer-service         -> Verify vmbc-explorer-service is available
                
                Example Output:
                NAME                    TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)          AGE
                vmbc-explorer-service   LoadBalancer   172.21.224.8   10.168.5.36   8545:31316/TCP   3d23h
                Note: The external port mapping in this example is '31316'
           
            f) Access vmbc explorer webpage using service url
                http://{name-of-your-choice}-service.ara.decc.vmware.com:<port-number>
                Example: http://vmbc-explorer-service.ara.decc.vmware.com:31316
                Note: Here "ara" is the DECC testbed used for this example

    3. Remove vmbc explorer ( optional )
        i) Minikube
            A) Without namespace
                a) Uninstall
                    helm uninstall {name-of-your-choice}
                    Example: helm uninstall vmbc-explorer
    
                b) Verify vmbc explorer is removed
                    helm list                                           -> Verify {name-of-your-choice} helm chart is not available
                    Example: helm list                                  -> Check vmbc-explorer is not available
    
            B) With namespace
                a) Uninstall
                    helm uninstall {name-of-your-choice} -n {your-namespace-name-here}
                    Example: helm uninstall vmbc-explorer -n vmbc-namespace
    
                b) Verify vmbc explorer is removed
                    helm list -n {your-namespace-name-here}             -> Verify {name-of-your-choice} helm chart is not available
                    Example: helm list -n vmbc-namespace                -> Check vmbc-explorer is not available
        
        ii) DECC
            a) Uninstall
                helm --kubeconfig <your-kubeconfig-file> uninstall {name-of-your-choice}
                Example: helm --kubeconfig /users/ara-k8s.yaml uninstall vmbc-explorer
    
            b) Verify vmbc explorer is removed
                helm --kubeconfig <your-kubeconfig-file> list               -> Verify {name-of-your-choice} helm chart is not available
                Example: helm --kubeconfig /users/ara-k8s.yaml list         -> Check vmbc-explorer is not available
