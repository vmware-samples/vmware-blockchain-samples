/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable } from '@angular/core';
import { from as fromPromise } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import Web3 from 'web3';
import { toUtf8 } from 'web3-utils';
import * as HttpHeaderProvider from 'httpheaderprovider';
import * as Order from '../../../assets/contracts/OrderV1.json';
import * as Orders from '../../../assets/contracts/OrdersProxy.json';
import * as OrdersV1 from '../../../assets/contracts/OrdersV1.json';
import { Order as OrderModel, OrdersResponse, OrderStatus } from '../order/order';

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
  public readonly items = ['Apples', 'Bananas', 'Oranges'];
  private servicePromise: Promise<any>;

  constructor() {
    const provider = new HttpHeaderProvider(this.address);
    this.web3 = new Web3(this.address);
    this.servicePromise = this.getAccounts();
  }

  createOrder(productType: string, quantity: number): Promise<any> {
    return fromPromise(this.servicePromise).pipe(mergeMap(() => {
      return this.ordersContract.methods.create(
        this.web3.utils.fromAscii(productType),
        quantity
      )
      .send({ from: this.from, 'gas': '4400000' });
    })).toPromise();
  }

  getOrder(index: number): Promise<any> {
    return fromPromise(this.servicePromise).pipe(mergeMap(() => {
      return this.order(index).then((address) => {
        const contract = new this.web3.eth.Contract(this.orderABI, address as string);
        return this.buildOrder(contract).then(order => {
          return order;
        });
      });
    })).toPromise();
  }

  order(index: number): Promise<any> {
    return fromPromise(this.servicePromise).pipe(mergeMap(() => {
      return this.ordersContract.methods.orders(index).call({ from: this.from });
    })).toPromise();
  }

  orders(startIndex: number = 0, pageSize: number = 20): Promise<OrdersResponse> {
    return this.orderCount().then((total) => {
      if (total > 0) {
        const maxIndex = Math.min( total as number, startIndex + pageSize );
        const indices = Array.from(new Array(maxIndex - startIndex), (val, index) => index + startIndex);
        const orderPromises = indices.map(i => this.getOrder(i));
        return Promise.all(orderPromises).then(orders => {
          return {
            orders: orders,
            total: total
          } as OrdersResponse;
        });
      }
    });
  }

  orderCount(): Promise<any> {
    return fromPromise(this.servicePromise).pipe(mergeMap(() => {
      return this.ordersContract.methods.getAmount().call({ from: this.from });
    })).toPromise();
  }

  private buildOrder(contract): Promise<OrderModel> {
    const order = {
      id: contract.options.address,
      contract: contract
    } as OrderModel;

    const loadMeta = contract.methods.meta.call().then(meta => {
      order.amount = meta.amount;
      order.product = toUtf8(meta.product);
      return order;
    });
    const loadStatus = contract.methods.state.call().then(status => {
      order.status = status;
      order.statusLabel = OrderStatus[status];
    });
    return Promise.all([loadMeta, loadStatus]).then(() => {
      return order;
    });
  }

  private getAccounts(): Promise<any> {
    return this.web3.eth.personal.getAccounts().then((accounts) => {
      this.accounts = accounts;
      this.from = this.accounts[3];
      this.web3.eth.defaultAccount = this.from;
      this.ordersContract = new this.web3.eth.Contract(
        this.ordersABI, this.ordersAddress
      );
    });
  }
}
