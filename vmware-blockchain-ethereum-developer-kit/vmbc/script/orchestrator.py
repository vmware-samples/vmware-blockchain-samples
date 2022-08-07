import uuid
import ast
import os
import subprocess
import time
import json
import urllib3
import re
import argparse
import sys
import yaml
import shutil
import psutil
from dotenv import load_dotenv
from kubernetes import client, config, watch

ENDC = '\033[0m'
RED = '\033[0;31m'
GREEN = '\033[0;32m'
BLUE = '\033[0;34m'
YELLOW = '\033[0;33m'

MODE = "release"
if MODE != "release":
    envfile = "../config/.env"
else:
    envfile = "../.env.release"

load_dotenv(envfile)
concord_repo = os.getenv("concord_repo")
concord_tag = os.getenv("concord_tag")
ethrpc_repo = os.getenv("ethrpc_repo")
ethrpc_tag = os.getenv("ethrpc_tag")
clientservice_repo = os.getenv("clientservice_repo")
clientservice_tag = os.getenv("clientservice_tag")
operator_repo = os.getenv("operator_repo")
operator_tag = os.getenv("operator_tag")
cre_repo = os.getenv("cre_repo")
cre_tag = os.getenv("cre_tag")
ENABLE_MINIKUBE = os.getenv("ENABLE_MINIKUBE")

def run_command(cmd):    
    output = []
    err = []
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True, text=True)
    while process.poll() is None:
        stdout_line = process.stdout.readline().rstrip('\n')
        print(stdout_line)
        
        if stdout_line:
            output.append(stdout_line)
    return_code = process.returncode
    
    if return_code > 0:
        err = process.stderr.read().rstrip('\n')

    process.stdout.close()
    process.stderr.close()
    return output, err

def checkMemAndCpu():
    memory = psutil.virtual_memory().total
    cpu = psutil.cpu_count()
    memory /= (1024 * 1024 * 1024)
    if cpu < 5 and memory < 12:
        print("Fatal: not enough memory and cpu's")
        print("Total RAM size  : ", memory)
        print("Total CPU count : ", cpu)
        sys.exit()

def checkAllPodsRunning(blockchainId):
    all_pods_running = False
    namespaces = [ blockchainId + "-client1", blockchainId + "-replica1", blockchainId + "-replica2", blockchainId + "-replica3", blockchainId + "-replica4"]
    loop_count = 0
    retries = 5
    total_pods_running = 0
    
    while loop_count < retries:
        if total_pods_running == len(namespaces):
            break
        for namespace in namespaces:
            all_pods_running = validate_all_pods_are_in_running_state(namespace)
            if all_pods_running:
                total_pods_running += 1
            if total_pods_running == len(namespaces):
                break
            else:
                loop_count += 1
    if total_pods_running == len(namespaces):
        return True
    else:
        return False

def isBlockchainExists():
    all_pods_running = False
    if os.path.exists("/tmp/last-blkchn-id"):
            with open("/tmp/last-blkchn-id", "r") as f3:
                blkidf = f3.readlines()
                blockchainId  = blkidf[0]
                blockchainId = os.path.basename(os.path.normpath(blockchainId))
                all_pods_running = checkAllPodsRunning(blockchainId)            
            if all_pods_running:
                print("Blockchain is already up and running !")
                return True
            else:
                print("Blockchain exists. But not in running state !")
                return True
    else:
        print("Blockchain doens't exist.")
        return False
    

def deleteNamespace(namespace):
    config.load_kube_config()
    v1 = client.CoreV1Api()
    deleted = True
    NAMESPACE_DOES_NOT_EXIST = 404
    try:
        v1.delete_namespace(namespace)
    except client.ApiException as apiException:
        if apiException.status == NAMESPACE_DOES_NOT_EXIST:
            deleted = False

    return deleted

def minikube_status():
    cmd = "minikube status | grep -e 'apiserver: Running' -e 'kubelet: Running' -e 'host: Running' -c"
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    out, err = process.communicate()
    if err:
        print(err)
    return out.decode('UTF-8').rstrip()

