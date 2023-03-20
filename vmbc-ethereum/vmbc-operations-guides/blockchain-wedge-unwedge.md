# VMware Blockchain Wedge/Unwedge Guide
The wedge command stops the committers from processing new write requests. This means that after a wedge, the system is still working and can answer read requests, but the state will not be changed anymore. It thus means no write requests can be executed, including reconfiguration requests.
## Prerequisites
- You must have a blockchain deployed with operator. Please see [vmbc deployment](../vmbc-deployment/vmbc-k8s-orchestrator-tool) for details on how to generate charts and deploy blockchain with operator.
- You must have exactly one operator per zone/cluster.
- All operators should have the same public key it is deployed with.
- You must have the operator private key with you.
## Using the operator
### Upgrade blockchain with operator functional
```
helm upgrade <name of blockchain installation> <path to blockchain helm charts> --set operator.install=true --reuse-values
```
sample:
```
helm upgrade vmbc-test-2 . --set operator.install=true --reuse-values
Release "vmbc-test-2" has been upgraded. Happy Helming!
NAME: vmbc-test-2
LAST DEPLOYED: Thu Mar 16 11:33:36 2023
NAMESPACE: default
STATUS: deployed
REVISION: 2
TEST SUITE: None
```
### Check revision history
```
helm history <name of blockchain installation>
```
sample:
```
helm history vmbc-test-2
REVISION	UPDATED                 	STATUS    	CHART     	APP VERSION	DESCRIPTION     
1       	Thu Mar 16 11:17:06 2023	superseded	vmbc-0.1.0	1.16.0     	Install complete
2       	Thu Mar 16 11:33:36 2023	deployed  	vmbc-0.1.0	1.16.0     	Upgrade complete
```
### Enter the operator pod
#### Get pod name
```
kubectl get pods
```
sample:
```
kubectl get pods
NAME                                                      READY   STATUS    RESTARTS   AGE
vmbc-deployment-client-0-clientservice-57f895798d-kvhtp   1/1     Running   0          4m3s
vmbc-deployment-client-0-cre-6c447bb8ff-q77n9             1/1     Running   0          4m3s
vmbc-deployment-client-0-ethrpc-596dbf9488-krp7x          1/1     Running   0          4m3s
vmbc-deployment-client-1-clientservice-55d75c6ccb-vzqtg   1/1     Running   0          4m4s
vmbc-deployment-client-1-cre-5c8df9bf56-sbvgc             1/1     Running   0          4m4s
vmbc-deployment-client-1-ethrpc-7568989c87-mtnvn          1/1     Running   0          4m4s
vmbc-deployment-operator-0-operator-5496c96cfb-jsrph      1/1     Running   0          16s
vmbc-deployment-replica-0-concord-644b6f7c-shlf7          1/1     Running   0          4m4s
vmbc-deployment-replica-1-concord-6655cddd4d-9zr94        1/1     Running   0          4m3s
vmbc-deployment-replica-2-concord-649d85c9d9-xptsx        1/1     Running   0          4m3s
vmbc-deployment-replica-3-concord-57745996-m7m2l          1/1     Running   0          4m4s
```
copy the pod name with "operator" keyword in it.
#### Exec into the operator pod
```
kubectl exec -it <copied pod name from above> -- bash
```
sample:
```
kubectl exec -it vmbc-deployment-operator-0-operator-5496c96cfb-jsrph -- bash
Defaulted container "operator-0-operator" out of: operator-0-operator, init-container (init)
root@vmbc-deployment-operator-0-operator-5496c96cfb-jsrph:/operator#
```
Make sure you are in "/operator" directory.
#### Set operator identity private key
At this point, you must have the private key for the public key with which operator was installed.
Copy contents of the private key. Lets call it op-pvt-key for rest of the document.
##### Set using API
```
./concop set-private-key --key "<op-pvt-key>"
 ```
