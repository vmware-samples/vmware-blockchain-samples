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


def string_replacement_file(filepath, text, subs):
    with open(filepath, "r+") as f1:
        contents = f1.read()
        pattern = re.compile(re.escape(text), flags=0)
        contents = pattern.sub(subs, contents)
        f1.seek(0)
        f1.truncate()
        f1.write(contents)

def create_bc():
    # make a random UUID
    uuid1 = uuid.uuid4()
    # print(uuid1)
    # Convert a UUID to a string of hex digits in standard form
    # print(str(uuid1))
    # Convert a UUID to a 32-character hexadecimal string
    # print(uuid1.hex)
    dep1 = "vmbc-" + str(uuid1)
    print("new blockchain id:", dep1)

    os.chdir("../")
    os.mkdir(dep1)
    cmd = f"cp ./script/*.sh ./{dep1}"
    cmd_response = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    cmd_response.check_returncode()

    os.chdir(dep1)
    print("new blockchain id directory:", os.getcwd())

    filepath = "./k8s-launch.sh"
    text = "vmbc"
    subs = dep1
    string_replacement_file(filepath, text, subs)

    filepath = "./k8s-launch.sh"
    text = dep1 + "-ro-token"
    subs = "vmbc-ro-token"
    string_replacement_file(filepath, text, subs)


    filepath = "./k8s-destroy.sh"
    text = "vmbc"
    subs = dep1
    string_replacement_file(filepath, text, subs)

    cmd = f"./k8s-launch.sh"
    cmd_response = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    cmd_response.check_returncode()

    print("new blockchain id:", dep1, "is up")

    os.chdir("../")
    with open("./last-blkchn-id", "w+") as f2:
        f2.write(dep1)

def delete_bc(id=""):
    blkid = ""
    os.chdir("../")
    if (id != ""):
       blkid = id 
    else:
       with open("./last-blkchn-id", "r") as f3:
           blkidf = f3.readlines()
           blkid  = blkidf[0]
    
    os.chdir(blkid)
    print("delete blockchain id:", blkid)
    
    cmd = f"./k8s-destroy.sh"
    cmd_response = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    cmd_response.check_returncode()

    os.chdir("../")
    dir1 = blkid
    for f in os.listdir(dir1):
        os.remove(os.path.join(dir1, f))
    os.rmdir(blkid)

########## M A I N ##############
parser = argparse.ArgumentParser()
parser.add_argument('-c',  '--create', action='store_true', help='Create new Blockchain')
parser.add_argument('-d', "--delete", metavar='blockchainId', nargs='?', type=str, const="dellast", help='Delete Blockchain for the given blockchainId, if no blockchainId given, then last blockchain will be deleted.')

orchest = parser.parse_args(args=None if sys.argv[1:] else ['--help'])

if orchest.create:
    create_bc()

if (type(orchest.delete) == type(None)):
    print("Blockchain is Created.")
elif (orchest.delete == "dellast"):
    delete_bc()
else:
    delete_bc(orchest.delete)
