/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

const fs = require("fs");
const https = require("https");
const timestamp = new Date().getTime();

verifyMigrations();
verifyOrdersV1();
verifyOrdersProxy()

function verify(data, address) {
  const username = '<username>';
  const password = '<password>';
  const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

  const options = {
    host: "localhost",
    port: 443,
    path: "/blockchains/local/api/concord/contracts/" + address,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": auth
    }
  };

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
  });

  req.on("error", (error) => {
    console.error(error)
  });

  req.write(data);
  req.end();
}

function verifyMigrations() {
  const content = fs.readFileSync("./build/contracts/Migrations.json");
  const sourcecode = fs.readFileSync("./contracts/Migrations.sol").toString();
  const jsonContent = JSON.parse(content);
  const address = jsonContent.networks[5000].address;

  const data = JSON.stringify({
    "contract_id": `Migrations-${timestamp}`,
    "compiler_version": "v0.4.25+commit.59dbf8f1",
    "sourcecode": sourcecode,
    "contract_name": "Migrations",
    "is_optimize": false,
    "runs": "200"
  });
  verify(data, address);
}

function verifyOrdersV1() {
  const content = fs.readFileSync("./build/contracts/OrdersV1.json");
  // Generate this file with the command
  // "truffle-flattener contracts/OrdersV1.sol > truffle-flattener/OrdersV1Flattened.sol"
  const sourcecode = fs.readFileSync("./truffle-flattener/OrdersV1Flattened.sol").toString();
  const jsonContent = JSON.parse(content);
  const address = jsonContent.networks[5000].address;

  const data = JSON.stringify({
    "contract_id": `OrdersV1-${timestamp}`,
    "compiler_version": "v0.4.25+commit.59dbf8f1",
    "sourcecode": sourcecode,
    "contract_name": "OrdersV1",
    "is_optimize": false,
    "runs": "200"
  });
  verify(data, address);
}

function verifyOrdersProxy() {
  const content = fs.readFileSync("./build/contracts/OrdersProxy.json");
  // Generate this file with the command
  // "truffle-flattener contracts/OrdersProxy.sol > truffle-flattener/OrdersProxyFlattened.sol"
  const sourcecode = fs.readFileSync("./truffle-flattener/OrdersProxyFlattened.sol").toString();
  const jsonContent = JSON.parse(content);
  const address = jsonContent.networks[5000].address;

  const data = JSON.stringify({
    "contract_id": `OrdersProxy-${timestamp}`,
    "compiler_version": "v0.4.25+commit.59dbf8f1",
    "sourcecode": sourcecode,
    "contract_name": "OrdersProxy",
    "is_optimize": false,
    "runs": "200"
  });
  verify(data, address);
}
