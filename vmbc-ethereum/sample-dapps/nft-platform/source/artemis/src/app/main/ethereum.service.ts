import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import Config from 'src/assets/config.json';

declare var window: any;
let web3Provider: any;
const gas = 999999999;

@Injectable({
  providedIn: 'root'
})
export class EthereumService {

  web3Provider: any;
  initPromise: Promise<any> = null;
  currentAccount: string = null;
  currentAccountBalance = '-';
  currentSigner: any;
  accounts: string[] = [];
  testAccount;
  jsonrpcProvider: any;
  jsonrpcOnly: boolean = false;

  constructor() {
    this.initialize();
  }

  //sets web3P to web3Provider
  setWeb3Provider(w3P) {
    this.web3Provider = web3Provider = w3P;
  }

  //init()
  async initialize() {
    //metamask handling
    if (window.ethereum) {
      this.setWeb3Provider(new ethers.providers.Web3Provider(window.ethereum));
      await this.waitForEthWindow();
      window.ethereum.on('accountsChanged', _ => {
        console.log('Metamask Account Changed');
        window.location.reload();
      });
      window.ethereum.on('chainChanged', _ => {
        console.log(_);
      });
    } else if(window.web3) { // if deprecated window.web3 provided instead
      this.setWeb3Provider(new ethers.providers.Web3Provider(window.web3));
    } else {
      //throw new Error('Non-valid/Ethereum browser extension detected. Use MetaMask!');
      this.jsonrpcOnly = true;
    }

    this.jsonrpcProvider = new ethers.providers.JsonRpcProvider(Config.BLOCKCHAIN_URL);
    this.jsonrpcProvider.getBlockNumber().then((result) => {
      console.log("Current block number: " + result);
    });

    // account handling
    if (this.jsonrpcOnly) {
      this.currentAccount = '0x5a51Ed9DD3bAC1cdf3Ae4e01593e95d81337dfDD';
      console.log("jsonrpc current account: " + this.currentAccount);
    } else {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        await this.getAccounts();
      } catch (e) {
        console.log(e);
      }
    }
  }

  //enables window.ethereum
  async waitForEthWindow() {
    if (this.initPromise === null) { return; }
    this.initPromise = window.ethereum.enable();
    await this.initPromise;
    this.initPromise = null;
  }

  //getting current account
  async getAccounts() {
    this.accounts = await web3Provider.listAccounts();
    this.currentAccount = this.accounts[0];
    console.log("web3 current account: " + this.currentAccount);
    // await this.getAccountBalance(this.currentAccount);
    this.currentSigner = await this.web3Provider.getSigner(this.currentAccount);
  }

  //uses account of user
  createAccount() {
    return this.web3Provider.getSigner(this.currentAccount);
  }

  //TODO: sending ethers doesn't seem to work currently
  sendEth(account, to: string, amount: string) {
    return new Promise<any>(async resolve => {
      const tx = { from: account.address, to, gas, value: ethers.utils.parseUnits(amount, 'wei') };
      account.signTransaction(tx, (e, signedTx) => {
        if (e) { return resolve({ status: 'error', error: e }); }
        web3Provider
          .sendTransaction(signedTx.raw || signedTx.rawTransaction)
          .on('receipt', receipt => { resolve({ status: 'ok', receipt }); })
          .on('error', error => { resolve({ status: 'error', error }); });
      }).catch(error => { resolve({ status: 'error', error }); });
    });
  }

  //TODO: fix for testing purposes
  submit(account, to: string, data: string) {
    return new Promise<any>(async resolve => {
      const tx = { from: account.address, to, gas, data };
      account.signTransaction(tx, (e, signedTx) => {
        if (e) { return resolve({ status: 'error', error: e }); }
        web3Provider
          .sendTransaction(signedTx.raw || signedTx.rawTransaction)
          .on('receipt', receipt => { resolve({ status: 'ok', receipt }); })
          .on('error', error => { resolve({ status: 'error', error }); });
      }).catch(error => { resolve({ status: 'error', error }); });
    });
  }

  //TODO: see TODO for submit function
  testerSubmit(to: string, data: string) {
    return this.submit(this.testAccount, to, data);
  }

  //creates random test account
  testerLoadAccount() {
    this.testAccount = this.createAccount();
  }

  //parses balance for UI
  parseBalance(strBalance: string) {
    let bal = strBalance.toString();
    let nat = '0';
    let dec = '0';
    if (bal.length > 18) {
      nat = bal.slice(0, bal.length - 18);
      dec = bal.slice(bal.length - 18).substring(0, 4);
    } else {
      nat = '0';
      dec = bal.slice(0, 4);
    }
    while (dec.endsWith('0') || dec.endsWith('.')) {
      dec = dec.substring(0, dec.length - 1);
    }
    return `${nat}.${dec}`;
  }

}
