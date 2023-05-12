from web3 import Web3, HTTPProvider
w3 = Web3(HTTPProvider('http://127.0.0.1:8545'))
abi='[{"inputs":[{"internalType":"string","name":"message","type":"string"},{"internalType":"address","name":"addr","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"errMsg","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"caller","type":"string"},{"indexed":false,"internalType":"address","name":"addr","type":"address"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"userRegister","type":"event"},{"inputs":[{"internalType":"bytes","name":"message","type":"bytes"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"userPublicKey","type":"bytes"},{"internalType":"bytes","name":"signature","type":"bytes"},{"internalType":"bytes","name":"otp","type":"bytes"}],"name":"isUserRegister","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"publicKey","type":"bytes[]"},{"internalType":"bytes[]","name":"data","type":"bytes[]"},{"internalType":"bytes","name":"userPublicKey","type":"bytes"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"newUserRegisterAdminApprove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"publicKey","type":"bytes[]"},{"internalType":"bytes[]","name":"data","type":"bytes[]"},{"internalType":"bytes","name":"userPublicKey","type":"bytes"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"newUserRegisterUserComplete","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"publicKey","type":"bytes[]"},{"internalType":"bytes[]","name":"data","type":"bytes[]"},{"internalType":"bytes","name":"userPublicKey","type":"bytes"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"newUserRegisterUserStart","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"ethMessageHash","type":"bytes32"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"str","type":"string"}],"name":"test1","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"str","type":"string"}],"name":"test2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"","type":"bytes"}],"name":"userData","outputs":[{"internalType":"bool","name":"register","type":"bool"},{"internalType":"uint256","name":"registerTime","type":"uint256"},{"internalType":"uint256","name":"registerOtpStartTime","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"signer","type":"address"},{"internalType":"bytes","name":"message","type":"bytes"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]'
myContract = w3.eth.contract(address="0x0f15f608F2a999eD92dA44c410A38Be1C4de844d", abi=abi)
myContract.functions.test1("4288372a29124A26D4353EE51BE").call()
#print(response)