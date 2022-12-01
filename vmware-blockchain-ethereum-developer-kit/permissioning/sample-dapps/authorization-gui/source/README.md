# Read/Write Permissioning Sample Dapp Ui

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.11.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build and run

```sh
    npm install
    export VMBC_URL=http://x.x.x.x:8545
    npm run start
```

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Permissioning UI

We have two projects inside the permissioning ui. The first is the permissioning config and the second one is the ERC20 test dapp. The permissioning config is used to give addresses permission to read, write and/or deploy in the blockchain. The ERC20 test dapp is a normal ERC20 dapp that is used to show the capabilities of permissioning.

## Metamask

Make sure you are connected to the right VMBC URL through metmask.

## Permissioning Config

Note: The project has to be built and deployed using ng serve. Then  navigate to `http://localhost:4200/`.

Inorder to use the permissioning config there are a few steps.

Prerequiste: Current metamask account needs to be the admin account.

1. The admin account is the only account that is able to give READ, WRITE or DEPLOY permission to an address. Make sure your Metamask is connected to VMBC URL and the current account is the admin account.
2. Provide an address in the "From Address" input field.
3. You can click the "CHECK PERMISSIONS" button to check the current permissions of the provided address.
4. Inorder to give a permission to the address make sure the checkbox is checked on the permission. Then click the "SET PERMISSIONS" button.  Metamask will popup and hit approve then you should see a message that shows the transaction was successfull.
5. Click "CHECK PERMISSIONS" again to see if the address has the correct permissions.
6. To remove a permission make sure the checkbox for the permission is unchecked then hit the "SET PERMISSIONS" button.

### Troubleshoot

Failed Transaction: If you get a failed transaction message, check the data.
* If you see the error message "Not an Admin" make sure the metamask account that is currently being used is an admin account.


## ERC20 Test Dapp - Write Enabled

Note: The project has to be built and deployed using ng serve. Then  navigate to `http://localhost:4200/`.

Inorder to use the ERC20 Test Dapp there are a few steps we need to follow. You would need an ERC20 contract. You need to deploy it then use it's contract address inside of the ERC20 Test Dapp.

1. Give the address that you'll be using to deploy the ERC20 contract permission to deploy. You can do this through the Permissioning Config ui.
2. Deploy any ERC20 Smart Contract on VMBC blockchian(Same blockchain metmask is connected to) using the address that was given permision to deploy.
3. Copy contract address and provide it in variable "contractAddress" found in src/app/dapp/dapp.component.ts. 
4. Save file and run ng serve.
5. Navigate to ERC20 Test Dapp found on the left pane.
Note: The From Adress is taken from your current metmask account and the contract address is the ERC20 Smart Contract address deployed in step 2.
6. Using the permissioning config give the from address write permission.
7. The "Get Token Balance" button allows you to check the balance of the current user(From Address/Current Metamask Acoount).
8. The Transfer Tokens button enables you to send ERC20 tokens to the address provided in the "To Address" input field. Click the transfer button metamask pops up the click approve.

### Troubleshoot

Failed Transaction: If you get a failed transaction message, check the message and data.
 * If it says "Permission denied", this means you didnt give your current address write permission(got to step 6).
 * If it says "ERC20: transfer amount exceeds balance", the current address doesn't have enough tokens.

## ERC20 Test Dapp - Write Disabled

Note: The project has to be built and deployed using ng serve. Then  navigate to `http://localhost:4200/`.

Inorder to use the ERC20 Test Dapp there are a few steps we need to follow. You would need an ERC20 contract. You need to deploy it then use it's contract address inside of the ERC20 Test Dapp.

1. Deploy any ERC20 Smart Contract on VMBC blockchian(Same blockchain metmask is connected to)
2. Copy contract address and provide it in variable "contractAddress" found in src/app/dapp/dapp.component.ts. 
3. Save file and run ng serve.
4. Navigate to ERC20 Test Dapp found on the left pane.
Note: The From Adress is taken from your current metmask account and the contract address is the ERC20 Smart Contract address deployed in step 1.
5. The Get Token Balance button allows you to check the balance of the current user(From Address/Current Metamask Acoount)
6. The Transfer Tokens button enables you to send ERC20 tokens to the address provided in the "To Address" input field. Click the transfer button metamask pops up the click approve.

### Troubleshoot

Failed Transaction: If you get a failed transaction message, check the message and data.
 * If it says "ERC20: transfer amount exceeds balance", the current address doesn't have enough tokens.
