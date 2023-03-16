# Privacy admin DAPP 
The admin-dapp is a Nodejs based application that demonstrates the workflow of a privacy application's administrators.
The administrator is responsible for:

- Deploying an instance of privacy and public smart contracts and effectively the privacy application. The users rely on these smart contract addresses to get bootstrapped! 

- Since the administrator is the contract owner he can mint public ERC20 tokens to any users based on their EOA ethereum address.

- The administrator can allocate privacy budgets for any number of users, based on their privacy user identifier (PID). 

# Workflow
## Deploy the privacy application (all smart contracts)

Attach to the container:
```sh
 kubectl exec -it privacy-admin-dapp-0 -c privacy-admin-dapp -- bash
 ```

Deploy the privacy application and check the application information.

```sh
node privacy-admin-dapp.js  deploy
Privacy wallet service grpc:  0.0.0.0:49002
setting callback....
Initializing last know states....
Created eth account for identity: admin address: 0x22dAB3b747b7D0529bf8023F36442228865E666b
configuring privacy application
Deploying privacy app....
Privacy application is already deployed...
Done deploying privacy app....

// show state of the app
node privacy-admin-dapp.js show
Privacy wallet service grpc:  0.0.0.0:49002
setting callback....
Initializing last know states....
Created eth account for identity: admin address: 0x22dAB3b747b7D0529bf8023F36442228865E666b
-------------------------------------
Admin ethereum account address: 0x22dAB3b747b7D0529bf8023F36442228865E666b
Grpc client is UP
Private token contract address:  0x44f95010ba6441e9c50c4f790542a44a2cdc1281
Public contract address:  0x3d8b57c2d58bb8c8e36626b05ff03381734ead43
```

## Create budget
```sh
node privacy-admin-dapp.js create-budget aff312dfede462a2c00b9efab941c5302f06a00cf709e2a1f0891262dd78d833 1000
Privacy wallet service grpc:  0.0.0.0:49002
setting callback....
Initializing last know states....
Created eth account for identity: admin address: 0x22dAB3b747b7D0529bf8023F36442228865E666b
Budget req: {
  userId: 'aff312dfede462a2c00b9efab941c5302f06a00cf709e2a1f0891262dd78d833',
  expirationDate: 1919241632,
  value: '1000'
}
sendTx with identity: admin
Transaction hash :  0xd374af3241ca1f2816331ff7536995f2ba7fc06ea73ab941a303a986617d4757
created budget successfully..
```

## Mint public balance
Note the address for Alice is a public ethereum address. For this testing it can be inferred from Alice's logs or the show command.
```sh
 node privacy-admin-dapp.js mint-public 0x45159Aef48d2337bAedd83a76a764e869073BBa7 1000
Privacy wallet service grpc:  0.0.0.0:49002
setting callback....
Initializing last know states....
Created eth account for identity: admin address: 0x22dAB3b747b7D0529bf8023F36442228865E666b
sendTx with identity: admin
Transaction hash :  0x62fd5636d47826e4063a1e721e6bbd75f90bdf547bce22ebc190fd333b50e6ba
```