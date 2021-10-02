<!-- Copyright 2019 VMware, all rights reserved. -->
<!-- This software is released under MIT license. -->
<!-- The full license information can be found in LICENSE in the root directory of this project. -->

## Flatten Contracts and Upload to VMware blockchain

Update the configuration in verify.js with the correct host and basic authentication username and password.

```
  const username = '<username>';
  const password = '<password>';
  const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

  const options = {
    host: "localhost",
    port: 8080,
    path: "/api/concord/contracts/" + address,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": auth
    }
  };
```

Verify and upload contracts to Helen

```shell
npm run verify_contracts:vmware
```

Or deploy and verify the contracts at the same time

```shell
npm run deploy_and_verify:vmware
```
