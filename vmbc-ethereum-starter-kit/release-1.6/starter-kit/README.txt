Host system pre-requisites
    Docker version 18.06.1-ce, build e68fc7a or above
    minikube v1.24.0 or more
    VirtualBox 5.2 or later ( only for OSX )
    kubectl alias ( https://minikube.sigs.k8s.io/docs/handbook/kubectl/ )

VMBC Deployment

    1. Deploy minikube
        To start minikube
            cd minikube 
            ./minikube-start.sh 
    2. Deploy VMBC on minikube  
        To Build and launch VMBC components
            cd vmbc/script 
            ./k8s-launch.sh

        Check all the PoDs are running (try below command in new terminal)
            watch -n0.01 kubectl get pods --all-namespaces -o wide
        
        To test VMBC 
            cd vmbc/script
            ./runTest.sh
            Check the PoD log for test results, eg: kubectl logs erc20test-969fb7657-4v5px --namespace vmbc-client1 

        To destroy VMBC components
            cd vmbc/script
            ./k8s-destroy.sh
    3. To destroy minikube itself ( optional )
        cd minikube
        ./minikube-delete.sh

Common Components deployment 
    Deploy DAPP
        To launch dapp
            cd dapp
            ./k8s-dapp-launch.sh
        To Destroy dapp
            cd dapp
            ./k8s-dapp-destroy.sh
        To get URL
            minikube service erc20-swap --url --namespace vmbc-dapp
    Deploy Explorer
        To launch explorer
            cd explorer
            ./k8s-explorer-launch.sh
        To Destroy explorer
            cd explorer
            ./k8s-explorer-destroy.sh
        To get URL
            minikube service vmbc-explorer --url --namespace vmbc-explorer
    Deploy ELK stack
        To launch elasticsearch
            cd elk
            ./elk-elastic-launch.sh ; ( make sure that elasticsearch is working before moving further )
        To launch kibana
            cd elk
            ./elk-kibana-launch.sh ; ( make sure that kibana is working before moving further )
        To launch fluentd
            cd elk
            ./elk-fluentd-lanch.sh
            Once all 3 PoDs are up and if you can launch Kibana successfully then you can add 'index' so that you can view all the logs which are matching with your 'index' pattern.
        To Destroy ELK stack
            cd elk
            ./elk-destroy.sh
