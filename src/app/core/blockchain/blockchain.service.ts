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
import { sequentialArray } from '../../shared/utils';
import { Order as OrderModel, OrderHistory, OrdersResponse, OrderStatus } from '../order/order';

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

  public readonly items = ['Apples', 'Bananas', 'Oranges'];
  private servicePromise: Promise<any>;

  constructor() {
    const provider = new HttpHeaderProvider(this.address);
    this.web3 = new Web3(this.address);
    this.servicePromise = this.getAccounts();
  }

  approveOrder(order: OrderModel): Promise<any> {
    return this.sendOrder(order, 'approve');
  }

  confirmDeliveryOrder(order: OrderModel): Promise<any> {
    return this.sendOrder(order, 'confirmDelivery');
  }

  createOrder(productType: string, quantity: number): Promise<any> {
    return fromPromise(this.servicePromise).pipe(mergeMap(() => {
      return this.ordersContract.methods.create(
        this.web3.utils.fromAscii(productType),
        quantity
      )
      .send({ from: this.from, 'gas': '4400000' }).then((address) => {
        return address;
      });
    })).toPromise();
  }

  deliveredOrder(order: OrderModel): Promise<any> {
    return this.sendOrder(order, 'delivered');
  }

  getHistory(order: OrderModel): Promise<any> {
    return this.getHistoryLength(order).then((historyLength) => {
      if (historyLength > 0) {
        const historyIndices = sequentialArray(0, historyLength);
        const historyPromises = historyIndices.map(i => this.getHistoryRecord(order, i));
        return Promise.all(historyPromises);
      } else {
        return Promise.resolve([]);
      }
    });
  }

  getHistoryLength(order: OrderModel): Promise<any> {
    return order.contract.methods.getHistoryLength().call();
  }

  getHistoryRecord(order: OrderModel, index: number): Promise<OrderHistory> {
    return order.contract.methods.history(index).call().then((record) => {
      return {
        action: toUtf8(record.action),
        owner: record.who,
        transactionId: '0x4534534534abec533' // TODO - where to get this?
      } as OrderHistory;
    });
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
    return this.callWithPromise( 'orders', index );
  }

  orders(startIndex: number = 0, pageSize: number = 20): Promise<OrdersResponse> {
    return this.orderCount().then((total) => {
      if (total > 0) {
        const maxIndex = Math.min( total as number, startIndex + pageSize );
        const indices = sequentialArray(startIndex, maxIndex - startIndex);
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
    return this.callWithPromise('getAmount');
  }

  receivedAndInTransitOrder(order: OrderModel): Promise<any> {
    return this.sendOrder(order, 'receivedAndInTransit');
  }

  revokeOrder(order: OrderModel): Promise<any> {
    return this.sendOrder(order, 'revoke');
  }

  storeAuditDocumentOrder(order: OrderModel): Promise<any> {
    return this.sendOrder(order, 'storeAuditDocument');
  }

  validatedOrder(order: OrderModel): Promise<any> {
    return this.sendOrder(order, 'validated');
  }

  verifyInTransitOrder(order: OrderModel): Promise<any> {
    return this.sendOrder(order, 'verifyInTransit');
  }

  warehouseReceivedOrder(order: OrderModel): Promise<any> {
    return this.sendOrder(order, 'warehouseReceivedOrder');
  }

  warehouseReleasedOrder(order: OrderModel): Promise<any> {
    return this.sendOrder(order, 'warehouseReleasedOrder');
  }

  private buildOrder(contract): Promise<OrderModel> {
    const order = {
      id: contract.options.address,
      contract: contract
    } as OrderModel;
    const loadHistory = this.getHistory(order).then((history) => {
      order.history = history;
    });
    const loadMeta = contract.methods.meta.call().then(meta => {
      order.amount = meta.amount;
      order.product = toUtf8(meta.product);
      return order;
    });
    const loadStatus = contract.methods.state.call().then(status => {
      order.status = parseInt(status, 10);
      order.statusLabel = OrderStatus[status];
    });
    return Promise.all([loadHistory, loadMeta, loadStatus]).then(() => {
      return order;
    });
  }

  private callWithPromise(methodName: string, ...args: any[]): Promise<any> {
    return fromPromise(this.servicePromise).pipe(mergeMap(() => {
      return this.ordersContract.methods[methodName](...args).call({ from: this.from });
    })).toPromise();
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

  private sendOrder(order, methodName, ...args: any[]): Promise<any> {
    // setOwners is temporary until we have a more robust approach to roles
    return this.setOwners(order, this.from).then(() => {
      return order.contract.methods[methodName](...args)
        .send({ from: this.from, 'gas': '4400000' });
    });
  }

  private setOwners(order, userAddress: string): Promise<any> {
    return order.contract.methods.setOwners(...(new Array(5).fill(userAddress)))
      .send({ from: this.from, 'gas': '4400000' }).then((orderContract) => {
    });
  }
}
