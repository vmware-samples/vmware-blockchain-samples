/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { EventEmitter, Injectable, Output } from '@angular/core';
import { BlockchainService } from '../blockchain/blockchain.service';
import { randomElement } from '../../shared/utils';

import { Order } from './order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  @Output() newOrder: EventEmitter<Order> = new EventEmitter();

  constructor(private blockchainService: BlockchainService) { }

  create(order: Order) {
    const promise = new Promise((resolve, reject) => {
      // TODO: Actually get this value from a blockchain order creation
      setTimeout(() => {
        this.newOrder.emit(order);
        resolve(order);
      }, 500);
    });
    return promise;
  }
}
