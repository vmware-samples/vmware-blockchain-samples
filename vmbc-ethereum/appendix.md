# Appendix

## Connecting Metamask to VMBC

Metamask is available on Google Chrome as an extension, and this is a key requirement
to this NFT sample.

If you have never added your VMware Blockchain's URL and the Chain ID (default 5000)
as a separate network on Metamask, you can click on user profile picture to open the
dropdown menu and click `Settings` > `Networks` > `Add Network` > `Add Network Manually`
and provide:

- Network Name: (Can be freely chosen)
- New RPC URL: (Your blockchain's EthRPC URL aka. `VMBC_URL`)
- Chain ID: (Your blockchain's `chainId`, default is usually 5000)
- Currency Symbol: (Can be freely chosen)
- Block explorer URL: (optional)

Metamask might not have connected ever on localhost:4200 site, if this is the case,
you can connect Metamask to the dev site by clicking on `Not Connected` status icon
and clicking `Connect`

## Resetting Account in Metamask
- How to Reset an Account in Metamask - [Article from Metamask](https://metamask.zendesk.com/hc/en-us/articles/360015488891-How-to-reset-an-account)
    - Perform this step of Resetting you Metamask account
    - **Note**: This is required because of a Limitation in Metamask that, when an already connected/linked Blockchain Network is reset/re-installed, Metamask still uses old and cached nonce for accounts. Essentially, by resetting the accounts, we are requesting Metamask to dynamically determine the nonce, rather than using an old cache.

## Importing Accounts in Metamask
- How to Import Accounts in Metamask - [Article from Metamask](https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-account)