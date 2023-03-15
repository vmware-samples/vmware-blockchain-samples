# VMBC Blockchain Deployment Sample Descriptor Guide

## Structure and Legends

### Infrastructure descriptor
#### Organization
This section defines top level information that impacts all nodes of the entire blockchain.
Please replace <BLOCKCHAIN_VERSION> with the desired version of blockchain as received from VMware tech.
#### Zones
This section defines infrastructure details for kubernetes cluster where you want your deployment in. "Zones" is a list of zone or cluster you may use to distribute your blockchain nodes to be deployed into.
| Parameter                 | Replace with value                |
| ------------------------- | --------------------------------- |
| zoneName (ZONE_NAME-1 / ZONE_NAME-2) | desired name of the zone          |
| registryName              | name of container registry        |
| userName                  | username for container registry   |
| password                  | password for container registry   |

### Deployment descriptor
#### replicas
Replicas are objects that creates the blockchain network by connecting to each other. Replicas participate in [SBFT Consensus protocol](https://arxiv.org/pdf/1804.01626.pdf).
"replicas" is a list of replica specification, which must follow 3f+1 convention, where "f" is the tolerated faults. This means, the number of replicas in this list must be 4 for 1 tolerated fault or 7 for 2 tolerated faults.
Each replica should have the below.
| Parameter                 | Replace with value                |
| ------------------------- | --------------------------------- |
| zoneName                  | zone name from infrastructure descriptor as above          |
| providedName              | desired name of the replica. MUST be different for each replica
| storageClassName          | "standard" for minikube, "gp2" for EKS   |
#### clients
Clients are objects that will be used to connect to the blockchain network to execute ethereum transactions.
"clients" is a list of client specification and can range from 1 to 12.
Each client should have the below.
| Parameter                 | Replace with value                |
| ------------------------- | --------------------------------- |
| zoneName                  | zone name from infrastructure descriptor as above          |
| providedName              | desired name of the replica. MUST be different for each replica
| storageClassName          | "standard" for minikube, "gp2" for EKS   |
#### replicaNodeSpec
This section defines additional specifications, especially resource allocation that will be applicable to all replicas. The sample descriptor provides sample values for each parameter, which can be tweaked depending on available resources on cluster and desired performance.
#### clientNodeSpec
This section defines additional specifications, especially resource allocation that will be applicable to all clients. The sample descriptor provides sample values for each parameter, which can be tweaked depending on available resources on cluster and desired performance.
#### operators
An operator is used for maintenance of the blockchain. More information about operator can be found in [vmbc-operations-guides](../../../vmbc-operations-guides).
Each zone or cluster may or may not have an operator but there must be only one operator per zone/cluster if you chosen.
If there is more than one operator in a deployment, all the operators must use the same private-public key pair.
Each operator should have the below.
| Parameter                 | Replace with value                |
| ------------------------- | --------------------------------- |
| zoneName                  | zone name from infrastructure descriptor as above          |
| providedName              | desired name of the replica. MUST be different for each replica
| operatorPublicKey         | public key data as string. NOTE: you must save the private key for later use   |
#### operatorNodeSpec
This section defines additional specifications, especially resource allocation that will be applicable to all operators. The sample descriptor provides sample values for each parameter, which can be tweaked depending on available resources on cluster and desired performance.
#### blockchain
This section defines specifications applicable to the entire blockchain.
| Parameter                 | Replace with value                |
| ------------------------- | --------------------------------- |
| blockchainId              | desired name/id of the deployed blockchain          |
| consortiumName            | desired name of the consortium    |