def validate_all_pods_are_in_running_state(namespace) -> bool:

    config.load_kube_config()
    v1 = client.CoreV1Api()
    pods = v1.list_namespaced_pod(namespace)
    if not pods.items:
        return False
    pod_running_count = 0
    for pod in pods.items:
        
        if pod.status.phase == 'Running':
            pod_running_count += 1
            print(f"Namespace: {BLUE} {namespace:52} {ENDC} Pod: {BLUE} {pod.metadata.name:32} {ENDC} Status: {GREEN} {pod.status.phase} {ENDC}")
        else:
            print(f"Namespace: {BLUE} {namespace:52} {ENDC} Pod: {BLUE} {pod.metadata.name:32} {ENDC} Status: {YELLOW} {pod.status.phase} {ENDC}")
    return pod_running_count == len(pods.items)


def string_replacement_file(filepath, text, subs):
    with open(filepath, "r+") as f1:
        contents = f1.read()
        pattern = re.compile(re.escape(text), flags=0)
        contents = pattern.sub(subs, contents)
        f1.seek(0)
        f1.truncate()
        f1.write(contents)

def cleanupDir(dep1):
    dir1 = dep1
    os.chdir("../")
    for f in os.listdir(dir1):
        if os.path.isdir(os.path.join(dir1, f)):
            shutil.rmtree(os.path.join(dir1, f))
        else:
            os.remove(os.path.join(dir1, f))
    os.rmdir(dep1)
    if os.path.exists("/tmp/last-blkchn-id"):
        os.remove("/tmp/last-blkchn-id")

    sys.exit()

