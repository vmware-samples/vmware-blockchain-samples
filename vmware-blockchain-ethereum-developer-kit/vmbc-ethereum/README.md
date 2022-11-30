# VMware Blockchain Ethereum Provisioning on Kubernetes

VMWare Blockchain can be deployed on Kubernetes using Helm based deployment on choice of your platform. This folder contains sample helm charts running a specific version of VMWare Blockchain code for the following:
- Four node one client deployment on choice of your platform (Minikube, AWS EKS) without logging enabled.
- Four node one client deployment on Minikube with logging enabled and instructions to install and use ELK helm charts (bitnami) with VMWare Blockchain.
- vmbc-explorer helm charts which can be installed and linked to an existing blockchain to visually view transaction progress on interactive UI.
- sample dapps includes helm charts that can be installed to deploy multiple sample dapps to execute on existing blockchain.
- erc20 test tool includes helm charts that can be installed to run transactions on existing blockchain.

## Usage
- Step 1 : Deploy sample blockchain
   Navigate to $PWD/vmbc-four-node-one-client-deployment and follow steps from README to deploy sample four node one client blockchain on choice of your host.
   Optional: You can also deploy a blockchain with logging enabled.
             Navigate to $PWD/vmbc-four-node-one-client-deployment-with-logging and follow steps from README.

- Step 2 : Visualize your blockchain activities
   Navigate to $PWD/vmbc-explorer and follow steps from README to deploy vmbc-explorer against your deployed blockchain to view transaction progress.

- Step 3 : (optional) Run sample dapp
   Navigate to $PWD/sample-dapps and follow steps from README to deploy erc20-swap or Artemis dapp on to your deployed blockchain. You can view progress in vmbc-explorer deployed above.

- Step 4 : (optional) Run sample test - erc20 test
   Navigate to $PWD/erc20-test-tool and follow steps from README to deploy erc20 test tool on to your deployed blockchain.
