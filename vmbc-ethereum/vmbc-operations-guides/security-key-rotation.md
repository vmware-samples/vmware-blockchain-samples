# VMware Blockchain Security Key Rotations Guide
VMware Blockchain uses a number of security keys that should be periodically rotated for maintenance. Below guide presents a user friendly guide to rotate the different types of keys.
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
#### Key Rotation
You can now use this operator to rotate replica and client keys.

##### Replica key rotation
###### Get replica id
Login into the desired replica/concord pod of which you want to rotate the key
```
kubectl get pods
```
Copy name of the replica pod. Lets say that is replica-pod-name-uuid\
Grep logs to get replica id.
```
kubectl logs <replica-pod-name-uuid> | grep "Starting committer replica with id"
```
sample:
```
kubectl logs vmbc-deployment-replica-0-concord-644b6f7c-shlf7 | grep "Starting committer replica with id"
Defaulted container "replica-0-concord" out of: replica-0-concord, init-container (init)
2023-03-16T18:46:43,493,+0000|INFO ||concord.main||||||main.cpp:1037|Starting committer replica with id 0 | [SQ:76]
```
For rest of the document, lets refer to this id as rep-id
###### Rotate replica node consensus key
```
./concop key-exchange execute --replicas <rep-id>
```
sample:
```
root@vmbc-deployment-operator-0-operator-5496c96cfb-jsrph:/operator# ./concop key-exchange execute --replicas 0
{"succ":true}
```
Note: Key are rotated two working windows after reaching consensus over the new public key, thus consensus keys are always used with respect to a sequence number.
###### Rotate multiple replica consensus keys
For multiple replicas with rep-id-0, rep-id-1, rep-id-2, rep-id-3
```
./concop key-exchange execute --replicas <rep-id-0> <rep-id-1> <rep-id-2> <rep-id-3>
```
sample:
```
root@vmbc-deployment-operator-0-operator-5496c96cfb-jsrph:/operator# ./concop key-exchange execute --replicas 0 1 2 3
{"succ":true}
```
###### Rotate a replica node tls key
```
./concop key-exchange execute --tls --replicas <rep-id>
```
sample:
```
root@vmbc-deployment-operator-0-operator-5496c96cfb-jsrph:/operator# ./concop key-exchange execute --tls --replicas 0
{"succ":true}
```
###### Rotate multiple replica node tls keys
For multiple replicas with rep-id-0, rep-id-1, rep-id-2, rep-id-3
```
./concop key-exchange execute --tls --replicas <rep-id-0> <rep-id-1> <rep-id-2> <rep-id-3>
```
Note: For cases if there is a message for "Timeout" it means some past operation is still in progress. Please wait for some more time and try again.
sample:
```
root@vmbc-deployment-operator-0-operator-5496c96cfb-jsrph:/operator# ./concop key-exchange execute --tls --replicas 0 1 2 3
{"additional_data":"Timeout for request sequence number: 7042210482094080000, and correlation id: operator-keyExchange-command-7042210482094080000","succ":false}
```
##### Client key rotation
###### Get client id
For the desired client, in the generated charts, cat into the file path-to-desired-client/config/generic/identifiers.env and then look for NODE_UUID.
Sample
```
cat client-0/config/generic/identifiers.env 
NODE_UUID=7b5c5fbc-8808-4dfd-bb9f-692a33a27676
BLOCKCHAIN_ID=746d220e-1eb9-4d15-ae1b-a224cee8d396
CONSORTIUM_ID=c44a8c78-0b59-4bfc-b392-ddbc376d4f9b%                                        
```
For rest of the document, lets refer to this id as cli-uuid
###### Rotate a client node tls key
```
./concop key-exchange execute --tls --clients <cli-uuid>
```
sample:
```
root@vmbc-deployment-operator-0-operator-5496c96cfb-jsrph:/operator# ./concop key-exchange execute --tls --clients 7b5c5fbc-8808-4dfd-bb9f-692a33a27676
{"succ":true}
```
Note: You may need to perform below operations on clientservice so that TLS handshake happens with replicas and new clientservice key will be reflected on replicas.
####### Get clientservice deployment
```
kubectl get deployment
```
sample:
```
kubectl get deployment
NAME                                     READY   UP-TO-DATE   AVAILABLE   AGE
vmbc-deployment-client-0-clientservice   1/1     1            1           47m
vmbc-deployment-client-0-cre             1/1     1            1           47m
vmbc-deployment-client-0-ethrpc          1/1     1            1           47m
vmbc-deployment-client-1-clientservice   1/1     1            1           47m
vmbc-deployment-client-1-cre             1/1     1            1           47m
vmbc-deployment-client-1-ethrpc          1/1     1            1           47m
vmbc-deployment-operator-0-operator      1/1     1            1           43m
vmbc-deployment-replica-0-concord        1/1     1            1           47m
vmbc-deployment-replica-1-concord        1/1     1            1           47m
vmbc-deployment-replica-2-concord        1/1     1            1           47m
vmbc-deployment-replica-3-concord        1/1     1            1           47m
```
Copy the pod name containing your desired client name and "clientservice" in it. Lets say it is client-service-deployment\
Scale down clientservice deployment
```
kubectl scale deployment <client-service-deployment> --replicas=0
```
sample:
```
kubectl scale deployment vmbc-deployment-client-0-clientservice --replicas=0
deployment.apps/vmbc-deployment-client-0-clientservice scaled
```
Scale up clientservice deployment
```
kubectl scale deployment <client-service-deployment> --replicas=1
```
sample:
```
kubectl scale deployment vmbc-deployment-client-0-clientservice --replicas=1
deployment.apps/vmbc-deployment-client-0-clientservice scaled
```
###### Rotate multiple client node tls keys
For multiple clients with cli-uuid-0, cli-uuid-1
```
./concop key-exchange execute --tls --clients <cli-uuid-0> <cli-uuid-1>
```
###### Clients tls key rotation status
```
./concop key-exchange status --tls --clients
```

##### Operator key rotation
###### Rotate a operator node tls key
```
./concop key-exchange execute --tls --operator
```
sample:
```
root@vmbc-deployment-operator-0-operator-5496c96cfb-jsrph:/operator# ./concop key-exchange execute --tls --operator
{"succ":true}
```
Note: You may need to perform other operator operations so that TLS handshake happens with replicas and new operator key will be reflected on replicas. Example: Perform any command from [blockchain wedge](./blockchain-wedge-unwedge.md)

Note: Operator key rotation is not fully supported for multi cluster environment where all cluster have their own operator. Impact: If you rotate the operator key in one cluster then in a different cluster containing operator, communication might break since it may not have updated key.\
###### Operator tls key rotation status
```
./concop key-exchange status --tls --operator
```

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
