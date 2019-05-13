/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

const fs = require('fs');
const Web3 = require('web3');
const HttpHeaderProvider = require('httpheaderprovider');
const assert = require('assert');
const helper = require('../AssetTransfer.js');
const exec = require('child_process').exec;


const args = process.argv;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'


deployment_address = 'ADDRESS_PLACEHOLDER';
username = 'USER_PLACEHOLDER';
pass = 'PASSWORD_PLACEHOLDER';


endpoint = deployment_address;
const toBase64 = function (data) {
  const buff = new Buffer(data);
  return buff.toString('base64');
}


const basicAuthEncode = function (user, pass) {
  const header = user + ':' + pass;

  return 'Basic ' + toBase64(header)
}


const basicAuth = basicAuthEncode(username, pass);
const header = {'authorization': basicAuth};
const provider = new HttpHeaderProvider(endpoint, header);


web3 = new Web3();
web3.setProvider(provider);


describe('Contract compilation', function() {
  this.timeout(20000);
  it('.bin and .abi files have been created', (done) => {
    exec('rm AssetTransfer.abi AssetTransfer.bin');
    exec('solc AssetTransfer.sol --abi --bin --optimize -o ./', function(error, data) {
      if(error != null) {
        throw error;
      }
      exec('ls', function(error, stdout, stderr) {
        if(error != null) {
          throw error;
        }
        else if(stdout.indexOf('.abi') < 0 || stdout.indexOf('.bin') < 0) {
          throw ('AssetTransfer.abi or AssetTransfer.bin not found');
        }
        done();
      });
    });
  });
});


describe('Load contract instance', function() {
  this.timeout(20000);
  it('Contract instance loaded', (done) => {
    try{
      contract_instance = web3.eth.contract(JSON.parse(fs.readFileSync('AssetTransfer.abi').toString())).at("http://localhost:7545");
      done();
    }
    catch(e){
      console.log(e);
    }
  });
});