#!/usr/bin/env bash
# Creates simple self-signed certificates to use for TRC-TRS TLS connection
# by default, the script:
# 1) Creates the following the concord and clientservice folders in the current folder.
#    For e.g., - [concord1, concord2, .., clientservice1, clientservice2, ..]
# 2) Each concord folder contains the following certs -
#    - server.cert (thin replica server's cerificate)
#    - pk.pem (thin replica server's private key)
#    - client.cert (concatenation of all thin replica client certificates)
# 3) Each clientservice folder contains the following certs -
#    - client.cert (thin replica client's cerificate)
#    - pk.pem (thin replica client's private key)
#    - server.cert (concatenation of all thin replica server certificates)
# Examples usage:
# 1) To create 7 TRS and 4 TRC cert folders in "./tr_certs:
# > ./create_tr_certs.sh 7 4
#
# 2) To create 7 TRS and 4 TRC cert folders in "/tmp/abc/:
# > ./create_tr_certs.sh 7 4 /tmp/abc
#
# If use_unified_certificates=true
# Creates simple self-signed certificates to use with TCP/TLS module
# by default, the script:
# 1) Creates "tls_certs" folder in the current folder
# 2) Starts from node ID 0
#
# Examples usage:
# 1) To create 10 certificates folders with node IDs 0 to 9 in "./certs:
# > ./create_tr_certs.sh 10
#
# 2) To create 15 certificates folders with node IDs 0 to 14 in "/tmp/abc/:
# > ./create_tr_certs.sh 15 /tmp/abc
#
# 3) To create 30 certificates folders with node IDs 5 to 34 in "/tmp/fldkdsZ/:
# > ./create_tr_certs.sh 30 /tmp/fldkdsZ 5

use_unified_certificates=false

KEY="15ec11a047f630ca00f65c25f0b3bfd89a7054a5b9e2e3cdb6a772a58251b4c2"
IV="38106509f6528ff859c366747aa04f21"

if [ "$use_unified_certificates" = true ]; then
    echo "Use Unified Certificates"

    if [ "$#" -eq 0 ] || [ -z "$1" ]; then
        echo "usage: create_tr_certs.sh {num of replicas} {optional - output folder} {optional - start node ID}"
        exit 1
    fi

    dir=$2
    if [ -z "$dir" ]; then
        dir="tls_certs"
    fi

    start_node_id=$3
    if [ -z "$start_node_id" ]; then
        start_node_id=0
    fi

    i=$start_node_id
    last_node_id=$((i + $1 - 1))

    while [ $i -le $last_node_id ]; do
        echo "processing replica $i/$last_node_id"
        certDir=$dir/$i

        mkdir -p $certDir

        openssl ecparam -name secp384r1 -genkey -noout -out $certDir/pk.pem

        openssl req -new -key $certDir/pk.pem -nodes -days 365 -x509 \
        -subj "/C=NA/ST=NA/L=NA/O=host_uuid${i}/OU=${i}/CN=node${i}" -out $certDir/node.cert

        openssl enc -base64 -aes-256-cbc -e -in $certDir/pk.pem -K ${KEY} -iv ${IV}  \
                -p -out $certDir/pk.pem.enc 2>/dev/null

        (( i=i+1 ))
    done

    # Create certs for trutil
    echo "processing client for trutil"
    clientDir=$dir/"trutil"
    mkdir -p $clientDir

    openssl ecparam -name secp384r1 -genkey -noout -out $clientDir/pk.pem
    openssl req -new -key $clientDir/pk.pem -nodes -days 36500 -x509 \
        -subj "/C=NA/ST=NA/L=NA/O=NA/OU=trutil/CN=trutil" -out $clientDir/client.cert
    openssl enc -base64 -aes-256-cbc -e -in  $clientDir/pk.pem -K ${KEY} -iv ${IV}  \
        -p -out $clientDir/pk.pem.enc 2>/dev/null

else
    if [ "$#" -le 1 ] || [ -z "$1" ] || [ -z "$2" ]; then
        echo "usage: create_tr_certs.sh {num of TRS nodes} {num of TRC nodes} {optional - output folder}"
        exit 1
    fi

    dir=$3
    if [ -z "$dir" ]; then
        dir="tr_certs"
    fi

    curr_trs_id=1
    end_trs_id=$1
    curr_trc_id=1
    end_trc_id=$2
    while [ $curr_trs_id -le $end_trs_id ]; do
        echo "processing replica $curr_trs_id/$end_trs_id"
        serverDir=$dir/"concord${curr_trs_id}"

        mkdir -p $serverDir

        openssl ecparam -name secp384r1 -genkey -noout -out $serverDir/pk.pem

        openssl req -new -key $serverDir/pk.pem -nodes -days 36500 -x509 \
                -subj "/C=NA/ST=NA/L=NA/O=NA/OU=${curr_trs_id}/CN=concord${curr_trs_id}" -out $serverDir/server.cert

        openssl enc -base64 -aes-256-cbc -e -in  $serverDir/pk.pem -K ${KEY} -iv ${IV}  \
                -p -out $serverDir/pk.pem.enc 2>/dev/null

        (( curr_trs_id=curr_trs_id+1 ))
    done

    while [ $curr_trc_id -le $end_trc_id ]; do
        echo "processing client $curr_trc_id/$end_trc_id"
        clientDir=$dir/"clientservice${curr_trc_id}"

        mkdir -p $clientDir

        openssl ecparam -name secp384r1 -genkey -noout -out $clientDir/pk.pem

        openssl req -new -key $clientDir/pk.pem -nodes -days 36500 -x509 \
                -subj "/C=NA/ST=NA/L=NA/O=NA/OU=clientservice${curr_trc_id}/CN=clientservice${curr_trc_id}" -out $clientDir/client.cert

        openssl enc -base64 -aes-256-cbc -e -in  $clientDir/pk.pem -K ${KEY} -iv ${IV}  \
                -p -out $clientDir/pk.pem.enc 2>/dev/null

        (( curr_trc_id=curr_trc_id+1 ))
    done

    # Create certs for trutil
    echo "processing client for trutil"
    clientDir=$dir/"trutil"
    mkdir -p $clientDir

    openssl ecparam -name secp384r1 -genkey -noout -out $clientDir/pk.pem
    openssl req -new -key $clientDir/pk.pem -nodes -days 36500 -x509 \
        -subj "/C=NA/ST=NA/L=NA/O=NA/OU=trutil/CN=trutil" -out $clientDir/client.cert
    openssl enc -base64 -aes-256-cbc -e -in  $clientDir/pk.pem -K ${KEY} -iv ${IV}  \
        -p -out $clientDir/pk.pem.enc 2>/dev/null

    # concatenate client certificates
    find $dir/clientservice* $dir/"trutil" -type f -name 'client.cert' -exec cat {} + >> client.cert

    # place concatenated client certificates into concord folders
    i=1
    while [ $i -le $end_trs_id ]; do
        cp client.cert $dir/"concord${i}"
        (( i=i+1 ))
    done
    # concatenate server certificates
    find $dir/concord* -type f -name 'server.cert' -exec cat {} + >> server.cert

    # place concatenated server certificates into clientservice folders
    i=1
    while [ $i -le $end_trc_id ]; do
        cp server.cert $dir/"clientservice${i}"
        (( i=i+1 ))
    done
    cp server.cert $dir/"trutil"

    # remove the redundant concatenated server and client certs
    rm -rf server.cert
    rm -rf client.cert
fi
exit 0
