# VMware Privacy SDK
# SDK overview
The Privacy SDK allows JavaScript developers to develop their own privacy applications.

The taxonomy of SDK is shown below:
![Taxonomy of privacy SDK](./docs/SDK-overview.png)

The primary component at the core of the SDK is [Privacy Library](./privacy-lib). The VMware privacy solution is built on cryptographic technology described in [paper](https://eprint.iacr.org/2022/452.pdf). The Privacy Library abstracts away the cryptographic complexity and provides a simple javascript API for Dapp development.

The SDK currently provides a sample NodeJS based DAPP implementation. Future versions will also provide a fully deployable sample Web Browser based DAPP. Sample source code of web browser DAPP is also provided as reference.

## Node-JS based DAPP
![NodeJS DAPP](./docs/sdk-components.png)
### NODEJS App overview
The sample NodeJS dApps are build using [privacy library](privacy-lib/), which is a JavaScript convenience interface to the Privacy Wallet Service. The [Privacy wallet service](https://github.com/vmware/concord-bft/tree/master/utt/privacy-wallet-service) holds all sensitive assets, including privacy keys and tokens. It is essentially a GRPC server and the IDL is specified under [wallet-api.proto](https://github.com/vmware/concord-bft/blob/master/utt/privacy-wallet-service/proto/api/v1/wallet-api.proto).

The Node Administrator dApp and the Node User dApp are samples - VMware Blockchain customers will likely change them in order to create their own privacy applications. The privacy wallet service and the privacy library are not expected to be changed by customers.

| DAPP  | Remark | Location | Docker File | 
| ------------- | ------------- | ------------- |------------- |
| Node Administrator DAPP  | NodeJS based administrator DAPP  | [Admin-Node-DAPP](./admin-dapp/privacy-admin-dapp.js) | [DockerfileAdminDApp](./docker/DockerfileAdminDApp) |
| Node User DAPP  | NodeJS based user DAPP  | [User-Node-DAPP](./user-dapp/privacy-user-dapp.js) | [DockerfileUserDApp](./docker/DockerfileUserDApp) |
| Privacy wallet service | Privacy wallet with support for private tokens | [Privacy wallet service](https://github.com/vmware/concord-bft/tree/master/utt/privacy-wallet-service) | [DockerfilePrivacyService](./docker/DockerfilePrivacyService) |

The administartor DAPP is build with [Admin API](privacy-lib/privacy-admin-wallet.js) of privacy library and smart contract API.

The user DAPP is build with the [user API](privacy-lib/privacy-wallet.js) of privacy library and smart contract API.

 #### Smart contracts
 SDK includes:
 | Contracts  | Remark | Location | 
 | ------------- | ------------- | ------------- |
 | Privacy Token  | Privacy token transfer based smart contract | [PrivateToken.sol](./privacy-lib/contracts/PrivateToken.sol) | 
 | Public Token  | Public token transfer based smart contract | [PublicToken.sol](./privacy-lib/contracts/PublicToken.sol) | 

Some portions of the Privacy Token contract, such as the registration flow, may be changed, but the rest is expected to be used as-is. The Public Token contract can be changed, but the convertPublicToPrivate and convertPrivateToPublic functions must remain.
## Browser based DAPP
SDK will soon support web browser based DAPP sample implementation.
The draft sources are available for reference.

| APP  | Location | Docker File | 
| ------------- | ------------- | ------------- |
| browser user DAPP  | [browser-DAPP](./user-web-dapp/web_client_app.js) | [DockerfileUserWebApp](./docker/DockerfileUserWebApp) |
| browser grpc proxy | [grpc-proxy](./user-web-dapp/envoy.yaml) | [DockerfileEnvoy](./docker/DockerfileEnvoy) |
| Privacy wallet service | [Privacy wallet service](https://github.com/vmware/concord-bft/tree/master/utt/privacy-wallet-service) | [DockerfilePrivacyService](./docker/DockerfilePrivacyService) |

# K8s Helm charts
Privacy application helm charts can be used for kubernetes deployment.

 | Helm charts  | Reference | 
 | ------------- | ------------- |
|[Node-JS APP helm charts](./k8s/helm-charts/Chart.yaml)| [Readme](./k8s/Readme.md) |
| Browser-JS APP helm charts | To be supported soon! |

## Docker files
All the containers are available via artifactory. 
The reference docker files are provided with SDK. 
Users can modify the reference paths based on their container build context to tailor for their environment.
