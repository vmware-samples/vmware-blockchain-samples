VMBC Internal Deployment ( Developer Mode )

    1. Deploy minikube
        To start minikube
            cd minikube 
            ./minikube-start.sh 
    2. Deploy VMBC on minikube  
        To Build and launch VMBC components
            cd vmbc/script 
            ./k8s-launch.sh internal
        To destroy VMBC components
            cd vmbc/script
            ./k8s-destroy.sh
    3. To destroy minikube itself ( optional )
        cd minikube
        ./minikube-delete.sh

VMBC External Deployment ( Customer Mode )
    Deploy VMBC on existing minikube using orchestrator
        To Create Blockchain
            cd vmbc/script
            python3 orchestrator.py --create
        To Delete last created Blockchain
            cd vmbc/script
            python3 orchestrator.py --delete
        To Delete Blockchain for the given blockchainID
            cd vmbc/script
            python3 orchestrator.py --delete blockchainID
            eg: python3 orchestrator.py --delete vmbc-747759c9-2afa-489c-b4ea-ea3fda8d392b

Common Components deployment ( Internal & External )
    Deploy DAPP
        To launch dapp
            cd dapp
            ./k8s-dapp-launch.sh
        To Destroy dapp
            cd dapp
            ./k8s-dapp-destroy.sh
        To get URL
            minikube service erc20-swap --url --namespace vmbc
    Deploy Explorer
        To launch explorer
            cd explorer
            ./k8s-explorer-launch.sh
        To Destroy explorer
            cd explorer
            ./k8s-explorer-destroy.sh
        To get URL
            minikube service vmbc-explorer --url --namespace vmbc
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
