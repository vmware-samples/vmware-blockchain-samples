# VMBC K8s Orchestrator service

THIS IS AN IN-PROGRESS PROJECT

VMBC k8s Orchestrator is a self service orchestration platform for creation of VMWare Blockchain helm charts with desired configurations.

## Prerequisites

Install the following:

kubectl ( https://kubernetes.io/docs/tasks/tools/ )
helm chart ( https://helm.sh/docs/intro/install/ )
Minikube (https://minikube.sigs.k8s.io/docs/start/)
(Optional) HTTPIE (https://httpie.io/docs/cli/main-features)

## Deploy K8s Orchestrator

```
helm install orch . --set global.imageCredentials.registry=<registry> --set global.imageCredentials.username=<username> --set global.imageCredentials.password=<password>
```

## Generate VMBC Helm Charts

### Create descriptors with desired configurations
Create a folder of your choice and place the following in descriptors in it.
- Deployment descriptor (lets say /path-to-folder-of-your-choice/deployment.json)
- Infrastructure descriptor (lets say /path-to-folder-of-your-choice/infrastructure.json)
  
See (TODO) for details on how to write your descriptors.

### Get API URL

Run the below command to fetch url for API 
```
minikube service list
```

### Generate and download VMWare Blockchain helm charts

Assuming you have HTTPIE installed, run the below command
```
http --download GET http://<url>/api/v1/charts infraDescriptor:=@/<path-to-folder-of-your-choice/infrastructure.json> deploymentDescriptor:=@/<path-to-folder-of-your-choice/descriptors/deployment.json>
```

Alternately, you can also provide the entire json files for both the descriptors to the command.

The zip file containing the helm charts will be downloaded to your current directory. Please see file name starting with "vmbc-". Unzip the folder and you are ready to install the blockchain.

See (TODO) to install and use the blockchain. 
