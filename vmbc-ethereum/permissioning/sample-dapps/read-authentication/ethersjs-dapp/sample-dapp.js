const fs = require('fs');
const https = require('https');

const { Issuer, errors: { OPError } } = require('openid-client');
const config = require('./config.json');
const { exit } = require('process');
const ethers = require('ethers');
const WebSocket = require('ws');
const oauthUsername = config.clientJwt.authUsername;
const oauthPassword = config.clientJwt.authPassword;
let contract = {};
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

const createHttpProvider = async (accessToken) => {
  const httpsEndpoint = `https://${config.jsonrpc.endpointHost}:${config.jsonrpc.ports.http}`;
  console.log("httpsEndpoint is " + httpsEndpoint);

  let connection = {};
  connection.url = httpsEndpoint;
  connection.headers = { "Authorization": `Bearer ${accessToken}` };

  const provider = new ethers.providers.StaticJsonRpcProvider(connection, 5000);
  return provider;
}

const createWsProvider = async (accessToken) => {
  const wsUrl = `wss://${config.jsonrpc.endpointHost}:${config.jsonrpc.ports.ws}`;
  console.log("wssEndpoint is " + wsUrl);
  let connection = {};
  connection.url = wsUrl;
  connection.headers = { "Authorization": `Bearer ${accessToken}` };
  const ws = new WebSocket(wsUrl, {headers: connection.headers});
  var wsProvider = new ethers.providers.WebSocketProvider(ws);
  return wsProvider;
}

const deployContract = async (accessToken) => {
  // Import the contract file
  const contractFile = require('../lib/compile');

  //  Save the bytecode and ABI
  const bytecode = contractFile.evm.bytecode.object;
  abi = contractFile.abi;

  console.log("\x1b[32m%s\x1b[0m", "\n========== Deploying contract using https endpoint ==========");

  provider = await createHttpProvider(accessToken);
  
  // Todo: Generate a random account
  let wallet = new ethers.Wallet("179c264c1a403578eb17d82b70a00eb1b1541f2f7533beb4dde8739ee166e0ee", provider);

  const incrementer = new ethers.ContractFactory(abi, bytecode, wallet);

  contract = await incrementer.deploy([5]);
  await contract.deployed();

  console.log(`Contract deployed at address: ${contract.address}`);
  return contract.address;
}

const subscribeToLogs = async (accessToken, contractAddress) => {
  console.log("\x1b[32m%s\x1b[0m", "\n========== Subscribing to logs of deployed contract using wss endpoint ==========");
  const  web3Ws = await createWsProvider(accessToken);

  let contractInstanceForWs = new ethers.Contract(contractAddress, abi, web3Ws);
  contractInstanceForWs.on("*", (log) => {
    console.log("\x1b[32m%s\x1b[0m", "\n========== Received data from websocket ==========");
    console.log("Received log: " + JSON.stringify(log));
    console.log("Successfully received logs on websocket subscription");
    exit(0);
  });

  console.log(`Successfully subscribed to logs for contract with contract address : ${contractAddress}`);
}

const sendSampleTransaction = async () => {
  console.log("\x1b[32m%s\x1b[0m", "\n========== Sending a sample transaction ==========");
  txResponse = await contract.increment(8);
  console.log(`Tx successful with hash: ${txResponse.hash}`);
}

const main = async () => {
  try {
    var accessToken = "";
      accessToken = await getJwtToken();
      console.log("Access Token received from Auth Server is: " + accessToken);

    var contractAddress = await deployContract(accessToken);
    console.log("Contract deployed at address: " + contractAddress);

    await subscribeToLogs(accessToken, contractAddress);

    await sendSampleTransaction();
  } catch (err) {
    console.error(err);
    exit(1);
  }
}

main();