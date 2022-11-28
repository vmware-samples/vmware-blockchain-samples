# (WIP) Privacy

# Scope
This readme is intended for developer consumption. The intend is to harden the configurations for developer regression later add
pipelines to consume aritifacts external by customers. The deployment workflow relies on helm charts and canonical to other VMBC
platform and sample APPs. 

# VMBC UTT Privacy Demo APP
UTT privacy APP demonstrates VMBC ethereum privacy capabilities. This APP can be deployed along with an VMBC deployment with UTT and appropriate configurations enabled. The UTT APP is hosted on their own pods(containers) and independent from VMBC core pods. 
There are four microservice hosted as part of UTT APP - Admin GRPC NodeJS server, Admin CLI, Wallet GRPC NodeJS server and Wallet CLI.

# Setup
Kubernetes cluster:
This deployment is tested on an Ubuntu DEV-VM environment with 16 VCPU and 64G of memory. The base VMBC chain requires descent amount of resources. The resource requirement might vary with desired throughput etc., This workflow is NOT tested on VM-Fusion on MAC. Given the M1 fusion instabilities was not able to dry run on a MAC. Please give a try if curious and share your observations. 

For DEV-VM environment install [Minikube](https://minikube.sigs.k8s.io/docs/start/) with [Docker](https://minikube.sigs.k8s.io/docs/drivers/) as its driver. Since docker compose is the goto ecosystem for development leveraing it canonically. 

Follow the following setup reference from [k8s orchestrator](https://gitlab.eng.vmware.com/blockchain/vmwathena_blockchain/-/blob/master/k8s-orchestrator/DEV_README.md)

[kubectl](https://kubernetes.io/docs/tasks/tools/)
[helm chart](https://helm.sh/docs/intro/install/)
Docker

## How to build containers within minikube scope
```
# To point your shell to minikube's docker-daemon, run:
eval $(minikube docker-env)

once within minikube shell, build your docker images as with regular workflow. 
Eg.,
[UTT build readme reference](https://gitlab.eng.vmware.com/blockchain/vmwathena_blockchain/-/blob/utt/api_imp/privacy-demo/README.md)
cd concord
make build-docker-image
```
## Misc important note
  On minikube setup kubernetes can timeout trying to pull images from artifactory. To avoid this issue, developers can pre-pull images required (or) TAG your current images to satisfy images to get pulled from local docker register.

  Examples for local image pull
  ```
  docker pull blockchain-docker-internal.artifactory.eng.vmware.com/vmwblockchain/clientservice:0.0.0.0.7676
  docker pull blockchain-docker-internal.artifactory.eng.vmware.com/vmwblockchain/ethrpc:0.0.0.0.7676
  ```

  Sample docker TAG to alias images which is a very handy trick:
  The command below tags the locally build concord-core container to required image tags
  ```
  docker tag 7e9a20be56b3 blockchain-docker-internal.artifactory.eng.vmware.com/vmwblockchain/concord-core:0.0.0.0.7676
  ```

### python setup
  pull and tag python as python:3 from harbor repo. Shown below are the sample tags
  ```
  REPOSITORY                                                   TAG              IMAGE ID       CREATED         SIZE
  harbor-repo.vmware.com/dockerhub-proxy-cache/library/python  3                da84e66c3a7c   4 weeks ago     921MB
  python                                                       3                da84e66c3a7c   4 weeks ago     921MB
  ```
# K8S based deployment
Our current plan is to only release pregenerated helm charts with an SDK that customers could leverage. 
For developers this is not a suitable workflow unless they are leveraging a specific release version. In most instances
developers would leverage k8s to evolve and regress their feature developments. The following steps is tailored towards developer focused workflow! 

## 1. Generate helm charts for VMBC 
Helm charts for VMBC deployment is achived using [k8Orchestrator](https://gitlab.eng.vmware.com/blockchain/vmwathena_blockchain/-/tree/master/k8s-orchestrator). Refer to [Readme](https://gitlab.eng.vmware.com/blockchain/vmwathena_blockchain/-/blob/master/k8s-orchestrator/cli/README.md). 
    
1. The most critical step is to establish a canonical **conc_genconfig** to match your development version. The tool could be downloaded from artifactory or docker copied from your concord-core container. For developers would recommend the later to stay canonical to your replica configurations!
```
sudo docker cp d981b8ce79fc:/concord/conc_genconfig ~/
```
The K8sorchestrator is now part of athena repo. So no other clones are required.

2. Build the CLI tool
```
cd vmwathena_blockchain/k8s-orchestrator/cli
mvn -Dcheckstyle.skip -DskipTests clean install
```
3. Add UTT genesis configurations to CLI 
This step would eventually get automated. Do this if the UTT contracts are not yet setup on genesis.json
Add the UTT contract address and BIN generated from docker compose area to the file below.
```
vmwathena_blockchain/k8s-orchestrator/cli/src/main/resources/genesis.json
```
4. Generate helm charts
some env variables on the command below determines what conc_genconfig would get used and where the output helm charts would get generated.
example:
GENCONFIG_BINARY_DIR => path to conc_genconfig tool
OUTPUT_DIR => path where the helm charts would get generated

```
cd vmwathena_blockchain/k8s-orchestrator/
java -Dcastor_gen_config_dir=$GENCONFIG_BINARY_DIR -Dcastor_deployment_type=GENERATE -Dcastor_deployment_platform=K8s -Dcastor_infrastructure_descriptor_location=vmware-blockchain-developer-kit/sample/descriptors/infrastructure.json -Dcastor_deployment_descriptor_location=vmware-blockchain-developer-kit/sample/descriptors/deployment.json -Dcastor_output_directory_location=$OUTPUT_DIR -jar cli/target/k8s-cli-1.0.0-SNAPSHOT.jar com.vmware.blockchain.castor.CastorApplication
```

After the CLI executs successfully, the helm charts get generated with unique ID under OUTPUT_DIR. Use the timestamps or logs from the above command to correlate!

For this readme using a sample reference:
```
~/ethereum/k8s/newout/9f7f32ed-920c-491c-b71c-05b8223d0585/k8s-zone-A
```

## 2. Eable UTT 
This step would eventually get automated or plubmed via values.yaml settings. 
Note: for now permissioning is disabled. 

```
cd ~/ethereum/k8s/newout/9f7f32ed-920c-491c-b71c-05b8223d0585/k8s-zone-A
find . -type f -exec sed -i 's/eth_permissioning_write_enabled: true/eth_permissioning_write_enabled: false/g' {} +
find . -type f -exec sed -i '/eth_enable: true/a utt_enabled: true' {} +
find . -type f -exec sed -i 's/consensus_batching_policy: 0/consensus_batching_policy: 2/g' {} +
```

## 3. Finally DEPLOY....
The following command would deploy the helm chart onto the minkube.
```
cd ~/ethereum/k8s/newout/9f7f32ed-920c-491c-b71c-05b8223d0585/k8s-zone-A
helm --set global.image.tag="0.0.0.0.7676" --set permissioning.ethPermissioningWriteEnabled=false --set resources.replica.memoryRequest=2000Mi --set resources.replica.memoryLimit=2000Mi install  vmbc-test .
```
The above command provides more memory for replicas which was correlated to recent concord updates!

If you run into errors you can leverage debug or dry run for insights!
```
helm --set global.image.tag="0.0.0.0.7676" --set permissioning.ethPermissioningWriteEnabled=false --set resources.replica.memoryRequest=2000Mi --set resources.replica.memoryLimit=2000Mi install --debug --dry-run vmbc-test .
```

## 4. Verify deployment
Helm list provides hints to what is deployed
```
helm list
NAME          	NAMESPACE	REVISION	UPDATED                                	STATUS  	CHART                    	APP VERSION
vmbc-test     	default  	1       	2022-11-07 16:51:53.127050453 +0000 UTC	deployed	vmbc-0.1.0               	1.16.0
vmbc-utt-admin	default  	1       	2022-11-07 17:42:06.273461902 +0000 UTC	deployed	vmbc-utt-wallet-app-0.1.0	1.16.0
```

Minikube service list indicates service ports exposed
```
minikube service list
| default              | client-0-ethrpc           | 8545/8545    | http://192.168.49.2:30744 |
```
Check if the port is open after some timewindow (for cluster to come up).
```
nc -v 192.168.49.2 30744
```

Check the pod status:
```
kubectl get pods
NAME                                                      READY   STATUS    RESTARTS   AGE
vmbc-deployment-client-0-clientservice-5766975db4-zbpdk   1/1     Running   0          23h
vmbc-deployment-client-0-ethrpc-9b569f75b-7hfmq           1/1     Running   0          23h
vmbc-deployment-replica-0-concord-5d7c7f5dcf-dttl9        1/1     Running   0          23h
vmbc-deployment-replica-1-concord-ddb7c88d6-46szm         1/1     Running   0          23h
vmbc-deployment-replica-2-concord-544fcc5c89-sxlt5        1/1     Running   0          23h
vmbc-deployment-replica-3-concord-6cc75d5b64-jshgb        1/1     Running   0          23h
vmbc-deployment-utt-admin-69c6494bb5-vvpzr                2/2     Running   0          22h
vmbc-utt-wallet-service-0                                 2/2     Running   0          22h
vmbc-utt-wallet-service-1                                 2/2     Running   0          22h
```

If you run into errors like OOM it would get indicated on the status. Always leverage logs for insights similar to docker containers
```
kubectl logs -f vmbc-deployment-replica-0-concord-5d7c7f5dcf-dttl9
```

After the replicas are up invoke a ETH-RPC command to sanity check end to end
```
 curl -X POST --data '{"jsonrpc":"2.0","method":"eth_gasPrice","id":1}' --header "Content-Type: application/json" http://192.168.49.2:30744
{"id":1,"jsonrpc":"2.0","method":"eth_gasPrice","result":"0x0"}
```
** Congrats! ** you have successfully deployed VMBC on K8S cluster.
If you had to only leverage SDK you would only invoke the helm deployment and verification steps! So dont sweat...

# UTT APP deployment
## 1. Deploy the UTT microservices
The UTT APPs are build using docker images from privacy demo source path. Unlike VMBC there are no CLI generation work flow. The helm charts are prebaked and you can generate them using approriate settings on values.yaml.

```
cd vmwathena_blockchain/privacy-demo/k8s/helm-chart
helm install --set blockchainUrl="http://192.168.49.2:30744"  vmbc-utt-admin .
```
Note: the URL would correlate to the VMBC client-0-ethrpc service URL.

Verify if all UTT pods are running. Check logs for sanity.

## 2. Attach to UTT admin CLI and deploy UTT contracts
```
kubectl attach vmbc-deployment-utt-admin-69c6494bb5-vvpzr -c utt-admin-cli -i -t

After pressing ENTER, CLI prompt shows up.
Invoke "deploy"

> deploy
Deploying a new privacy application...

Successfully deployed privacy application
---------------------------------------------------
Privacy contract: 0x44f95010BA6441E9C50c4f790542A44A2CDC1281
Token contract: 0x3d8b57c2D58BB8c8E36626B05fF03381734EAD43

You are now ready to configure wallets.

Enter command (type 'h' for commands 'Ctr-D' to quit):
```
You can detach from the CLI using 
```
Ctrl + p Ctrl + q keys
```
Detach would leave the pods running. Ctrl + D would kill the CLI and resetart it. Detach is the preferred approach for now.

## 3. Attach to UTT wallet CLI, config, register, mint, transfer etc.,
Note: currently there are baked sets of user names (user-1, user-2, user-3). The POD index + 1 correlates to user names.
Eg., 
vmbc-utt-wallet-service-0 => user-1
vmbc-utt-wallet-service-1 => user-2
If not clear, check the pod logs to cross check the user ids
Example:
```
kubectl logs vmbc-utt-wallet-service-0 -c utt-wallet-cli
Connected to grpc server localhost:49001 !!
Pod name: vmbc-utt-wallet-service-0..
Ordinal index 0
My user name: user-1
```

** Attach and playaround with WALLET CLI: **
```
kubectl attach  vmbc-utt-wallet-service-0 -c utt-wallet-cli -i -t
If you don't see a command prompt, try pressing enter.

You must first configure the wallet. Use the 'config' command.

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > h

Commands:
config                    -- configures wallets with the privacy application.
show                      -- prints information about the user managed by this wallet
register <user-id>        -- requests user registration required for spending coins
create-budget                   -- requests creation of a privacy budget, the amount is decided by the system.
mint <amount>             -- mint the requested amount of public funds.
transfer <amount> <to-user-id> -- transfers the specified amount between users.
burn <amount>             -- burns the specified amount of private funds to public funds.


Enter command (type 'h' for commands 'Ctr-D' to quit):
 > config

Successfully configured privacy application
---------------------------------------------------
Privacy contract: 0x44f95010BA6441E9C50c4f790542A44A2CDC1281
Token contract: 0x3d8b57c2D58BB8c8E36626B05fF03381734EAD43

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > register
Successfully registered user.

Synchronizing state... Ok. (Last known tx number: 0)
--------- user-1 ---------
Public balance: 10000
Private balance: 0
Privacy budget: 0
Last executed tx number: 0

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > create-budget
Successfully created budget with value 10000

Synchronizing state... Ok. (Last known tx number: 0)
--------- user-1 ---------
Public balance: 10000
Private balance: 0
Privacy budget: 10000
Last executed tx number: 0

Enter command (type 'h' for commands 'Ctr-D' to quit):
 > mint 1000

Successfully sent mint tx. Last added tx number:2
Synchronizing state... Ok. (Last known tx number: 2)

Synchronizing state... Ok. (Last known tx number: 2)
--------- user-1 ---------
Public balance: 9000
Private balance: 1000
Privacy budget: 10000
Last executed tx number: 2

Enter command (type 'h' for commands 'Ctr-D' to quit):
```

## 4. Attach to different wallet CLI and test transfers

Attach to other wallet CLI pods and invoke transfer of UTT tokens and cross check balances. 

# K8S teardown/uninstallation
Use helm charts to uninstall a deployment.
UTT uninstall
```
cd /vmwathena_blockchain/privacy-demo/k8s/helm-chart
helm uninstall --debug vmbc-utt-admin
```

VMBC tear down:
```
cd ~/ethereum/k8s/newout/9f7f32ed-920c-491c-b71c-05b8223d0585/k8s-zone-A
helm uninstall vmbc-test
```