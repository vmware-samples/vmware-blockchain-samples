import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { AppService } from '../ganymede/components/services/app.service';
import { rx } from '../ganymede/components/util/ngrx.stores';

declare var window: any;
let web3: any;
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
        let newBalance = await web3.eth.getBalance(key);
        if (newBalance) { newBalance = e.params.ethServiceGetter().parseBalance(newBalance); }
        const newVal = rx.setkv(data.v, e.params.key, newBalance);
        data.setValue(newVal);
        if (e.params.ondata) { e.params.ondata(newVal[key], e); }
        return newVal;
      })
    }})
  };

}

@Injectable({
  providedIn: 'root'
})
export class EthereumService {

  web3: any;
  initPromise: Promise<any> = null;
  currentAccount: string = null;
  currentAccountBalance = '-';
  accounts: string[] = [];
  testAccount;

  constructor(public app: AppService) {
    this.initialize();
    this.app.store.eth.account.balance.data$.subscribe(balances => {
      if (balances[this.currentAccount]) { this.currentAccountBalance = balances[this.currentAccount]; }
    });
  }

  setWeb3(w3) {
    this.web3 = web3 = w3;
  }

  async initialize() {
    if (window.ethereum) {
      this.setWeb3(new Web3(window.ethereum));
      await this.waitForProvider();
      window.ethereum.on('accountsChanged', _ => {
        console.log('Metamask Account Changed');
        window.location.reload();
      });
      window.ethereum.on('chainChanged', _ => {
        console.log(_);
      });

    } else if (window.web3) {
      this.setWeb3(new Web3(web3.currentProvider));
    } else {
      throw new Error('Non-Ethereum browser detected. Use MetaMask!');
    }
    await this.getAccounts();
  }

  async waitForProvider() {
    if (this.initPromise === null) { return; }
    this.initPromise = window.ethereum.enable();
    await this.initPromise;
    this.initPromise = null;
  }

  async getAccounts() {
    this.accounts = await web3.eth.getAccounts();
    this.currentAccount = this.accounts[0];
    await this.getAccountBalance(this.currentAccount);
  }

  createAccount() {
    return web3.eth.accounts.create();
  }

  async getAccountBalance(address: string) {
    return new Promise<string>(resolve => {
      rx.invoke(this.app.store.eth.account.balance.actions.FETCH, {
        key: address,
        ethServiceGetter: () => this,
        ondata: balance => { resolve(balance); },
      });
    });
  }

  sendEth(account, to: string, amount: string) {
    return new Promise<any>(async resolve => {
      const tx = {from: account.address, to, gas, value: web3.utils.toWei(amount, 'ether') };
      account.signTransaction(tx, (e, signedTx) => {
        if (e) { return resolve({ status: 'error', error: e }); }
        web3.eth
          .sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
          .on('receipt', receipt => { resolve({ status: 'ok', receipt }); })
          .on('error', error => { resolve({ status: 'error', error }); });
      }).catch(error => { resolve({ status: 'error', error }); });
    });
  }

  submit(account, to: string, data: string) {
    return new Promise<any>(async resolve => {
      const tx = { from: account.address, to, gas, data };
      account.signTransaction(tx, (e, signedTx) => {
        if (e) { return resolve({ status: 'error', error: e }); }
        web3.eth
          .sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
          .on('receipt', receipt => { resolve({ status: 'ok', receipt }); })
          .on('error', error => { resolve({ status: 'error', error }); });
      }).catch(error => { resolve({ status: 'error', error }); });
    });
  }

  testerSubmit(to: string, data: string) {
    return this.submit(this.testAccount, to, data);
  }

  testerLoadAccount(address?: string, privateKey?: string) {
    this.testAccount = web3.eth.accounts.create();
    if (address && privateKey) {
      this.testAccount.address = address;
      this.testAccount.privateKey = privateKey;
    }
  }

  parseBalance(strBalance: string) {
    let nat = '0';
    let dec = '0';
    if (strBalance.length > 18) {
      nat = strBalance.slice(0, strBalance.length - 18);
      dec = strBalance.slice(strBalance.length - 18).substr(0, 4);
    } else {
      nat = '0';
      dec = strBalance.slice(0, 4);
    }
    while (dec.endsWith('0') || dec.endsWith('.')) {
      dec = dec.substr(0, dec.length - 1);
    }
    return `${nat}.${dec}`;
  }

}
