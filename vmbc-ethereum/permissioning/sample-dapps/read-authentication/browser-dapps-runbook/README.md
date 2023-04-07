#  Chrome and Firefox Browser for HTTP based mTLS with EthRPC

# Overview

HTTP-based mTLS is a secure protocol that combines HTTPS with mutual authentication of both client and server. This provides an extra layer of security to protect against eavesdropping and tampering of data in transit. Both Chrome and Firefox support HTTP-based mTLS, but the steps to set it up and use it may differ.

## Pre-Requisite

- VMware Blockchain for Ethereum has been deployed
- Suggested and Supported Stack:
  - MAC Operating System
  - Metamask Wallet

## Chrome

Chrome uses OS level certificates to communicate with EthRPC through HTTP based mTLS.

To add root certificate and client certificate, follow these steps:

1. On your computer open the Keychain Access application.
2. Navigate to the "Login" section and select "Certificates".
<br> ![Keychain](assets/Keychain.png)

3. Drag and drop the client certificate, client key, and certificate authority into Keychain Access.
4. Double click on the certificates (Client Certificate and Certificate Authority), if you get the following warning "This root certificate isn't trusted" under the trust sub-section set ***When using this certificate*** to ***Always Trust***. Confirm the changes by entering your computer password.
<br> ![Certificate](assets/Keychain_certificate.png)
5. Open Chrome go to Metamask. Click Expand View then open Settings go to Networks and then click the VMBC URL you are trying to connect to. Chrome will pop up a list of certificates that can be used.
6. Click the certificate you have added and then click okay.
<br> ![Chrome](assets/Chrome_select_certificate.png)

7. Change the Metamask network to the VMBC URL, and you should have a successful connection.

### Troubleshooting Guide
- If you face problems related to CORS or some valid scenarios start failing to work during set up, we suggest to reset your chrome browser

## Firefox

Firefox can use OS level certificates to import client certificates and the certificate authority.
To configure Firefox to use client certificates, we first need to:

1. Type *about:config* in the address bar and press return. A warning page may appear. Click ``` Accept the Risk and Continue``` to go to the *about:config* page.
2. Use the search preference name box at the top of the *about:config* page and search ***network.cors_preflight.allow_client_cert***. Then, set ***network.cors_preflight.allow_client_cert*** to ***True***.
<br> ![Certificate](assets/Allow_client_certificate.png)

3. Then, follow the below steps to import your certificate using OS level certificates.

### Firefox OS level certificate

To add root certificate and client certificate using OS level certificates, follow these steps:

1. On your computer open the Keychain Access application.
2. Navigate to the "Login" section and select "Certificates".
<br> ![Keychain](assets/Keychain.png)

3. Drag and drop the certificate authority file into Keychain Access.
4. Generate a `p12` file as mentioned in the section [Generating p12 file](#generating-p12-file). Drag and drop the generated `p12` file into the keychain (Ensure that your client certificate has a dropdown which shows the corresponding client private key)
4. Double click on the certificates (Client Certificate and Certificate Authority), if you get the following warning "This root certificate isn't trusted" under the trust sub-section set ***When using this certificate*** to ***Always Trust***. Confirm the changes by entering your computer password.
<br> ![Certificate](assets/Keychain_certificate.png)
5. If your Firefox browser is running, please quit it and restart the browser application again.
6. Open Firefox navigate to "Settings". Then "Privacy & Security". Scroll down to the "Security" section, then below certificates click ```View Certificates```. Your client certificates should be seen here under the "Your Certificate" tab and your CA should be seen under the "Authorities" tab.
7. Finally make sure metamask is connected to the correct VMware Blockchain URL.
   - While connecting to the VMware Blockchain URL, if you get a prompt for any private key or certificate to use, after selecting, we suggest to quit and restart the Firefox browser application.
   
### Generating p12 file

In order to import a client certificate via Firefox certificate manager you need to use a p12 file. To generate a `p12` file you need to have a client certificate, client key and the CA certificate. 

<br>The following command allows you to generate a p12 file:

```sh
openssl pkcs12 -export -out client.p12 -inkey <client.key> -in <client.crt> -certfile <ca.crt>
```
