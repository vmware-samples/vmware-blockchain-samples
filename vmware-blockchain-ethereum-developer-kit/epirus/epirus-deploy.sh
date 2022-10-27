#!/bin/bash

kubectl create namespace vmbc-epirus
NAMESPACE="vmbc-epirus"


cp epirus-net-networkpolicy.yml.tmpl epirus-net-networkpolicy.yml
cp api-deployment.yml.tmpl api-deployment.yml
cp ingestion-deployment.yml.tmpl ingestion-deployment.yml
cp mongodb-deployment.yml.tmpl mongodb-deployment.yml
cp web-deployment.yml.tmpl web-deployment.yml

kubectl apply -f api-deployment.yml,epirus-net-networkpolicy.yml,ingestion-deployment.yml,mongodb-deployment.yml,web-deployment.yml
