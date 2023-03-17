# Backup and Restore of VMware Blockchain
In K8s, persistent data is stored on external storage (such as EBS/EKS, or CloudStorage Buckets/GKE). This storage is expected to be periodically backed up by users, e.g. [EBS snapshots](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSSnapshots.html), or [Backup for GKE](https://cloud.google.com/kubernetes-engine/docs/add-on/backup-for-gke/concepts/backup-for-gke). In the event of a recovery situation, users are expected to restore their volumes from these backups. This storage backup and restore is at the bit-level - there is no semantic consistency for them. We use a Concord-provided feature, Checkpoint backup, to impose semantic consistency of the data on top of the storage backup and restore.

## Backup
There are 3 steps for properly backing up persistent data:
- Users set up their StorageClass to use a ReclaimPolicy of Retain.
- Users enable logical Replica checkpoint backup during VMBC installation/deployment via VMBC features.
- Users enable storage backup via their vendor-specific storage capabilities.

### User Flow
- Before deploying a blockchain, ensure that the storageClass specified in the Helm chart is set up to use ReclaimPolicy: Retain.
- Configure Backup in the Infrastructure Descriptor in the organization field
```
{
    "organization": {
        ...
        "replicaCheckpointBackup": {
            "enabled": true,
            "numberOfCheckpoints": 5,
            "checkpointIntervalInSeconds": 3600,
            "checkpointWindow": 30000
        }
    }
    ...
}
```
These settings will be available in the Helm chart values.yaml file after the chart is generated. They can be overriden during chart installation via the standard Helm methods.
```
## Replica checkpoint backup
replicaCheckpointBackup:
  checkpointIntervalInSeconds: 3600
  checkpointWindow: 30000
  enabled: true
  numberOfCheckpoints: 5
```
- Configure storage backup/snapshot of the storage fronted by the storageClass used in the deployment.
  - Minikube
    - Using the right storage class
      - Delete the existing StorageClass, which is created by default with ReclaimPolicy=Retain
      ```
      kubectl delete SC standard
      ```
      - Create a manifest
      ```
      cat > standard-sc-with-retain.yaml <<EOF
      apiVersion: storage.k8s.io/v1
      kind: StorageClass
      metadata:
        name: standard
      provisioner: k8s.io/minikube-hostpath
      reclaimPolicy: Retain
      volumeBindingMode: Immediate
      EOF
      ```
      - Create the SC
      ```
      kubectl apply -f standard-sc-with-retain.yaml
      ```
    
    - Backing up the persistent store
      - ssh into the minikube VM
      ```
      minikube ssh
      ```
      - Switch to su
      ```
      sudo su -
      ```
      The persistent stores for all replicas is located under /tmp/hostpath-provisioner, e.g.
      ```
      # pwd
      /tmp/hostpath-provisioner/default
      # ls -la
      total 24
      drwxr-xr-x 6 root root 4096 Feb  1 03:23 .
      drwxr-xr-x 3 root root 4096 Jan 19 17:59 ..
      drwxr-xr-x 3 root root 4096 Jan 31 22:06 concord-pvc-746d220e-1eb9-4d15-ae1b-a224cee8d396-replica-0
      drwxr-xr-x 3 root root 4096 Jan 31 22:06 concord-pvc-746d220e-1eb9-4d15-ae1b-a224cee8d396-replica-1
      drwxr-xr-x 3 root root 4096 Jan 31 22:06 concord-pvc-746d220e-1eb9-4d15-ae1b-a224cee8d396-replica-2
      drwxr-xr-x 3 root root 4096 Jan 31 22:06 concord-pvc-746d220e-1eb9-4d15-ae1b-a224cee8d396-replica-3
      ```
      Here, default is the namespace under which the blockchain was deployed. To take a backup, these directories plus contents would be copied to the backup location.
    - Repeat this for all Blockchain Replica and Client components in the K8s cluster.
  - EKS
  
    You can check the volumes used for the cluster by navigating to EKS > cluster-name > Resources
    Example:
    ![alt text][ebs_pv]
  
    [ebs_pv]: https://github.com/vmware-samples/vmware-blockchain-samples/blob/stage-eth-dev/vmbc-ethereum/vmbc-operations-guides/images/EKS_PV.png "EKS PV Sample"
  
    Clicking on a PV will show the EBS volume id:
    ![alt text][ebs_vol]
  
    [ebs_vol]: https://github.com/vmware-samples/vmware-blockchain-samples/blob/stage-eth-dev/vmbc-ethereum/vmbc-operations-guides/images/EKS_EBS.png "EKS EBS Vol id Sample"
    
    Note the Volume ID. Clicking on it shows an EC2 instance to which the volume is attached. This EC2 instance is needed later in the restore step.
    
## Restore
There are 2 steps for properly restoring data:
- Users restore storage from backups via their vendor-specific capabilities.
- Users restore the blockchain data to its logical, consistent point by choosing the right checkpoint backup.

# User Flow
- Ensure that the blockchain components are stopped in the cluster. Use this helm upgrade command to stop the blockchain components:
```
helm upgrade <name-of-release> <path-to-chart> --reuse-values --set global.replicaCount=0
```
Note the replicaCount: 0.
- After a while, all pods in the cluster should be shut down. This can be verified using
```
kubectl get pods [-n <namespace-used-during-deployment>]
```
- Restore process can be started now from the backups taken before.
  - Minikube
    - Log into the minikube VM as described in the Backup section, and restore the directories that have the backups to their original locations under /tmp/hostpath-provisioner/default
    - Repeat the process for all Volumes for all clusters.
    - Once all volumes have been restored, restart all blockchain components in the cluster by running this helm upgrade command:
    ```
    helm upgrade <name-of-release> <path-to-chart> --reuse-values --set global.replicaCount=1
    ```
    - Confirm that the pods are started and running using this kubectl command:
    ```
    kubectl get pods [-n <namespace-used-during-deployment>]
    ```
    - Perform blockchain functional validation on the recovered blockchain.
  - EKS
    - For AWS, the data is restored to a new  volume, which then needs to be re-attached to the original instance. See [AWS EBS restore guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-restoring-volume.html) for more details.
      Note: Make sure that the restored volume is hosted in the same Availability Zone as the original volume.
      ![alt text][ebs_snapshot]
  
    [ebs_snapshot]: https://github.com/vmware-samples/vmware-blockchain-samples/blob/stage-eth-dev/vmbc-ethereum/vmbc-operations-guides/images/EKS_EBS_SNAPSHOT.png "EKS EBS snapshot Sample"
    - For EKS. attach the snapshot EBS volume from above to the EC2 instance from the Backup step, and then copy over data from the snapshot volume to the original volume. Do not replace the original volume with the snapshot volume.
      Say the original EBS volume is attached at /dev/abcd. Say the restored EBS volume is attached at /dev/pqrs. Then, one approach to restoring the data would be to mount both volumes at different directories, and then copy the data from the restored directory location to the original directory location, for example, to copy restored data for replica-2 to the original location
      - switch to root
      ```
      sudo su -
      ```
      - create the destination mount point for replica-2's original volume (repeat this for each replica whose persistent store is attached to the instance)
      ```
      mkdir -p /mnt/destination/replica-2
      ```
      - create the source mount point for replica-2's restored volume
      ```
      mkdir -p /mnt/source/replica-2
      ```
      - Mount the original destination volume
      ```
      mount /dev/abcd /mnt/destination/replica-2
      ```
      - Mount the restored source volume
      ```
      mount /dev/pqrs /mnt/source/replica-2
      ```
      - If you want to restore only rocksdb data, figure out the appropriate checkpoint that you want to restore. This checkpoint number and directory should be the same for all replicas. Say that checkpoint number is 123.
      - Make a note of the user and group of the files under rocksdbdata, available under 
      ```
      /mnt/destination/replica-2/<namespace>/<blockchainid>/replica-2/rocksdbdata/*
      ```
      - Blow away the original rocksdbdata
      ```
      rm -rf /mnt/destination/replica-2/<namespace>/<blockchainid>/replica-2/rocksdbdata/*
      ```
      - Copy over the checkpointed rocksdbdata from the source restored volume to the original location
      ```
      cp -r -L -p /mnt/source/replica-2/<namespace>/<blockchainid>/replica-2/rocksdbdata/checkpoints/<checkpoint-number>/* /mnt/destination/replica-2/<namespace>/<blockchainid>/replica-2/rocksdbdata
      ```
      - At this point you can unmount the original and restored volume from the instance, and delete the restored volume from EC2 along with its snapshots.

## Checkpointing via Operator
- A checkpoint can be forced by issuing the concop db-checkpoint create command, e.g. once you have logged into the operator, you can run this command:
```
./concop db-checkpoint create
```
  A new checkpoint directory under /rocksdbdata/checkpoints will be created.
- The status of checkpoints can also be seen by running this command:
```
./concop db-checkpoint status
```
