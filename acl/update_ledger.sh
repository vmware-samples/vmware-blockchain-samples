#!/bin/bash

file_to_watch="/home/ramki/vmware-blockchain-samples/acl/attestation-details.txt"

shell_command="python acl1.py"

last_modified=$(stat -c %Y "$file_to_watch")

while true; do
    current_modified=$(stat -c %Y "$file_to_watch")

    if [ "$current_modified" -gt "$last_modified" ]; then
        eval "$shell_command"
        last_modified=$current_modified
    fi

    sleep 1
done
