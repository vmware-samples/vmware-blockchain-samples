# Ethereum Authentication - supporting mTLS and server TLS for ethrpc
This feature offers three distinct capabilities - which can be combined depending on the user goals. These capabilities are:
- Security for Server authentication - Provides assurances to the application that the end-point is indeed that of VMBC, and that the public key is indeed that of the VMBC EthRPC server.
- Security for Data in Transit - Mechanism to secure communication between the application and the EthRPC server via encrypting data in flight.
- Read permissioning - Mechanism for the blockchain administrators to decide who has read access to the blockchain, via issuing certificates or JWT Tokens to applications/users.

By default, both security mechanisms and read permissioning is turned off.

## Terminology
DApp - Decentralized Application
TLS - Transport Layer Security
mTLS/mutualTLS - Mutual TLS
serverTls - server TLS
CA - Certificate Authority
JWT - JSON Web Token
JWK - JSON Web Key
JWKS - JSON Web Key Set

## User feature
- VMBC Client nodes can be of two different characteristics/modes. These modes are differentiated based on whether the validation of incoming traffic from outside client is done based off server side TLS only or mTLS established.
  - serverTLS mode
    This mode requires server side verification only.
  - mutualTLS mode
    This mode requires server and client side verification.

- An added feature is JWT Token verification. Apart from the above two modes, a client of either mode above may or may not have JWT Token verification. JWT token verification is applicable to both - serverTLS mode and mutualTLS mode. JWT Token verification can be of two types.
  - Verification using external live authorization server
  - Verification using local public key
  
## Deployment
- Generate helm charts using the [k8s orchestrator tool](./../helm-chart).\
See [sample deployment descriptor](./sample-descriptors/deployment.json). The clients can be described as either type as mentioned in the descriptor.
- Install blockchain
```
helm install <name of blockchain> . --set global.imageCredentials.registry=<registry address> --set global.imageCredentials.username=<username> --set global.imageCredentials.password=<password>
```

### Helm chart details
For the clients that are configured with TLS settings, generated Values.yaml would have TLS settings section.\
example:
```
...
## TLS and TokenAuth settings for clients.
clientTlsAndTokenAuthSettings:
  client3:
    type: mutualTLS|serverTLS (Case sensitive)
    clientRootCaCert: |
      <Certificate content>
    serverCert: |
      <Certificate content>
    serverPrivateKeySecret: <Kubernetes Secret For Private Key>
    tokenAuthentication:
      publicJwks: <JWKS Content>
      issuerUri: <Issuer URI>
      issuerCaCert: ''
  client5:
    type: serverTLS|mutualTLS
    clientRootCaCert: |
        <Certificate content>
    serverCert: |
        <Certificate content>
    serverPrivateKeySecret: <Kubernetes Secret For Private Key>
    tokenAuthentication:
      publicJwks: <JWKS Content>
      issuerUri: <Issuer URI>
      issuerCaCert: |
        <Issuer CA Certificate content>
```      
During deployment of blockchain, you may also edit "clientTlsAndTokenAuthSettings" section in Values.yaml to match with Client TLS configuration.

Note: If the charts were generated with no TLS settings, then Values.yaml file would not have clientTlsAndTokenAuthSettings section.

### Validations
Please see the below conditions under which chart generation will be restricted.
- If "tlsAndTokenAuthSettings" block is present, then "type" is mandatory. Valid values for "type" is either "serverTLS" or "mutualTLS".
- If "tlsAndTokenAuthSettings" block is present, then "serverCert" and "serverPrivateKeySecret" is mandatory.
- If "type" is "mutualTLS" then "clientRootCaCert" is mandatory else it is not required.
- If "type" is "serverTLS" then "tokenAuthentication" block is mandatory else it is optional.
- If "publicJwks" is provided then "issuerUri" and "issuerCaCert" are not required.
- If "issuerUri" is provided then "publicJwks" is not required. Either "issuerUri" or "publicJwks" is required.
- If "issuerUri" starts with "http://" then "issuerCaCert" is not required but if it starts with "https://" then "issuerCaCert" is optional.
- Validity of certificates for "serverCert" and "clientRootCaCert" and "issuerCaCert" is checked. Validity of key for "serverPrivateKeySecret" is not checked as it uses pre-applied secret name.
