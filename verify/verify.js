var fs = require("fs");
var http = require("http");

verifyMigrations();
verifyOrdersV1();
verifyOrdersProxy()

function verify(data, address) {
    var username = '<username>';
    var password = '<password>';
    var auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

    var options = {
        host: "localhost",
        port: 8080,
        path: "/api/concord/contracts/" + address,
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": auth
        }
    };

    const req = http.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);
        console.log(`statusCode: ${res}`);
    });

    req.on("error", (error) => {
        console.error(error)
    });

    req.write(data);
    req.end();
}

function verifyMigrations() {
    var content = fs.readFileSync("./build/contracts/Migrations.json");
    var sourcecode = fs.readFileSync("./contracts/Migrations.sol").toString();
    var jsonContent = JSON.parse(content);
    var address = jsonContent.networks[5000].address;

    var data = JSON.stringify({
        "contract_id": "Migrations",
        "compiler_version": "v0.4.25+commit.59dbf8f1",
        "sourcecode": sourcecode,
        "contract_name": "Migrations",
        "is_optimize": false,
        "runs": "200"
    });
    verify(data, address);
}

function verifyOrdersV1() {
    var content = fs.readFileSync("./build/contracts/OrdersV1.json");
    // Generate this file with the command
    // "truffle-flattener contracts/OrdersProxy.sol > truffle-flattener/OrdersProxyFlattened.sol"
    var sourcecode = fs.readFileSync("./truffle-flattened/OrdersV1Flattened.sol").toString();
    var jsonContent = JSON.parse(content);
    var address = jsonContent.networks[5000].address;

    var data = JSON.stringify({
        "contract_id": "OrdersV1",
        "compiler_version": "v0.4.25+commit.59dbf8f1",
        "sourcecode": sourcecode,
        "contract_name": "OrdersV1",
        "is_optimize": false,
        "runs": "200"
    });
    verify(data, address);
}

function verifyOrdersProxy() {
    var content = fs.readFileSync("./build/contracts/OrdersProxy.json");
    // Generate this file with the command
    // "truffle-flattener contracts/OrdersProxy.sol > truffle-flattener/OrdersProxyFlattened.sol"
    var sourcecode = fs.readFileSync("./truffle-flattened/OrdersProxyFlattened.sol").toString();
    var jsonContent = JSON.parse(content);
    var address = jsonContent.networks[5000].address;

    var data = JSON.stringify({
        "contract_id": "OrdersProxy",
        "compiler_version": "v0.4.25+commit.59dbf8f1",
        "sourcecode": sourcecode,
        "contract_name": "OrdersProxy",
        "is_optimize": false,
        "runs": "200"
    });
    verify(data, address);
}