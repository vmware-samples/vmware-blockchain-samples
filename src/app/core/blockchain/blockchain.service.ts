/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable } from '@angular/core';
import Web3 from 'web3';
import * as HttpHeaderProvider from 'httpheaderprovider';
import * as Orders from '../../../assets/contracts/OrdersProxy.json';
import * as OrdersV1 from '../../../assets/contracts/OrdersV1.json';
import * as Order from '../../../assets/contracts/Order.json';

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  ordersAddress: any = Orders.networks['5777'].address;
  ordersABI: any = OrdersV1.abi;
  orderABI: any = Order.abi;
  address: string = 'ws://127.0.0.1:7545';
  web3: Web3;
  ordersContract: any;
  from: string;
  accounts: string[];

  // TODO: items come from blockchain?
  public readonly items = ['apples', 'bananas', 'oranges'];
  // TODO: statuses come from blockchain?
  public readonly statuses = ['received', 'pending_audit', 'shipped'];

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

  createOrder(productType: string, quantity: number): Promise<any> {
    return this.ordersContract.methods.create(
      this.web3.utils.fromAscii(productType),
      quantity
    )
    // TODO - get the address from user session
    .send({ from: this.from, 'gas': '4400000' });
  }
}