def create_bc():

    print(f"######################### {BLUE}VMBC Blockchain Deployment {ENDC}###################")

    # Check memory and CPU 
    checkMemAndCpu()

    if ENABLE_MINIKUBE is True:
        # Check minikube status
        mkstatus = int(minikube_status())
        if mkstatus == 3:
            print("Minikube is running....")
        else:
            print("Minikube is NOT running. Start the minikube before creating the VMBC Blockchain.")
            sys.exit()
    
    # Check if the Blockchain is already deployed and running
    if isBlockchainExists():
        sys.exit()

    # make a random UUID
    uuid1 = uuid.uuid4()

    dep1 = "vmbc-" + str(uuid1)
    print(f"New blockchain id: {GREEN} {dep1} {ENDC}")

    # Create blockchain-id dir
    os.chdir("../")
    os.mkdir(dep1)

    # Copy script files to blockchain-id dir
    cmd = f"cp ./script/*.sh ./{dep1}"
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    out, err = process.communicate()
    print(out.decode('UTF-8').rstrip())
    if err:
        print("Blockchain provisioning is failed.")
        print(err)
        cleanupDir(dep1)

    # Copy tmpl files as yml files (ethrpc, clientservice, replica1, replica2, replica3 and replica4)
    cmd = f"cp k8s-clientservice-deployment.yml.tmpl ./{dep1}/k8s-clientservice-deployment.yml; \
            cp k8s-ethrpc-deployment.yml.tmpl ./{dep1}/k8s-ethrpc-deployment.yml;               \
            cp k8s-replica-node1-deployment.yml.tmpl ./{dep1}/k8s-replica-node1-deployment.yml; \
            cp k8s-replica-node2-deployment.yml.tmpl ./{dep1}/k8s-replica-node2-deployment.yml; \
            cp k8s-replica-node3-deployment.yml.tmpl ./{dep1}/k8s-replica-node3-deployment.yml; \
            cp k8s-replica-node4-deployment.yml.tmpl ./{dep1}/k8s-replica-node4-deployment.yml; \
            cp *.yml ./{dep1}/;                                                                 \
            cp runTest.yml.tmpl ./{dep1}/runTest.yml; "                                          
           
    if MODE != "release":
        cmd += f"cp k8s-cre-deployment.yml.tmpl ./{dep1}/k8s-cre-deployment.yml;                    \
                cp k8s-operator-deployment.yml.tmpl ./{dep1}/k8s-operator-deployment.yml;           \
                 cp config/concord-config-gen.yml.tmpl config/concord-config-gen.yml;"

    out, err = run_command(cmd)
    if err:
        print("Blockchain provisioning is failed.")
        print(err)
        cleanupDir(dep1)

    os.chdir(dep1)
    print(f"New blockchain id directory: {GREEN} {os.getcwd()} {ENDC}")
    blockchainDir = os.getcwd()

    string_replacement_file("./k8s-launch.sh", "vmbc", dep1)
    string_replacement_file("./k8s-launch.sh", dep1 + "-ro-token", "vmbc-ro-token")
    string_replacement_file("./k8s-destroy.sh", "vmbc", dep1)

    string_replacement_file("./k8s-ethrpc-deployment.yml", "vmbc", dep1)

    string_replacement_file("./k8s-clientservice-deployment.yml", "clientservice_repo", clientservice_repo)
    string_replacement_file("./k8s-clientservice-deployment.yml", "clientservice_tag", clientservice_tag)
    string_replacement_file("./k8s-ethrpc-deployment.yml", "ethrpc_repo", ethrpc_repo)
    string_replacement_file("./k8s-ethrpc-deployment.yml", "ethrpc_tag", ethrpc_tag)
    string_replacement_file("./k8s-replica-node1-deployment.yml", "concord_repo", concord_repo)
    string_replacement_file("./k8s-replica-node2-deployment.yml", "concord_repo", concord_repo)
    string_replacement_file("./k8s-replica-node3-deployment.yml", "concord_repo", concord_repo)
    string_replacement_file("./k8s-replica-node4-deployment.yml", "concord_repo", concord_repo)
    string_replacement_file("./k8s-replica-node1-deployment.yml", "concord_tag", concord_tag)
    string_replacement_file("./k8s-replica-node2-deployment.yml", "concord_tag", concord_tag)
    string_replacement_file("./k8s-replica-node3-deployment.yml", "concord_tag", concord_tag)
    string_replacement_file("./k8s-replica-node4-deployment.yml", "concord_tag", concord_tag)

    if MODE != "release":
        string_replacement_file("./k8s-operator-deployment.yml", "operator_repo", operator_repo)
        string_replacement_file("./k8s-operator-deployment.yml", "operator_tag", operator_tag)
        string_replacement_file("./k8s-cre-deployment.yml", "cre_repo", cre_repo)
        string_replacement_file("./k8s-cre-deployment.yml", "cre_tag", cre_tag)
        string_replacement_file("../config/concord-config-gen.yml", "concord_repo", concord_repo)
        string_replacement_file("../config/concord-config-gen.yml", "concord_tag", concord_tag)

    # Test each blockchain separately 
    cmd = f"cp -r ../../testing ./testing"
    out, err = run_command(cmd)
    if err:
        print("Blockchain provisioning is failed.")
        print(err)
        cleanupDir(dep1)
    
    string_replacement_file("./testing/eth_erc20.py", "vmbc", dep1)
    string_replacement_file("./runTest.sh", "vmbc", dep1)
    string_replacement_file("./deleteTest.sh", "vmbc", dep1)

    # Launch k8s cluster in release mode
    cmd = f"./k8s-launch.sh release"
    out, err = run_command(cmd)
    if err:
        namespaces = [ dep1 + "-configgen", dep1 + "-client1", dep1 + "-replica1", dep1 + "-replica2", dep1 + "-replica3", dep1 + "-replica4"]
        for namespace in namespaces:
            deleteNamespace(namespace)
        print("Blockchain provisioning is failed.")
        print("Failure reason :", err)
        print(f"{RED}=========================== Failed ================================{ENDC}")
        cleanupDir(dep1)

    print(f"New blockchain id: {BLUE}{dep1}{ENDC} is up.")
    print(f"Run {BLUE}./vmbc-cli --healthcheck {ENDC} to get the current status of the VMBC Blockchain.")

    os.chdir("../")
    with open("/tmp/last-blkchn-id", "w+") as f2:
        f2.write(blockchainDir)

