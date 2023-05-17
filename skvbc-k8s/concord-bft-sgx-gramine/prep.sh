cp ~/concord-bft/build/tests/simpleKVBC/TesterReplica/skvbc_replica .
cp ~/concord-bft/build/tests/simpleTest/scripts/create_tls_certs.sh .
cp -r ~/concord-bft/build/tests/simpleKVBC/scripts/certs .
cp ~/concord-bft/build/tools/GenerateConcordKeys .

rm -f ~/.config/gramine/enclave-key.pem
gramine-sgx-gen-private-key
cp ~/.config/gramine/enclave-key.pem .
