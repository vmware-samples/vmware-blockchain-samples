cd /var/jenkins/workspace/vmware-blockchain-samples/on-chain-privacy/contracts
solc SupplyChainItem.sol --abi -o SupplyChainItem.abi --overwrite
solc SupplyChainItem.sol --bin -o SupplyChainItem.bin --overwrite
solc SupplyChainItemPrivacy.sol --abi -o SupplyChainItemPrivacy.abi --overwrite
solc SupplyChainItemPrivacy.sol --bin -o SupplyChainItemPrivacy.bin --overwrite