def test_bc(id=""):
    blkid = ""
    retries = 500
    loop_count = 1
    sleep_time = 10
    os.chdir("../")
    if (id != ""):
       blkid = id 
    else:
        if os.path.exists("/tmp/last-blkchn-id"):
            with open("/tmp/last-blkchn-id", "r") as f3:
                blkidf = f3.readlines()
                blkid  = blkidf[0]
        else:
            print("Blockchain doens't exist.")
            return

    blkid = os.path.basename(os.path.normpath(blkid))
    os.chdir(blkid)
    print("Testing VMBC blockchain id:", blkid)
    
    all_pods_running = False
    Succeeded = False
    while loop_count < retries:
        all_pods_running = checkAllPodsRunning(blkid)
        if all_pods_running:
            break
        else:
            print(f"[Attempt {RED}{loop_count}{ENDC}/{YELLOW}{retries}{ENDC}] all pods are not in Running state, retrying in {sleep_time} secs...")
            time.sleep(sleep_time)
            loop_count += 1

    if all_pods_running:
        cmd = f"./runTest.sh"
        out, err = run_command(cmd)
        if err:
            print(err)
        
        config.load_kube_config()
        container_name = "erc20test"
        client_ns = blkid + "-client1"
        
        Succeeded = wait_for_pod_to_complete(client_ns)

        if Succeeded:
            v1 = client.CoreV1Api()
            all_pods_client = v1.list_namespaced_pod(namespace=client_ns)
      
            for pod in all_pods_client.items:
                if container_name in pod.metadata.name:
                    api_response = v1.read_namespaced_pod_log(name=pod.metadata.name, namespace=client_ns)
                    print(api_response)
                    time.sleep(5)

        cmd = f"./deleteTest.sh"
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        out, err = process.communicate() 
        print(out.decode('UTF-8').rstrip())
        if err:
            print(err)

    os.chdir("../")
    if Succeeded:
        print(f"{GREEN}Blockchain is healthy and basic healthcheck is successfully completed. {ENDC}")
        print(f"{GREEN}=========================== DONE ================================{ENDC}")

def wait_for_pod_to_complete(namespace):
    while True:
        config.load_kube_config()
        v1 = client.CoreV1Api()
        pods = v1.list_namespaced_pod(namespace)
        completed = False
        Succeeded = True

        for pod in pods.items:
            if "erc20test" in pod.metadata.name:
                time.sleep(5)
                #print(f"PoD {pod.metadata.name} status {GREEN} {pod.status.phase} {ENDC}")
                if pod.status.phase == 'Succeeded':
                    print(f"PoD {pod.metadata.name} status {GREEN} {pod.status.phase} {ENDC}")
                    completed = True
                    break
                elif pod.status.phase == 'Pending':
                    print(f"PoD {pod.metadata.name} status {YELLOW} {pod.status.phase} {ENDC}, retrying in 5 secs...")
                elif pod.status.phase == 'Failed':
                    print(f"PoD {pod.metadata.name} status {YELLOW} {pod.status.phase} {ENDC}, ...")
                    completed = True
                    Succeeded = False
                    break
                else: 
                    print(f"PoD {pod.metadata.name} status {GREEN} {pod.status.phase} {ENDC}, testing is in progress...")

        if completed == True:
            break

    return Succeeded


def delete_bc(id=""):
    if ENABLE_MINIKUBE is True:
        mkstatus = int(minikube_status())
        if mkstatus != 3:
            print("Minikube is NOT running. Can't DEPROVISION the VMBC Blockchain.")
            sys.exit()

    blkid = ""
    os.chdir("../")
    if (id != ""):
       blkid = id 
    else:
        if os.path.exists("/tmp/last-blkchn-id"):
            with open("/tmp/last-blkchn-id", "r") as f3:
                blkidf = f3.readlines()
                blkid  = blkidf[0]
        else:
            print("Blockchain doens't exist.")
            sys.exit()
    
    if not os.path.exists(blkid):
         print(f"Blockchain {blkid} : doens't exist.")
         sys.exit()

    os.chdir(blkid)
    blkid = os.path.basename(os.path.normpath(blkid))
    print(f"Deleting blockchain id: {RED}{blkid}{ENDC}")
    
    cmd = f"./k8s-destroy.sh release"
    out, err = run_command(cmd)
    if err:
        print("Blockchain deprovisioning is failed.")
        print(err)

    cleanupDir(blkid)

########## M A I N ##############
os.environ["PYTHONUNBUFFERED"] = "1"
parser = argparse.ArgumentParser()
parser.add_argument('-c',  '--create', action='store_true', help='Create new Blockchain')
parser.add_argument('-d', "--delete", metavar='blockchainId', nargs='?', type=str, const="dellast", help='Delete Blockchain for the given blockchainId, if no blockchainId given, then last blockchain will be deleted.')
parser.add_argument('-t',  '--test', metavar='blockchainId', nargs='?', type=str, const="testlast", help='Test the Blockchain by transacting ERC-20 tokens')

orchest = parser.parse_args(args=None if sys.argv[1:] else ['--help'])

if orchest.create:
    create_bc()

if (type(orchest.delete) == type(None)):
    if orchest.test:
        print("Testing the VMBC Blockchain")
elif (orchest.delete == "dellast"):
    delete_bc()
else:
    delete_bc(orchest.delete)

if orchest.test:
    test_bc()