sample:
```
root@vmbc-deployment-operator-0-operator-5496c96cfb-jsrph:/operator# ./concop set-private-key --key "-----BEGIN PRIVATE KEY-----"$'\n'"MC4CAQAwBQYDK2VwBCIEIDgJex+/6ebjoiSTPVvU63Yr6ypF7kITPpVJeKHsio4R"$'\n'"-----END PRIVATE KEY-----"
{"succ":true}
```
##### Set using curl
```
curl -X PUT --data '{"key":"<op-pvt-key>"}' --header "Content-Type: application/json" 
```
#### Wedge the blockchain
```
./concop wedge stop
```
sample:
```
root@vmbc-deployment-operator-0-operator-5496c96cfb-jsrph:/operator# ./concop wedge stop
{"succ":true}
```
The result of the above command is a simple indicator "true" which means that the request has been received and passed consensus, **but the replicas have not necessarily got to the wedge point yet**.
#### Check wedge status
```
./concop wedge status
```
sample:
```
root@vmbc-deployment-operator-0-operator-5496c96cfb-jsrph:/operator# ./concop wedge status
{"replica-0":true,"replica-1":true,"replica-2":true,"replica-3":true}
```
The result may be either true, false or some error per replica. "true" means that the replica has reached the wedge point, "false" means that it didn't.
#### Wedge status with --bft flag
```
./concop wedge status --bft
```
sample:
```
root@vmbc-deployment-operator-0-operator-5496c96cfb-jsrph:/operator# ./concop wedge status --bft
{"replica-0":true,"replica-1":true,"replica-2":true,"replica-3":true}
```
Here --bft to support n-f wedge. With --bft flag it won't wait for n/n consensus and only for n-f consensus.
#### Unwedge the blockchain
The unwedge command tells the committers to resume processing new write requests after being stopped with 'wedge'. It is meant to be used at the end of a reconfiguration workflow that starts with 'wedge'.

Note: If you wedge the system and then restart the pods, the system will remain wedged. Unwedge must be executed to resume the system.\
To initiate unwedge run:
```
./concop unwedge
```
sample:
```
root@vmbc-deployment-operator-0-operator-5496c96cfb-jsrph:/operator# ./concop unwedge
{"succ":true}
root@vmbc-deployment-operator-0-operator-5496c96cfb-jsrph:/operator# ./concop wedge status
{"replica-0":false,"replica-1":false,"replica-2":false,"replica-3":"Timeout for request sequence number: 7042222448447586304, and correlation id: operator-wedge-status-command-7042222448447586304"}
```
The result of the above command is a simple indicator "true" which means that the command has been received and executed by n/n or n-f/n replicas (depending on the --bft flag).
Note: For cases if there is a message for "Timeout" it means some past operation is still in progress.
#### Unwedge with --bft flag
```
./concop unwedge --bft
```
Here --bft # to support n-f wedge. With --bft flag it won't wait for n/n consensus and only for n-f consensus.

### Revision rollback
Once "operator" operations are completed then rollback to previous revision using below command. These steps are needed to protect the operator identity private key from getting exposed.
```
helm rollback <name of blockchain installation>
```
sample:
```
helm rollback vmbc-test-2
Rollback was a success! Happy Helming!
```
Verify the helm revision history and make sure to rollback to the version without operator pod.
```
helm history <name of blockchain installation>
```
sample:
```
helm history vmbc-test-2
REVISION	UPDATED                 	STATUS    	CHART     	APP VERSION	DESCRIPTION     
1       	Thu Mar 16 11:45:59 2023	superseded	vmbc-0.1.0	1.16.0     	Install complete
2       	Thu Mar 16 11:49:45 2023	superseded	vmbc-0.1.0	1.16.0     	Upgrade complete
3       	Thu Mar 16 13:00:04 2023	deployed  	vmbc-0.1.0	1.16.0     	Rollback to 1 
```
Verify the operator pod is no longer exists.
```
kubectl get pods
```
sample:
```
kubectl get pods
NAME                                                      READY   STATUS    RESTARTS   AGE
vmbc-deployment-client-0-clientservice-57f895798d-gw69n   1/1     Running   0          25m
vmbc-deployment-client-0-cre-6c447bb8ff-q77n9             1/1     Running   0          75m
vmbc-deployment-client-0-ethrpc-596dbf9488-krp7x          1/1     Running   0          75m
vmbc-deployment-client-1-clientservice-55d75c6ccb-vzqtg   1/1     Running   0          75m
vmbc-deployment-client-1-cre-5c8df9bf56-sbvgc             1/1     Running   0          75m
vmbc-deployment-client-1-ethrpc-7568989c87-mtnvn          1/1     Running   0          75m
vmbc-deployment-replica-0-concord-644b6f7c-shlf7          1/1     Running   0          75m
vmbc-deployment-replica-1-concord-6655cddd4d-9zr94        1/1     Running   0          75m
vmbc-deployment-replica-2-concord-649d85c9d9-xptsx        1/1     Running   0          75m
vmbc-deployment-replica-3-concord-57745996-m7m2l          1/1     Running   0          75m
```
