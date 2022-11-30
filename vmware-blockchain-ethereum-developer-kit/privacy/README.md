# Introduction
The base VMBC would be deployed on a kubernetes cluster leveraging helm charts.
The privacy application will be deployed along side with the VMBC deployment leveraging the ETHRPC service provided. 

The following sections brief on the deployment process and associated workflow to try out privacy capabilities. 

# TODO List:
- [ ] Fix links for reference VMBC Readme
- [ ] Fix links for values.yaml based on final location
- [ ] Fix release verion

# Kubernetes deployment overview
TODO - Fixme insert SVG

## Prerequisite
The privacy app requires write and read permissioning features to get disabled!

## How to deploy privacy application
Deployment leverages the helm charts provided with the development kit for privacy application.

### Determine the required settings for helm chart installation

The following settings are required for deployment. Refer to **"values.yaml"** (@TODO - add link) file under helm chart path. Several settings are assigned to predetermined default values and users would only require to set few mandatory settings.

| Mandatory Settings      | Remarks       |  Sample  |
| ------------- | ------------- | ------------- |
| blockchainUrl | URL for ETH-RPC service. Determined from the VMBC deployments exposed service. | `blockchainUrl="http://192.168.59.102:30646"`  |

The ethRPC service port and their liveness could be determined as following:
```sh
demo>kubectl get pods
NAME                                                      READY   STATUS    RESTARTS   AGE
vmbc-deployment-client-0-clientservice-6989f74f7c-qd58b   1/1     Running   0          10m
vmbc-deployment-client-0-ethrpc-568cb77fd7-gs8z7          1/1     Running   0          10m
vmbc-deployment-replica-0-concord-7657689754-qcfpw        1/1     Running   0          10m
vmbc-deployment-replica-1-concord-7ddf6f5b4f-jhq6s        1/1     Running   0          10m
vmbc-deployment-replica-2-concord-6cb4b8dc7d-q8qgg        1/1     Running   0          10m
vmbc-deployment-replica-3-concord-758f8496d-9s7n6         1/1     Running   0          10m

demo>minikube service list
|-------------|-----------------|--------------|-----------------------------|
|  NAMESPACE  |      NAME       | TARGET PORT  |             URL             |
|-------------|-----------------|--------------|-----------------------------|
| default     | client-0        | No node port |
| default     | client-0-ethrpc | 8545/8545    | http://192.168.59.102:30646 |
|             |                 | 9000/9000    | http://192.168.59.102:32278 |
| default     | kubernetes      | No node port |
| default     | replica-0       | No node port |
| default     | replica-1       | No node port |
| default     | replica-2       | No node port |
| default     | replica-3       | No node port |
| kube-system | kube-dns        | No node port |
| kube-system | metrics-server  | No node port |
|-------------|-----------------|--------------|-----------------------------|

demo> nc -v 192.168.59.102 30646
Connection to 192.168.59.102 30646 port [tcp/*] succeeded!
 
Verify a ETHRPC API:
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_gasPrice","id":1}' --header "Content-Type: application/json" http://192.168.59.102:30646
{"id":1,"jsonrpc":"2.0","method":"eth_gasPrice","result":"0x0"}
```

Image settings:
The registry settings are similar to VMBC deployment.
Setup required paths for the image register, repository, tags, credentails etc., 

Eg.,
```sh
--set global.image.tag="0.0.0.0.7833" 
--set privacyWalletApp.image.tag="0.0.0.0.7833"
```

Container resource settings:
There are default settings tuned for current consumption. You can scale up values if required.

Resource names (Refer to values.yaml): 
```sh
walletapp, walletcli, admin, admincli.
```
All resources comprise of settings for CPU and Memory based on units as defined by kubernetes.
Eg.,
```sh
    cpuLimit: 800m
    cpuRequest: 700m
    memoryLimit: 500Mi
    memoryRequest: 400Mi

 --set resources.walletapp.cpuLimit=900m --set resources.walletapp.memoryLimit=550Mi
 ```

