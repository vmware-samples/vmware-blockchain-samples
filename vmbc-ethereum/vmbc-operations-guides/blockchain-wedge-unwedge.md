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
