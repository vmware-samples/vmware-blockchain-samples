#### VMware Blockchain and Ethereum Genesis File
The VMware Blockchain genesis file defines the first block in the chain. It contains various configurations that define how the blockchain works.

The genesis file is provided as part of the deployment with default values. Therefore, if operators want to change the default values, they should update the genesis file before deployment.

Currently, the available setting is the free gas mode, enabling the ability not to specify gas fees. See Free Gas Mode.

Todo(Ramki): Do we need the genesis file here in this document?
<details>
    <summary>Sample VMware Blockchain genesis file</summary>

    {
        "config": {
            "chainId": 5000,
            "homesteadBlock": 0,
            "eip155Block": 0,
            "eip158Block": 0
        },
        "alloc": {
            "262c0d7ab5ffd4ede2199f6ea793f819e1abb019": {
            "balance": "12345"
            },
            "5bb088f57365907b1840e45984cae028a82af934": {
            "balance": "0xabcdef"
            },
            "0000a12b3f3d6c9b0d3f126a83ec2dd3dad15f39": {
            "balance": "0x7fffffffffffffff"
            }
        },
        "nonce": "0x000000000000000",
        "difficulty": "0x400",
        "mixhash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "gasLimit": "0xf4240"
    }

</details>

#### Free-Gas Mode
In a public Ethereum network, gas refers to the cost necessary to perform a transaction on the network. Miners set the gas price based on supply and demand for the network's computational power to process smart contracts and other transactions. Requiring a fee for every transaction executed on the network provides a layer of security to the Ethereum network, making it too expensive for malicious users to spam the network.

VMware Blockchain is a private, permissioned, and managed network. Therefore, it is not required to charge for computation power or protect it from malicious use. In addition, the SBFT protocol protects it from byzantine attacks. Since gas fees are not required, VMware Blockchain supports a free-gas mode.

##### Enable Free-Gas Mode
When using the free-gas mode, large contracts do not fail due to lack of gas which is a likely scenario for public Ethereum, and the UI ease of use with tools such as Metamask is enhanced.

Note: Free-gas mode is not enabled by default since some DApps explicitly specify gas.

Todo(Ramki): Do we need this section of updating to Gas Free mode? Default mode is Gas Free mode already
**Procedure (Todo: Update this procedure)**
1. Access the genesis.json file.
    a. The genesis.json file is located in the descriptors directory in VMware Blockchain Orchestrator deployment. The genesis.json file in the descriptors directory overrides the default genesis.json file.
2. Set the gasLimit parameter in the genesis.json to 0x7FFFFFFFFFFFFFFF to enable the free-gas option.
3. After the genesis.json file is defined,  the DApp should not specify the gas, the gas price, or the gas limit in the send transaction APIs. Instead, the system automatically calculates gas using eth_gasPrice and eth_estimateGas.