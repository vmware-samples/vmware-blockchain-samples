import { Injectable } from '@angular/core';
import { AppService } from '../ganymede/components/services/app.service';
import { rx } from '../ganymede/components/util/common/ngrx.stores';
import { ethers } from '@vmware-blockchain/ethers';

declare var window: any;
let web3Provider: any;
const gas = 999999999;

export class EthDataCollection {
  static namespace = 'eth';
  static rx: rx.StoreEntry<EthDataCollection>;
  static registered = true ? EthDataCollection.rxRegister() : false;
  static rxRegister() { return this.registered ? null : this.rx = new rx.StoreEntry(this.namespace, this); }

  account = {
    balance: new rx.Data<any>({ firstValue: {}, actions: {
      FETCH: new rx.Action<string>({}, async (e: rx.ActionArgs<string>) => {
        const data = e.data;
        const key = e.params.key;
        let newBalance = await web3Provider.getBalance(key);
        if (newBalance) {
          newBalance = e.params.ethServiceGetter().parseBalance(newBalance);
        }
        const newVal = rx.setkv(data.v, e.params.key, newBalance);
        data.setValue(newVal);
        if (e.params.ondata) {
          e.params.ondata(newVal[key], e);
        }
        return newVal;
      })
    }})
  };
}

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

  constructor(public app: AppService) {
    this.initialize();

    //subscribes to rx store changes
    this.app.store.eth.account.balance.data$.subscribe(balances => {
      if (balances[this.currentAccount]) {
        this.currentAccountBalance = balances[this.currentAccount];
      }
    });
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
    } else if(window.web3) { //if deprecated window.web3 provided instead
      this.setWeb3Provider(new ethers.providers.Web3Provider(window.web3));
    } else {
      throw new Error('Non-valid/Ethereum browser extension detected. Use MetaMask!');
    }

    //account handling
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    await this.getAccounts();
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
    await this.getAccountBalance(this.currentAccount);
    this.currentSigner = await this.web3Provider.getSigner(this.currentAccount);
  }

  //account balance
  async getAccountBalance(address: string) {
    return new Promise<string>(resolve => {
      rx.invoke(this.app.store.eth.account.balance.actions.FETCH, {
        key: address,
        ethServiceGetter: () => this,
        ondata: balance => { resolve(balance); },
      });
    });
  }

  //creates random test account and connects account with web3Provider
  createAccount() {
    return ethers.Wallet.createRandom().connect(this.web3Provider);
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
