const fs = require('fs');
const https = require('https');
const Web3 = require("web3");
const Web3HttpProvider = require('web3-providers-http');
const Web3WsProvider = require('web3-providers-ws');
const { Issuer, errors: { OPError } } = require('openid-client');
const config = require('./config.json');
const { exit } = require('process');

const oauthUsername = config.clientJwt.authUsername;
const oauthPassword = config.clientJwt.authPassword;

const serverCaCert = config.tls.serverCaCertPath;
const clientKey = config.tls.clientKeyPath;
const clientCert = config.tls.clientCertPath;

var abi, account;

const getJwtToken = async () => {
  console.log("\x1b[32m%s\x1b[0m", "\n========== Fetching Access Token from Auth Server ==========");
  // Fetches the .well-known endpoint for endpoints, issuer value etc.
  const authEndpointInfo = await Issuer.discover(config.clientJwt.authDiscoveryUrl);

  // Instantiates a client
  const client = new authEndpointInfo.Client({
    client_id: config.clientJwt.clientId,
    token_endpoint_auth_method: 'none',
    id_token_signed_response_alg: 'RS256',
  });

  const response = await client.grant({
    grant_type: 'password',
    username: oauthUsername,
    password: oauthPassword,
  });

  const accessToken = response.access_token;
  return accessToken;
}

const createHttpOptions = async (tlsMode, jwtEnabled, accessToken) => {
  var options = {};

  // Header containing access token
  let authHeaderHttp = { name: "Authorization", value: `Bearer ${accessToken}` };
  
  if (jwtEnabled) {
    options.headers = [authHeaderHttp];
  }

  var httpsAgentOptions = {};
  if (tlsMode == "serverTLS") {
    httpsAgentOptions.ca = fs.readFileSync(serverCaCert);
  } else if (tlsMode == "mutualTLS") {
    httpsAgentOptions.ca = fs.readFileSync(serverCaCert);
    httpsAgentOptions.key = fs.readFileSync(clientKey);
    httpsAgentOptions.cert = fs.readFileSync(clientCert);
  }

  options.agent = {};
  options.agent.https = https.Agent(httpsAgentOptions);

  return options;
}

const createHttpProvider = async (accessToken) => {
  const httpsEndpoint = `https://${config.jsonrpc.endpointHost}:${config.jsonrpc.ports.http}`;
  console.log("httpsEndpoint is " + httpsEndpoint);

  var options = await createHttpOptions(config.tls.mode, config.clientJwt.enabled, accessToken);
   
  const provider =  new Web3HttpProvider(httpsEndpoint, options);
  const web3 = new Web3(provider);
  return web3;
}

const createWsOptions = async (tlsMode, jwtEnabled, accessToken) => {
  var options = {};

  // Header containing access token
  let authHeaderWs = { "Authorization": `Bearer ${accessToken}` };
  
  if (jwtEnabled) {
    options.headers = authHeaderWs;
  }

  var wsTlsOptions = {};
  if (tlsMode == "serverTLS") {
    wsTlsOptions.ca = fs.readFileSync(serverCaCert);
  } else if (tlsMode == "mutualTLS") {
    wsTlsOptions.ca = fs.readFileSync(serverCaCert);
    wsTlsOptions.key = fs.readFileSync(clientKey);
    wsTlsOptions.cert = fs.readFileSync(clientCert);
  }

  options.clientConfig = {};
  options.clientConfig.tlsOptions = wsTlsOptions;

  return options;
}

const createWsProvider = async (accessToken) => {
  const wsUrl = `wss://${config.jsonrpc.endpointHost}:${config.jsonrpc.ports.ws}`;
  console.log("wssEndpoint is " + wsUrl);

  optionsWs = await createWsOptions(config.tls.mode, config.clientJwt.enabled, accessToken);
  
  var wsProvider = new Web3WsProvider(wsUrl, optionsWs);
  const web3Ws = new Web3(wsProvider);
  return web3Ws;
}

const deployContract = async (accessToken) => {
  // Import the contract file
  const contractFile = require('../lib/compile');

  //  Save the bytecode and ABI
  const bytecode = contractFile.evm.bytecode.object;
  abi = contractFile.abi;

  console.log("\x1b[32m%s\x1b[0m", "\n========== Deploying contract using https endpoint ==========");

  web3 = await createHttpProvider(accessToken);
  
  // Generate a random account
  account = web3.eth.accounts.create();

  const incrementer = new web3.eth.Contract(abi);
  const incrementerDeployTx = incrementer.deploy({
    data: bytecode,
    arguments: [5],
  });
  const deployContractTx = await web3.eth.accounts.signTransaction(
    {
      from: account.address,
      data: incrementerDeployTx.encodeABI(),
      gas: '4712388',
    },
    account.privateKey
  );
  const txReceipt = await web3.eth.sendSignedTransaction(
    deployContractTx.rawTransaction
  );
  return txReceipt.contractAddress;
}

const subscribeToLogs = async (accessToken, contractAddress) => {
  console.log("\x1b[32m%s\x1b[0m", "\n========== Subscribing to logs of deployed contract using wss endpoint ==========");
  web3Ws = await createWsProvider(accessToken);

  var subcribeOptions = {
    address: contractAddress,
  };

  web3Ws.eth.subscribe('logs', subcribeOptions, function (error, result) {
    if (error)
      console.log(error);
  }).on("data", function (log) {
    console.log("\x1b[32m%s\x1b[0m", "\n========== Received data from websocket ==========");
    console.log("Received log: " + JSON.stringify(log));
    console.log("Successfully received logs on websocket subscription");
    exit(0);
  }).on("changed", function (log) {
    console.log('changed');
  });
}

const sendSampleTransaction = async (contractAddress) => {
  console.log("\x1b[32m%s\x1b[0m", "\n========== Sending a sample transaction ==========");
  // Build increment tx
  const incrementValue = 1000
  const deployedContractInstance = new web3.eth.Contract(abi, contractAddress)
  const incrementTx = deployedContractInstance.methods.increment(incrementValue);

  //  Create increment function
  console.log(
    `Calling the increment by ${incrementValue} function in contract at address: ${contractAddress}`
  );

  // Sign Tx with Private Key
  const signedIncrementTx = await web3.eth.accounts.signTransaction(
    {
      to: contractAddress,
      data: incrementTx.encodeABI(),
      gas: await incrementTx.estimateGas(),
    },
    account.privateKey
  );

  // Send Tx and Wait for Receipt
  const incrementTxReceipt = await web3.eth.sendSignedTransaction(signedIncrementTx.rawTransaction);
  console.log(`Tx successful with hash: ${incrementTxReceipt.transactionHash}`);
}

const main = async () => {
  try {
    var accessToken = "";
    if (config.clientJwt.enabled) {
      accessToken = await getJwtToken();
      console.log("Access Token received from Auth Server is: " + accessToken);
    }

    var contractAddress = await deployContract(accessToken);
    console.log("Contract deployed at address: " + contractAddress);

    await subscribeToLogs(accessToken, contractAddress);

    await sendSampleTransaction(contractAddress);
  } catch (err) {
    console.error(err);
    exit(1);
  }
}

main();

