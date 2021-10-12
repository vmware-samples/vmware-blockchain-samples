# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `yarn build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
<!--
Copyright 2019 VMware, all rights reserved.
This software is released under MIT license.
The full license information can be found in LICENSE in the root directory of this project.
 -->

# VMware Blockchain Samples

Here you will find DApp and Smart Contract samples of how to deploy and interact with VMware blockchain or other Ethereum compatible blockchains.

### Table of Contents

1. [Asset Transfer Contract](./asset-transfer)

   - This is our most simple example of how to compile and deploy one contract.

2. [Supply Chain DApp](./supply-chain)

   - This is a complete example of how to deploy multiple contracts using the popular contract framework truffle.

   - With this sample DApp you can learn contract versioning, access control and document storage all with a complete (UI) interface.

   - There is a [HANDSON](./suppl-chain/HANDSON.md) document that will walk you through the use cases.

3. [Verify and Upload Contracts](./supply-chain/verify)

   - The verify contract example is similar to how users post their contracts on [Etherscan](https://etherscan.io/verifyContract), but posting to VMware blockchain instead and being able to view the verified contracts in the VMware Blockchain UI.



### known Issues
  1. Https Mode Cloning
     - When the repo is cloned using `git clone https://github.com/vmware-samples/vmware-blockchain-samples.git` https mode, then `yarn install` will fail with following error.
       ```shell
        error Command failed.
        Exit code: 128
        Command: git
        Arguments: ls-remote --tags --heads ssh://git@github.com/ethereumjs/ethereumjs-abi.git
        Directory: /Users/snallayan/Work/vmbc/vmware-blockchain-samples/erc20-swap
        Output:
        git@github.com: Permission denied (publickey).
        fatal: Could not read from remote repository.

        Please make sure you have the correct access rights
        and the repository exists.
       ```
       This is due to `ethereumjs-abi` dependency which needs to be downloaded in ssh mode.
       As a fix,  Adding github identity with ssh-add solves the issue.

       `ssh-add -K <path to private key>`
       ```
       $ ssh-add -K ~/.ssh/github
        Identity added: /Users/abc/.ssh/github
       ```
