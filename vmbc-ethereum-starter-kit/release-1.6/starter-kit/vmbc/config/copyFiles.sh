#!/bin/bash

cp -r ../../../../../docker/operator_signing_keys .
cp -r ../../../../../docker/transaction_signing_keys .
cp -r ../../../../../docker/clientservice .
cp -r ../../../../../docker/config-participant0 . 

cp -r ../../../../../docker/config-concord1 .
cp -r ../../../../../docker/config-concord2 .
cp -r ../../../../../docker/config-concord3 .
cp -r ../../../../../docker/config-concord4 .

cp -r ../../../../../docker/config-ethrpc1 .
cp -r ../../../../../docker/config-public .
cp ../../../../../docker/config-participant0/participant.config config-public/
