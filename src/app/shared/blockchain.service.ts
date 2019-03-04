/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable } from '@angular/core';
import Web3 from 'web3';
import * as HttpHeaderProvider from 'httpheaderprovider';
import * as Orders from '../../assets/contracts/Orders.json';
import * as Order from '../../assets/contracts/Order.json';

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  ordersABI: any = Orders.abi;
  ordersAddress: any = Orders.networks['5777'].address;
  orderABI: any = Order.abi;
  address: string = 'ws://127.0.0.1:7545';
  web3: Web3;
  ordersContract: any;
  from: string;
  accounts: string[];

  constructor() {
    this.initConnection();
  }

  async initConnection() {
    const provider = new HttpHeaderProvider(this.address);
    this.web3 = new Web3(this.address);
    this.accounts = await this.web3.eth.personal.getAccounts();
    this.from = this.accounts[3];

    this.ordersContract = new this.web3.eth.Contract(
      this.ordersABI, this.ordersAddress
    );
  }

}
