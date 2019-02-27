/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
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
