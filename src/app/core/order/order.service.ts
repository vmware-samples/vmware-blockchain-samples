/*
 * Copyright 2019 VMware, all rights reserved.
 */

import { Injectable } from '@angular/core';
import { Order } from './order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor() { }

  generateRandomOrder(): Order {
    return new Order();
  }

  generateRandomOrders(size): Order[] {
    return Array.from({length: size}, () => this.generateRandomOrder());
  }
}
