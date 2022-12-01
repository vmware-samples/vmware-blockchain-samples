/*
 * Copyright 2018-2021 VMware, all rights reserved.
 */
import { Injectable } from '@angular/core';
import Web3 from 'web3';

declare var window: any;
let web3: any;

@Injectable({
  providedIn: 'root'
})
export class EthService {
  web3: any;
  initPromise?: Promise<any> = null;
  
  constructor() { }

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
  }

  setWeb3(w3: any) {
    this.web3 = web3 = w3;
    console.log(w3);
  }

  async waitForProvider() {
    if (this.initPromise === null) { return; }
    this.initPromise = window.ethereum.enable();
    await this.initPromise;
    this.initPromise = null;
  }

}
