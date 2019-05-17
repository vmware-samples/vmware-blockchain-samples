
/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from as fromPromise, Subject, pipe } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import Web3 from 'web3';
import * as HttpHeaderProvider from 'httpheaderprovider';
import * as contract from 'truffle-contract';
import * as pako from 'pako';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';
import { ErrorAlertService } from '../../shared/global-alert.service';
import { NotifierService } from '../../shared/notifier.service';

import * as Order from '../../../assets/contracts/OrderV1.json';
import * as Orders from '../../../assets/contracts/OrdersProxy.json';
import * as OrdersV1 from '../../../assets/contracts/OrdersV1.json';
import * as DocumentMeta from '../../../assets/contracts/Document.json';
import { sequentialArray } from '../../shared/utils';
import {
  Order as OrderModel,
  OrderHistory,
  OrdersResponse,
  OrderStatus
} from '../order/order';

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  ordersAddress: any = Orders.networks[environment.network].address;
  ordersABI: any = OrdersV1.abi;
  orderABI: any = Order.abi;
  address: string = environment.path;
  web3: Web3;
  ordersContract: any;
  docContract: any;
  from: string;
  accounts: string[];
  sendDefaults = { from: undefined, 'gas': '4400000' };
  Doc: any;

  private newOrderSource = new Subject<any>();
  public newOrder = this.newOrderSource.asObservable();

  public updatedOrderSource = new Subject<OrderModel>();
  public updatedOrder = this.updatedOrderSource.asObservable();

  public readonly items = ['Apples', 'Bananas', 'Oranges'];
  private servicePromise: Promise<any>;

  constructor(
    private authService: AuthService,
    private alertService: ErrorAlertService,
    private http: HttpClient,
    private notifierService: NotifierService,
  ) {
    if (environment.blockchainType === 'metamask' && window['web3']) {
      this.web3 = this.metaMask();
    } else if (environment.blockchainType === 'vmware') {
      this.web3 = this.vmwareBlockchain();
    } else {
      this.web3 = this.ganache();
    }

    this.servicePromise = this.getAccounts();
  }

  metaMask(): Web3 {
    return new Web3(window['web3'].currentProvider);
  }

  vmwareBlockchain(): Web3 {
    return new Web3(this.authService.getVmwareBlockChainProvider());
  }

  ganache(): Web3 {
    return new Web3(new Web3.providers.HttpProvider(this.address));
  }

  approveOrder(order: OrderModel): Promise<any> {
    return this.sendOrder(order, 'approve');
  }

  confirmDeliveryOrder(order: OrderModel): Promise<any> {
    return this.sendOrder(order, 'confirmDelivery');
  }

  createOrder(productType: string, quantity: number): Promise<any> {
    return fromPromise(this.servicePromise).pipe(mergeMap(() => {
      return new Promise((resolve, reject) => {
        return this.ordersContract.create(
          this.web3.fromUtf8(productType),
          quantity,
          this.sendDefaults,
          this.callbackToResolve(resolve, reject)
        );
      }).then((tx) => {
        this.newOrderSource.next(tx);
        return tx;
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
    return new Promise((resolve, reject) => {
      return order.contract.getHistoryLength(this.callbackToResolve(resolve, reject));
    });
  }

  getHistoryRecord(order: OrderModel, index: number): Promise<OrderHistory> {
    return new Promise((resolve, reject) => {
      return order.contract.history(index, this.callbackToResolve(resolve, reject));
    }).then((record) => {
      return {
        action: this.web3.toUtf8(record[1]),
        owner: record[0],
        transactionId: '0x4534534534abec533' // TODO - where to get this?
      } as OrderHistory;
    });
  }

  getNodes(): Promise<any> {
    const locations = [
      [-80.294105, 38.5976], // West Virginia
      [-119.692793, 45.836507], // Oregon
      [151.21, -33.868], // Sydney
      [8.67972, 45.836507] // Frankfurt
    ];

    return this.http.get(
      `${environment.path}/api/concord/members`,
      this.getHttpOptions()
    ).pipe(
      map(nodes => {

        nodes.forEach((node, i) => {
          node['location'] = locations[i];
        });

        return nodes;
      })
    ).toPromise();
  }

  getOrder(index: number): Promise<OrderModel> {
    return fromPromise(this.servicePromise).pipe(mergeMap(() => {
      return this.order(index).then((address) => {
        return this.getOrderByAddress(address);
      });
    })).toPromise();
  }

  getOrderByAddress(address: string): Promise<OrderModel> {
    const orderContract = this.web3.eth.contract(this.orderABI).at(address);
    return this.buildOrder(orderContract, address).then(order => {
      return order;
    });
  }

  getReceipt(txReceipt: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.web3.eth.getTransactionReceipt(
        txReceipt, this.callbackToResolve(resolve, reject));
    });
  }

  order(index: number): Promise<any> {
    return this.callWithPromise('orders', index);
  }

  orders(startIndex: number = 0, pageSize: number = 20): Promise<OrdersResponse> {
    return this.orderCount().then((total) => {
      if (total > 0) {
        const maxIndex = Math.min(total as number, startIndex + pageSize);
        const indices = sequentialArray(startIndex, maxIndex - startIndex);
        const orderPromises = indices.map(i => this.getOrder(i));
        return Promise.all(orderPromises).then(orders => {
          return {
            orders: orders,
            total: total
          } as OrdersResponse;
        });
      } else {
        return {
          orders: [],
          total: total
        } as OrdersResponse;
      }
    });
  }

  orderCount(): Promise<any> {
    return this.callWithPromise('getAmount');
  }

  populateOrderDetails(order: OrderModel): Promise<OrderModel> {
    if (order.detailsPopulated) {
      return Promise.resolve(order);
    }

    const loadHistory = this.getHistory(order).then((history) => {
      order.history = history;
    });

    const loadDocument = new Promise((resolve, reject) => {
      return order.contract.auditDocument(this.callbackToResolve(resolve, reject));
    }).then((docAddress) => {
      // @ts-ignore
      order.document = docAddress;
      return order;
    });

    return Promise.all([loadHistory, loadDocument]).then(() => {
      order.detailsPopulated = true;
      return order;
    });
  }

  // receivedAndInTransitOrder(order: OrderModel): Promise<any> {
  //   return this.sendOrder(order, 'receivedAndInTransit');
  // }

  // revokeOrder(order: OrderModel): Promise<any> {
  //   return this.sendOrder(order, 'revoke');
  // }

  // storeAuditDocumentOrder(order: OrderModel, address: string): Promise<any> {
  //   return this.sendOrder(order, 'storeAuditDocument', address);
  // }

  // validatedOrder(order: OrderModel): Promise<any> {
  //   return this.sendOrder(order, 'validated');
  // }

  // verifyInTransitOrder(order: OrderModel): Promise<any> {
  //   return this.sendOrder(order, 'verifyInTransit');
  // }

  // warehouseReceivedOrder(order: OrderModel): Promise<any> {
  //   return this.sendOrder(order, 'warehouseReceivedOrder');
  // }

  // warehouseReleasedOrder(order: OrderModel): Promise<any> {
  //   return this.sendOrder(order, 'warehouseReleasedOrder');
  // }

  async getDocument(docAddress: string): Promise<any> {
    this.docContract = await this.Doc.at(docAddress);

    // return this.docContract.docString()
    //   .then(deflated => {
    //       return pako.inflate(
    //         deflated,
    //         { to: 'string' }
    //       );
    //   });

    return this.docContract.getPastEvents('DocumentEvent', { fromBlock: 0, toBlock: 'latest' })
      .then(events => {
        if (events && events[0] && events[0].returnValues[0]) {
          return pako.inflate(
            events[0].returnValues[0],
            { to: 'string' }
          );
        } else {
          throw Error('Event or document not present');
        }
      });
  }

  async storeDocument(order, event) {
    if (event.target.files.length === 0) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      return this.inEventStore(order, reader.result);
    };
    reader.readAsText(event.target.files[0]);

  }

  private buildOrder(orderContract, address: string): Promise<OrderModel> {
    const order = new OrderModel();
    order.id = address;
    order.contract = orderContract;

    const loadMeta = new Promise((resolve, reject) => {
      return orderContract.meta(this.callbackToResolve(resolve, reject));
    }).then(meta => {
      order.amount = meta[1];
      order.product = this.web3.toUtf8(meta[0]);
      return order;
    });

    const loadStatus = new Promise((resolve, reject) => {
      return orderContract.state(this.callbackToResolve(resolve, reject));
    }).then(status => {
      order.status = parseInt(status as string, 10);
      order.statusLabel = OrderStatus[status as string];
    });

    return Promise.all([loadMeta, loadStatus]).then(() => {
      return order;
    });
  }

  private callWithPromise(methodName: string, ...args: any[]): Promise<any> {
    return fromPromise(this.servicePromise).pipe(mergeMap(() => {
      return new Promise((resolve, reject) => {
        if (args.length === 0) {
          return this.ordersContract[methodName](this.callbackToResolve(resolve, reject));
        } else {
          return this.ordersContract[methodName](...args, this.callbackToResolve(resolve, reject));
        }
      });
    })).toPromise();
  }

  private getAccounts(): Promise<any> {
    return new Promise((resolve, reject) => {
      return this.web3.eth.getAccounts(this.callbackToResolve(resolve, reject));
    }).then(async accounts => {
      // @ts-ignore
      this.accounts = accounts;
      this.from = this.accounts[1];
      this.sendDefaults.from = this.from;
      this.web3.eth.defaultAccount = this.from;
      this.ordersContract = this.web3.eth.contract(this.ordersABI).at(this.ordersAddress);
      // Instantiate our doc provider
      this.Doc = contract({
        abi: DocumentMeta.abi
      });
      this.Doc.bytecode = DocumentMeta.bytecode;
      this.Doc.setProvider(this.authService.getVmwareBlockChainProvider());
      this.Doc.defaults(this.sendDefaults);
    });

  }

  private getHttpOptions(): any {
    return {
      headers: new HttpHeaders(this.authService.getAuthHeader())
    };
  }

  updateLocation()

  sendOrder(order, methodName, ...args: any[]): Promise<any> {
    // setOwners is temporary until we have a more robust approach to roles
    return new Promise((resolve, reject) => {
      return this.setOwners(order, this.from).then(() => {
        return order.contract[methodName](
          ...args, this.sendDefaults, this.callbackToResolve(resolve, reject)
        );
      });
    }).then((resp) => {
      this.notifierService.update(resp);
      return this.getOrderByAddress(order.id).then((updatedOrder) => {
        this.updatedOrderSource.next(updatedOrder);
        return updatedOrder;
      });
    }).catch(err => {
      this.alertService.add(err);
    });
  }

  private setOwners(order, userAddress: string): Promise<any> {
    return new Promise((resolve, reject) => {
      return order.contract.setOwners(
        ...(new Array(5).fill(userAddress)),
        this.sendDefaults,
        this.callbackToResolve(resolve, reject));
    });
  }

  private callbackToResolve(resolve, reject) {
    return function(error, value) {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    };
  }

  private async inEventStore(order, file) {
    const deflated = pako.deflate(file, { to: 'string' });

    this.docContract = await this.Doc.new();
    const txReceipt = await this.docContract.inEvent(deflated);
    // This is commented out for the Hands On Section.
    // const txReceipt = await this.docContract.inString(deflated);
    const receipt = await this.getReceipt(txReceipt.tx);
    return this.storeAuditDocumentOrder(order, this.docContract.address)
      .then(
        response => console.log(response),
        error => console.log(error)
      );
  }

}
