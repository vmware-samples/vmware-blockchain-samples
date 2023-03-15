# VMware Blockchain Wedge/Unwedge Guide
The wedge command stops the committers from processing new write requests. This means that after a wedge, the system is still working and can answer read requests, but the state will not be changed anymore. It thus means no write requests can be executed, includeing reconfiguration requests.
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
### Check revision history
```
helm history <name of blockchain installation>
```
### Enter the operator pod
#### Get pod name
```
kubectl get pods
```
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
#### Wedge the blockchain
```
./concop wedge stop
```
The result of the above command is a simple indicator "true" which means that the request has been received and passed consensus, **but the replicas have not necessarily got to the wedge point yet**.
#### Check wedge status
```
./concop wedge status
```
The result may be either true, false or some error per replica. "true" means that the replica has reached the wedge point, "false" means that it didn't.
#### Wedge status with --bft flag
```
./concop wedge status --bft
```
Here --bft to support n-f wedge. With --bft flag it won't wait for n/n consensus and only for n-f consensus.
#### Unwedge the blockchain
The unwedge command tells the committers to resume processing new write requests after being stopped with 'wedge'. It is meant to be used at the end of a reconfiguration workflow that starts with 'wedge'.

Note: If you wedge the system and then restart the pods, the system will remain wedged. Unwedge must be executed to resume the system.To initiate unwedge run:
```
./concop unwedge
```
The result of the above command is a simple indicator "true" which means that the command has been received and executed by n/n or n-f/n replicas (depending on the --bft flag).
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
Verify the helm revision history and make sure to rollback to the version without operator pod.
```
helm history <name of blockchain installation>
```
Verify the operator pod is no longer exists.
```
kubectl get pods
```