### helm chart installation
```sh
helm install --set global.image.tag="0.0.0.0.7833" --set blockchainUrl="http://192.168.59.102:30646"  vmbc-privacy-app-deployment .
NAME: vmbc-privacy-app-deployment
LAST DEPLOYED: ....
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
 
kubectl get pods
NAME                                                      READY   STATUS    RESTARTS   AGE
vmbc-deployment-client-0-clientservice-6989f74f7c-qd58b   1/1     Running   0          25m
vmbc-deployment-client-0-ethrpc-568cb77fd7-gs8z7          1/1     Running   0          25m
vmbc-deployment-privacy-admin-7b66f9f7df-xzpkl            2/2     Running   0          11m
vmbc-deployment-privacy-wallet-0                          2/2     Running   0          11m
vmbc-deployment-privacy-wallet-1                          2/2     Running   0          11m
vmbc-deployment-privacy-wallet-2                          2/2     Running   0          11m
vmbc-deployment-replica-0-concord-7657689754-qcfpw        1/1     Running   0          25m
vmbc-deployment-replica-1-concord-7ddf6f5b4f-jhq6s        1/1     Running   0          25m
vmbc-deployment-replica-2-concord-6cb4b8dc7d-q8qgg        1/1     Running   0          25m
vmbc-deployment-replica-3-concord-758f8496d-9s7n6         1/1     Running   0          25m
 
helm list
NAME                        	NAMESPACE	REVISION	UPDATED                                	STATUS  	CHART                                   	APP VERSION
vmbc-privacy-app-deployment 	default  	1       	***UTC	deployed	vmbc-privacy-wallet-app-deployment-0.1.0	1.16.0
vmbc-privacy-test-deployment	default  	1       	***UTC	deployed	vmbc-0.1.0                              	1.16.0
```

## Privacy application demonstration
The following operations are demonstrated by the privacy application:

Client Adminstrator application:
- Deploys the privacy application
- Creates privacy budgets for users

Client Wallet applicaiton:
- Configures and registers the user wallet.
- Converts public funds to private funds for anonymous transfer.
- Performs private anonymous transaction to another registered user.
- Performs public transaction to another registered user.
- Converts private funds to public funds.

The demonstration client wallet applications have canned private keys and initial public balances. 

Administrator application CLI samples to deploy the privacy application and create privacy budgets for all users:
```sh
kubectl attach vmbc-deployment-privacy-admin-7b66f9f7df-xzpkl -c privacy-admin-cli -i -t
If you don't see a command prompt, try pressing enter.

You must first deploy the privacy application. Use the 'deploy' command.

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > h

Commands:
deploy -- generates a privacy config and deploys the privacy and token contracts.
create-budget <user-id> <amount> -- requests creation of a privacy budget for a user.

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > deploy
Deploying a new privacy application...

Successfully deployed privacy application
---------------------------------------------------
Privacy contract: 0x44f95010BA6441E9C50c4f790542A44A2CDC1281
Token contract: 0x3d8b57c2D58BB8c8E36626B05fF03381734EAD43

You are now ready to configure wallets.

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > create-budget user-1 1000
Budget request for user: user-1 value: 1000 was sent to the privacy app
response: ok

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > create-budget user-2 1000
Budget request for user: user-2 value: 1000 was sent to the privacy app
response: ok

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > create-budget user-3 1000
Budget request for user: user-3 value: 1000 was sent to the privacy app
response: ok

Enter command (type 'h' for commands 'Ctr-D' to quit):
 >
```

Wallet application CLI workflow samples:
- Converts privacy funds from public funds
- Transfers private funds anonoymously to user-2
- Transfers public funds transparently to user-2
- Receives private funds anonymously from user-2
- Converts privacy funds back to public funds

