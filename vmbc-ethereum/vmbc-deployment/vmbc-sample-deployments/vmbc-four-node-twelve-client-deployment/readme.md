**Detailed configurations for customization**

    Configurations List of available configurations in values.yaml. Use "--set" param for setting up the params.


| NAME                                                | VALUE                          | DESCRIPTION                                  | TYPE      |
|-----------------------------------------------------|--------------------------------|----------------------------------------------|-----------|
| global.imageCredentials.registry                    |                                | Name of docker registry                      | Mandatory |
| global.imageCredentials.username                    |                                | Username for docker registry                 | Mandatory |
| global.imageCredentials.password                    |                                | Password for docker registry                 | Mandatory |
| global.imageCredentials.email                       | ""                             | Email for docker registry                    | Optional  |
| global.storageClassName                             | "standard"                     | Global StorageClass for Persistent Volume(s) |           |
| global.image.tag                                    | 0.0.0.0.7833                   | The global artifact tag                      | Mandatory |
| global.config.configOverride                        | ""                             | Overwrite tls cert files during upgrade      | Optional  |
| global.maintenanceModeEnabled                       | false                          | Launch containers in maintenance mode        | Optional  |
| operator.publicKey                                  | ""                             | Public key for corresponding operator pvt key| Mandatory |
| concord.image.repository                            | "vmwblockchain/concord-core"   | Global repository for replica                | Mandatory |
| concord.image.tag                                   | ""                             | Tag for replica                              | Optional  |
| clientservice.image.repository                      | "vmwblockchain/clientservice"  | Global repository for clientservice          | Mandatory |
| clientservice.image.tag                             | ""                             | Tag for client service                       | Optional  |
| ethrpc.image.repository                             | "vmwblockchain/ethrpc"         | Global repository for ethrpc                 | Mandatory |
| ethrpc.image.tag                                    | ""                             | Tag for ethrpc                               | Optional  |
| fluentd.image.repository                            | "vmwblockchain/fluentd"        | Global repository for fluentd                | Mandatory |
| fluentd.image.tag                                   | 1.2                            | Tag for fluentd                              | Optional  |
| logManagement                                       |                                | logmanagement-specific parameters            |           |
| resources.replica.cpuRequest                        | 500m                           | CPU request for replica                      | Optional  |
| resources.replica.cpuLimit                          | 500m                           | CPU Limit for replica                        | Optional  |
| resources.replica.memoryRequest                     | 6000Mi                         | Memory request for replica                   | Optional  |
| resources.replica.memoryLimit                       | 6000Mi                         | Memory limit for replica                     | Optional  |
| resources.replica.storageRequest                    | 1Gi                            | Storage request for replica                  | Optional  |
| resources.client.cpuRequest                         | 100m                           | CPU request for client                       | Optional  |
| resources.client.cpuLimit                           | 100m                           | CPU limit for client                         | Optional  |
| resources.client.memoryRequest                      | 500Mi                          | memory request for client                    | Optional  |
| resources.client.memoryLimit                        | 500Mi                          | memory limit for client                      | Optional  |
| genesisBlock.alloc                                  |                                | List of accounts                             |           |
| genesisBlock.permissioningContractAddress           | pre-populated contract address | Contract address for permissioning           | Optional  |
| genesisBlock.permissioningContractBin               | pre-populated contract binary  | Contract bin for permissioning               | Optional  |
| permissioning.ethPermissioningWriteEnabled          | false                          | Eth permissioning write enabled flag         | Optional  |
| Privacy.privacyEnabled                              | false                          | Flag for enabling privacy                    | Optional  |
| filteredPrivacy.ethFilteredPrivacyEnabled           | false                          | Eth filtered privacy enabled flag            | Optional  |
| replicaCheckpointBackup.enabled                     | false                          | Enable Replica checkpoint-based backup       | Optional  |
| replicaCheckpointBackup.checkpointIntervalInSeconds | 21600                          | Interval between checkpoint backups          | Optional  |
| replicaCheckpointBackup.numberOfCheckpoints         | 2                              | Number of checkpoints to retain              | Optional  |
| replicaCheckpointBackup.checkpointWindow            | 30000                          | Number of sequences to wait for              | Optional  |

**Important Notice**
This configuration is very resource heavy. Unless you have a minikube setup with large enough cpu and memory for 12 clients, please consider deploying on AWS EKS.
This works well with an AWS EKS cluster of 15 nodes with m4-large instances.
