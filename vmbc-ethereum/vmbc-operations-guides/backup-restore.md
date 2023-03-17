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