[WORK IN PROGRESS]
User-1 Sample:
```sh
 kubectl attach vmbc-deployment-privacy-wallet-0 -c privacy-wallet-cli -i -t
If you don't see a command prompt, try pressing enter.

You must first configure the wallet. Use the 'config' command.

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > h

Commands:
config                    -- configures wallets with the privacy application.
show                      -- prints information about the user managed by this wallet.
register <user-id>        -- requests user registration required for spending coins.
convertPublicToPrivate <amount>             -- converts the specified amount of public funds to private funds.
transfer <amount> <to-user-id> -- transfers the specified amount between users.
public-transfer <amount> <to-user-id> -- transfers the specified amount of public funds between users.
convertPrivateToPublic <amount>             -- converts the specified amount of private funds to public funds.


Enter command (type 'h' for commands 'Ctr-D' to quit):
 > config

Successfully configured privacy application
---------------------------------------------------
Privacy contract: 0x44f95010BA6441E9C50c4f790542A44A2CDC1281
Token contract: 0x3d8b57c2D58BB8c8E36626B05fF03381734EAD43

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > register
Successfully registered user.

Synchronizing state...
Failed to get last added tx number:
Ok. (Last known tx number: 0)
--------- user-1 ---------
Public balance: 10000
Private balance: 0
Privacy budget: 1000
Last executed tx number: 0

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > public-transfer 75 user-2
Processing public transfer of 75 to user-2...


Synchronizing state...
Ok. (Last known tx number: 0)
--------- user-1 ---------
Public balance: 9925
Private balance: 0
Privacy budget: 1000
Last executed tx number: 0

Enter command (type 'h' for commands 'Ctr-D' to quit):

============================================
=== Receive 25 public funds from user-2 ====
============================================
 > show

Synchronizing state...
Ok. (Last known tx number: 0)
--------- user-1 ---------
Public balance: 9950
Private balance: 0
Privacy budget: 1000
Last executed tx number: 0

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > convertPublicToPrivate 200
Successfully sent mint tx. Last added tx number:1
Synchronizing state...
Ok. (Last known tx number: 1)

Synchronizing state...
Ok. (Last known tx number: 1)
--------- user-1 ---------
Public balance: 9750
Private balance: 200
Privacy budget: 1000
Last executed tx number: 1

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > transfer 99 user-2
Processing an anonymous transfer of 99 to user-2...
Successfully sent transfer tx. Last added tx number:2
Synchronizing state...
Ok. (Last known tx number: 2)
Anonymous transfer done.

Synchronizing state...
Ok. (Last known tx number: 2)
--------- user-1 ---------
Public balance: 9750
Private balance: 101
Privacy budget: 901
Last executed tx number: 2

Enter command (type 'h' for commands 'Ctr-D' to quit):

============================================
=== Receive 44 private funds from user-2 ===
============================================
 > show

Synchronizing state...
Ok. (Last known tx number: 3)
--------- user-1 ---------
Public balance: 9750
Private balance: 145
Privacy budget: 901
Last executed tx number: 3

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > convertPrivateToPublic 35
Processing a burn operation for 35...
Successfully sent self-transfer tx as part of burn. Last added tx number:4
Synchronizing state...
Ok. (Last known tx number: 4)
Successfully sent burn tx. Last added tx number:5
Synchronizing state...
Ok. (Last known tx number: 5)
Burn operation done.

Synchronizing state...
Ok. (Last known tx number: 5)
--------- user-1 ---------
Public balance: 9785
Private balance: 110
Privacy budget: 901
Last executed tx number: 5

Enter command (type 'h' for commands 'Ctr-D' to quit):
 >
```

User-2 Sample:
```sh
kubectl attach vmbc-deployment-privacy-wallet-1 -c privacy-wallet-cli -i -t
If you don't see a command prompt, try pressing enter.

You must first configure the wallet. Use the 'config' command.

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > config

Successfully configured privacy application
---------------------------------------------------
Privacy contract: 0x44f95010BA6441E9C50c4f790542A44A2CDC1281
Token contract: 0x3d8b57c2D58BB8c8E36626B05fF03381734EAD43

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > register
Successfully registered user.

Synchronizing state...
Ok. (Last known tx number: 0)
--------- user-2 ---------
Public balance: 10000
Private balance: 0
Privacy budget: 1000
Last executed tx number: 0

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > show

Synchronizing state...
Ok. (Last known tx number: 0)
--------- user-2 ---------
Public balance: 10075
Private balance: 0
Privacy budget: 1000
Last executed tx number: 0

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > public-transfer 25 user-1
Processing public transfer of 25 to user-1...


Synchronizing state...
Ok. (Last known tx number: 0)
--------- user-2 ---------
Public balance: 10050
Private balance: 0
Privacy budget: 1000
Last executed tx number: 0

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > show

Synchronizing state...
Failed to get signed tx with number 1:
--------- user-2 ---------
Public balance: 10050
Private balance: 0
Privacy budget: 1000
Last executed tx number: 0

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > show

Synchronizing state...
Ok. (Last known tx number: 2)
--------- user-2 ---------
Public balance: 10050
Private balance: 99
Privacy budget: 1000
Last executed tx number: 2

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > transfer 44 user-1
```
