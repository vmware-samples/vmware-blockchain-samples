# Getting started
We need a Kubernetes environment to deploy. You could use a remote cluster or locally with minikube (tested with minikube v1.25.2)

Before you start, please send an email to ask_VMware_blockchain@VMware.com to get JFROG_PASSWORD. This will be required in next steps.

# k8s environment
Install minikube (https://minikube.sigs.k8s.io/docs/start/) and
```
minikube start
```

Install [`kubectl`](https://kubernetes.io/docs/tasks/tools/) to interact and you can also use a tool like [Lens](https://k8slens.dev/).

Some additional useful utilities to have are `watch` and `kubectx`

Set the 
```
export JFROG_PASSWORD=<secret>
```

# VMBC Deployment

Clone this repo and `cd vmbc/script`. All subsequent commands are at this location.

Make sure your kube config is pointed to minikube (eg: use `kubectx`). Deploy VMBC with:
```
./k8s-launch.sh
```

This will end with something like
```
MINIKUBE_IP=172.16.143.128
MINIKUBE_PORT=30545
VMBC_URL=http://172.16.143.128:30545
```

You can use Lens or `watch -n0.1 kubectl get pods --all-namespaces -o wide` to see progress as containers come up. Four namespaces are created, each with 1 pod of the concord replica network. Additionally one namespace is created for the client.
        
To test VMBC 
```
./runTest.sh
```
This deploys a erc20test container in the client namespace. Watch the logs with `kubectl log` 
```
kubectl logs <erc20test-xxxx> --n vmbc-client1 
```

To destroy VMBC components (do this when you are all done)
```
./k8s-destroy.sh
```

# Additional Common Components
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
