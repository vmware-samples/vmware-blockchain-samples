# !/bin/bash
if [ ! -d truffle-flattener  ];then
  mkdir truffle-flattener
fi

truffle-flattener contracts/OrdersV1.sol > truffle-flattener/OrdersV1Flattened.sol
truffle-flattener contracts/OrdersProxy.sol > truffle-flattener/OrdersProxyFlattened.sol