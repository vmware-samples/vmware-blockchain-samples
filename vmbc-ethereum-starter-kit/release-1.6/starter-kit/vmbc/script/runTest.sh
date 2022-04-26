cp ../runTest.yml.tmpl ../runTest.yml
kubectl create cm erc20-test-configmap --from-file=../../testing --namespace=vmbc-client1
kubectl apply -f ../runTest.yml --namespace=vmbc-client1
