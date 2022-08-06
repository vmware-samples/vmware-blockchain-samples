#!/bin/bash
set -e

echo ''
echo '---------------- Creating fluentd service ----------------'
kubectl apply -f fluentd.yml
