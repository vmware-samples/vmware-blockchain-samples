# VMBC ERC-20 Token Transfer Test

An application designed to test the ERC-20 token transfer functionality. The performance of the blockchain won't be
affected by this as it is packaged and deployed in a separate container. The tests run connected blockchain only when
its demanded.

**Host system pre-requisites**

    kubectl ( https://kubernetes.io/docs/tasks/tools/ )
    helm chart ( https://helm.sh/docs/intro/install/ )

**Check pre-requisites commands before proceeding further**

    kubectl version         -> Verify kubectl is installed
    helm version            -> Verify helm is installed

**VMBC erc-20 token transfer test deployment**

    1. Configurations
        List of available configurations in values.yaml. Use "--set" param for setting up the params.

| Name                  | Description                                                | Value                | Type      |
|-----------------------|------------------------------------------------------------|----------------------|-----------|
|        global.imageCredentials.registry                | Url to download python image        | ""                   |   Mandatory        |
|           global.imageCredentials.username            |  Username to access/download python image       | ""                   |    Mandatory       |
|            global.imageCredentials.password           |  Password to access/download python image               | ""                   |   Mandatory        |
|       global.imageCredentials.email                  | Email to access/download python image        | ""                   |     Optional      |
|         global.image.repository                |        Image name to download for python image        | vmwblockchain/python |   Optional        |
|         global.image.tag               |             Tag version to download python image                | ""                   |    Mandatory       |
| blockchainUrl         | Url to link blockchain with vmbc erc-20 token transfer test | ""                   | Mandatory |
| testCount             | Number of erc20 token transfer test                        | 2                    | Optional  |
| resources.cpuLimit    | CPU limit                                                  | 100m                 |       Optional    |
|              resources.cpuRequest         | CPU request                                                | 100m                 |       Optional    |
| resources.memoryLimit | Memory limit                                               | 1Gi                  |     Optional      |
|            resources.memoryRequest           | Memory request                                             | 1Gi                  |     Optional      |

    Note: Each testCount=n generates total of 1+2n transactions
        1 - Deploy the nft contract
        n - Transactions from contract to account
        n - Transactions from account to other account

    2. Deploy vmbc erc20 token transfer test
        i) Minikube
            A) Without namespace
                a) Deployment with "blockchainUrl" only
                    helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL}
                    Example: helm install --name-template vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=3.10 --set blockchainUrl=http://127.0.0.1:30545
                    Note: Above instruction uses default testCount value of 2. To override "testCount" during installtion look for option (B)
    
                b) Deployment with "blockchainUrl" and "testCount"
                    helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL} --set testCount={testCount}
                    Example: helm install --name-template vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=3.10 --set blockchainUrl=http://127.0.0.1:30545 --set testCount=5
    
                c) Verify vmbc erc20 token transfer test is installed
                    helm list                   -> Verify {name-of-your-choice} helm chart is available
                    Example: helm list          -> Check vmbc-erc20test is available
    
                d) Verify configmap is deployed
                    kubectl get configmap                   -> Verify {name-of-your-choice}-configmap is available
                    Example: kubectl get configmap          -> Check vmbc-erc20test-configmap is available
    
            B) With namespace
                Note: Make sure namespace exists or create new before deployment
                a) Deployment with namespace and "blockchainUrl" only
                    helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL} -n {namespace-of-your-choice}
                    Example: helm install --name-template vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=3.10 --set blockchainUrl=http://127.0.0.1:30545 -n vmbc-namespace
                    Note: Above instruction uses default testCount value of 2. To override "testCount" during installtion with namespace look for option (B)
    
                b) Deployment with namepsace and "blockchainUrl" and "testCount"
                    helm install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL} --set testCount={testCount} -n {namespace-of-your-choice}
                    Example: helm install --name-template vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=3.10 --set blockchainUrl=http://127.0.0.1:30545 --set testCount=5 -n vmbc-namespace
    
                c) Verify vmbc erc20 token transfer test is installed
                    helm list -n {namespace-of-your-choice}                -> Verify {name-of-your-choice} helm chart is available
                    Example: helm list -n vmbc-namespace                   -> Check vmbc-erc20test is available
    
                d) Verify configmap is deployed
                    kubectl get configmap -n {namespace-of-your-choice}    -> Verify {name-of-your-choice}-configmap is available
                    Example: kubectl get configmap -n vmbc-namespace       -> Check vmbc-erc20test-configmap is available
        
        ii) DECC
            a) Deployment with "blockchainUrl" only
                helm --kubeconfig <your-kubeconfig-file> install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL}
                Example: helm --kubeconfig /users/ara-k8s.yaml install --name-template vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=3.10 --set blockchainUrl=http://127.0.0.1:30545
                Note: Above instruction uses default testCount value of 2. To override "testCount" during installtion look for option (B)
    
            b) Deployment with "blockchainUrl" and "testCount"
                helm --kubeconfig <your-kubeconfig-file> install --name-template {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL} --set testCount={testCount}
                Example: helm --kubeconfig /users/ara-k8s.yaml install --name-template vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=3.10 --set blockchainUrl=http://127.0.0.1:30545 --set testCount=5
    
            c) Verify vmbc erc20 token transfer test is installed
                helm --kubeconfig <your-kubeconfig-file> list                -> Verify {name-of-your-choice} helm chart is available
                Example: helm --kubeconfig /users/ara-k8s.yaml list          -> Check vmbc-erc20test is available
    
            d) Verify configmap is deployed
                kubectl --kubeconfig <your-kubeconfig-file> get configmap                -> Verify {name-of-your-choice}-configmap is available
                Example: kubectl --kubeconfig /users/ara-k8s.yaml get configmap          -> Check vmbc-erc20test-configmap is available
    

    3. Run vmbc erc20 token transfer test
        i) Minikube
            A) Without namespace
                a) Without logs
                    helm test {name-of-your-choice}
                    Example: helm test vmbc-erc20test
                    Sample Result:
                        NAME: vmbc-erc20test
                        LAST DEPLOYED: Wed Sep 28 17:49:01 2022
                        NAMESPACE: default
                        STATUS: deployed
                        REVISION: 1
                        TEST SUITE:     vmbc-erc20test-test
                        Last Started:   Wed Sep 28 17:49:33 2022
                        Last Completed: Wed Sep 28 17:49:52 2022
                        Phase:          Succeeded
                    Note: Above instruction uses default testCount value of 2 or with value set in Step 2->i->B. To override test count during installtion look for option (C)
            
                b) With logs
                    helm test {name-of-your-choice} --logs
                    Example: helm test vmbc-erc20test --logs
                    Sample Result:
                        NAME: vmbc-erc20test
                        LAST DEPLOYED: Wed Sep 28 17:49:01 2022
                        NAMESPACE: default
                        STATUS: deployed
                        REVISION: 1
                        TEST SUITE:     vmbc-erc20test-test
                        Last Started:   Wed Sep 28 17:51:24 2022
                        Last Completed: Wed Sep 28 17:51:45 2022
                        Phase:          Succeeded
                        POD LOGS:       vmbc-erc20test-test
                        ======================== 3 passed, 26 warnings in 2.80s ========================
                    Note: Above instruction uses default testCount value of 2 or with value set in Step 2->i->B. To override test count during installtion look for option (C)
    
                c) Run with updated testCount value
                    helm upgrade {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL} --set testCount={testCount}
                    Example: helm upgrade vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=3.10 --set blockchainUrl=http://127.0.0.1:30545 --set testCount=5
                    Proceed with above step (a) or (b) to run with the updated value
            
            B) With namespace
                a) Without logs
                    helm test {name-of-your-choice} -n {namespace-of-your-choice}
                    Example: helm test vmbc-erc20test -n vmbc-namespace
                    Sample Result:
                        NAME: vmbc-erc20test
                        LAST DEPLOYED: Wed Sep 28 18:04:26 2022
                        NAMESPACE: vmbc-namespace
                        STATUS: deployed
                        REVISION: 1
                        TEST SUITE:     vmbc-erc20test-test
                        Last Started:   Wed Sep 28 18:09:56 2022
                        Last Completed: Wed Sep 28 18:10:17 2022
                        Phase:          Succeeded
                    Note: Above instruction uses default testCount value of 2 or with value set in Step 2->ii->B. To override test count during installtion look for option (C)
            
                b) With logs
                    helm test {name-of-your-choice} --logs -n {namespace-of-your-choice}
                    Example: helm test vmbc-erc20test --logs -n vmbc-namespace
                    Sample Result:
                        NAME: vmbc-erc20test
                        LAST DEPLOYED: Wed Sep 28 18:04:26 2022
                        NAMESPACE: vmbc-namespace
                        STATUS: deployed
                        REVISION: 1
                        TEST SUITE:     vmbc-erc20test-test
                        Last Started:   Wed Sep 28 18:09:56 2022
                        Last Completed: Wed Sep 28 18:10:17 2022
                        Phase:          Succeeded
                        POD LOGS:       vmbc-erc20test-test
                        ======================== 3 passed, 26 warnings in 2.67s ========================
                    Note: Above instruction uses default testCount value of 2 or with value set in Step 2->ii->B. To override test count during installtion look for option (C)
    
                c) Run with updated testCount value
                    helm upgrade {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL} --set testCount={testCount} -n {namespace-of-your-choice}
                    Example: helm upgrade vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=3.10 --set blockchainUrl=http://127.0.0.1:30545 --set testCount=5 -n vmbc-namespace
                    Proceed with above step (a) or (b) to run with the updated value
            
        ii) DECC
            a) Without logs
                helm --kubeconfig <your-kubeconfig-file> test {name-of-your-choice}
                Example: helm --kubeconfig /users/ara-k8s.yaml test vmbc-erc20test
                Sample Result:
                    NAME: vmbc-erc20test
                    LAST DEPLOYED: Wed Sep 28 17:49:01 2022
                    NAMESPACE: default
                    STATUS: deployed
                    REVISION: 1
                    TEST SUITE:     vmbc-erc20test-test
                    Last Started:   Wed Sep 28 17:49:33 2022
                    Last Completed: Wed Sep 28 17:49:52 2022
                    Phase:          Succeeded
                Note: Above instruction uses default testCount value of 2 or with value set in Step 2->i->B. To override test count during installtion look for option (C)
        
            b) With logs
                helm --kubeconfig <your-kubeconfig-file> test {name-of-your-choice} --logs
                Example: helm --kubeconfig /users/ara-k8s.yaml test vmbc-erc20test --logs
                Sample Result:
                    NAME: vmbc-erc20test
                    LAST DEPLOYED: Wed Sep 28 17:49:01 2022
                    NAMESPACE: default
                    STATUS: deployed
                    REVISION: 1
                    TEST SUITE:     vmbc-erc20test-test
                    Last Started:   Wed Sep 28 17:51:24 2022
                    Last Completed: Wed Sep 28 17:51:45 2022
                    Phase:          Succeeded
                    POD LOGS:       vmbc-erc20test-test
                    ======================== 3 passed, 26 warnings in 2.80s ========================
                Note: Above instruction uses default testCount value of 2 or with value set in Step 2->i->B. To override test count during installtion look for option (C)

            c) Run with updated testCount value
                helm --kubeconfig <your-kubeconfig-file> upgrade {name-of-your-choice} . --set global.imageCredentials.registry={registry} --set global.imageCredentials.username={username} --set global.imageCredentials.password={password} --set global.image.tag={tag} --set blockchainUrl={blockchainURL} --set testCount={testCount}
                Example: helm --kubeconfig /users/ara-k8s.yaml upgrade vmbc-erc20test . --set global.imageCredentials.registry=vmwaresaas.jfrog.io --set global.imageCredentials.username=testUsername --set global.imageCredentials.password=testPassword --set global.image.tag=3.10 --set blockchainUrl=http://127.0.0.1:30545 --set testCount=5
                Repeat above step (a) or (b) to run with the updated value
        
    4. Remove vmbc erc20 token transfer test ( optional )
        i) Minikube
            A) Without namespace
                a) Uninstall
                    helm uninstall {name-of-your-choice} && kubectl delete pod {name-of-your-choice}-test
                    Example: helm uninstall vmbc-erc20test && kubectl delete pod vmbc-erc20test-test
    
                b) Verify vmbc erc20 token transfer test is uninstalled
                    helm list                   -> Verify {name-of-your-choice} helm chart is not available
                    Example: helm list          -> Check vmbc-erc20test is not available
    
                c) Verify pod is removed
                    kubectl get pod             -> Verify {name-of-your-choice}-test pod is not available
                    Example: kubectl get pod    -> Check vmbc-erc20test is not available
    
            B) With namespace
                a) Uninstall
                    helm uninstall {name-of-your-choice} -n {your-namespace-name-here} && kubectl delete pod {name-of-your-choice}-test -n {your-namespace-name-here}
                    Example: helm uninstall vmbc-erc20test -n vmbc-namespace && kubectl delete pod vmbc-erc20test-test -n vmbc-namespace
    
                b) Verify vmbc erc20 token transfer test is uninstalled
                    helm list -n {your-namespace-name-here}         -> Verify {name-of-your-choice} helm chart is not available
                    Example: helm list -n vmbc-namespace            -> Check vmbc-erc20test is not available
    
                c) Verify pod is removed
                    kubectl get pod -n {your-namespace-name-here}   -> Verify {name-of-your-choice}-test pod is not available
                    Example: kubectl get pod -n vmbc-namespace      -> Check vmbc-erc20test-test is not available
        
        ii) DECC
            a) Uninstall
                helm --kubeconfig <your-kubeconfig-file> uninstall {name-of-your-choice} && kubectl --kubeconfig <your-kubeconfig-file> delete pod {name-of-your-choice}-test
                Example: helm --kubeconfig /users/ara-k8s.yaml uninstall vmbc-erc20test && kubectl --kubeconfig /users/ara-k8s.yaml delete pod vmbc-erc20test-test

            b) Verify vmbc erc20 token transfer test is uninstalled
                helm --kubeconfig <your-kubeconfig-file> list                   -> Verify {name-of-your-choice} helm chart is not available
                Example: helm --kubeconfig /users/ara-k8s.yaml list             -> Check vmbc-erc20test is not available

            c) Verify pod is removed
                kubectl --kubeconfig <your-kubeconfig-file> get pod             -> Verify {name-of-your-choice}-test pod is not available
                Example: kubectl --kubeconfig /users/ara-k8s.yaml get pod       -> Check vmbc-erc20test is not available