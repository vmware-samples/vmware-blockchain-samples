#!/bin/bash

openssl req -new -newkey rsa:2048 -nodes -keyout ${1}.priv.pem -out ${1}.csr -subj "/C=US/ST=California/L=Mountain View/O=My Company/OU=IT/CN=${1}"
openssl x509 -signkey ${1}.priv.pem -in ${1}.csr -req -days 365 -out ${1}.crt
openssl x509 -pubkey -noout -in ${1}.crt > ${1}.pub.pem
sha256sum ${1}.pub.pem > ${1}.userid