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
<TODO>
copy the pod name with "operator" keyword in it.
#### Exec into the operator pod
```
kubectl exec -it <copied pod name from above> -- bash
```
Make sure you are in "/operator" directory.
#### Set operator identity private key
At this point, you must have the private key for the public key with which operator was installed.
Copy contents of the private key. Lets call it <op-pvt-key> for rest of the document.
##### Set using API
```
./concop set-private-key --key "<op-pvt-key>"
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
Copy name of the replica pod. Lets say that is <replica-pod-name-uuid>
```
kubectl exec -it <replica-pod-name-uuid> -- bash
```
Go to the location /concord/config-generated and check for the digits in gen-sec.* file name.
Sample filename: gen-sec.0 for replica 0.
For rest of the document, lets refer to this id as <rep-id>
###### Rotate replica node consensus key
```
./concop key-exchange execute --replicas <rep-id>
```
Note: Key are rotated two working windows after reaching consensus over the new public key, thus consensus keys are always used with respect to a sequence number.
###### Rotate multiple replica consensus keys
For multiple replicas with <rep-id-0>, <rep-id-1>, <rep-id-2>, <rep-id-3>
```
./concop key-exchange execute --replicas <rep-id-0> <rep-id-1> <rep-id-2> <rep-id-3>
```
###### Rotate a replica node tls key
```
./concop key-exchange execute --tls --replicas <rep-id>
```
Note: For cases if there is a message for "Timeout" it means some past operation is still in progress. Please wait for some more time and try again.
###### Rotate multiple replica node tls keys
For multiple replicas with <rep-id-0>, <rep-id-1>, <rep-id-2>, <rep-id-3>
```
./concop key-exchange execute --tls --replicas <rep-id-0> <rep-id-1> <rep-id-2> <rep-id-3>
```

##### Client key rotation
###### Get client id
Login into the desired client pod of which you want to rotate the key
```
kubectl get pods
```
Copy name of the client pod. Lets say that is <client-pod-name-uuid>
```
kubectl exec -it <client-pod-name-uuid> -- bash
```
cat into the file /config/generic/identifiers.env and then look for NODE_UUID.
Sample
```
NODE_UUID=9c12ba07-895d-4b65-b123-143d577d43ba
BLOCKCHAIN_ID=746d220e-1eb9-4d15-ae1b-a224cee8d396
CONSORTIUM_ID=c0afba86-27e2-4362-9ddc-07d184b0b931
```
For rest of the document, lets refer to this id as <cli-uuid>
###### Rotate a client node tls key
```
./concop key-exchange execute --tls --clients <cli-uuid>
```
Note: You may need to perform below operations on clientservice so that TLS handshake happens with replicas and new clientservice key will be reflected on replicas.
####### Get clientservice deployment
```
kubectl get deployment
```
Copy the pod name containing your desired client name and "clientservice" in it. Lets say it is <client-service-deployment>
####### Scale down clientservice deployment
```
kubectl scale deployment <client-service-deployment> --replicas=0
```
####### Scale up clientservice deployment
kubectl scale deployment <client-service-deployment> --replicas=1
###### Rotate multiple client node tls keys
For multiple clients with <cli-uuid-0>, <cli-uuid-1>
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
Note: You may need to perform other operator operations so that TLS handshake happens with replicas and new operator key will be reflected on replicas. Example: Perform any command from [blockchain wedge](./blockchain-wedge-unwedge.md)

Note: Operator key rotation is not fully supported for multi cluster environment where all cluster have their own operator. Impact: If you rotate the operator key in one cluster then in a different cluster containing operator, communication might break since it may n have updated key.
###### Operator tls key rotation status
```
./concop key-exchange status --tls --operator
```

### Revision rollback
Once "operator" operations are completed then rollback to previous revision using below command. These steps are needed to protect the operator identity private key from getting exposed.
```
helm rollback <name of blockchain installation>
```
Verify the helm revision history and make sure to rollback to the version without operator pod.
```
helm history <name of blockchain installation>
```
Verify the operator pod is no longer exists.
```
kubectl get pods
```
