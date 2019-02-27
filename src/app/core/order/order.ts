/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { random, randomHexString, randomElement } from '../../shared/utils';

export class Order {
  // TODO: items come from blockchain
  readonly items = ['apples', 'bananas', 'oranges'];
  // TODO: statuses come from blockchain
  readonly statuses = ['pending_audit', 'received', 'shipped'];

  id: string; // Format: 0x304a554a310C7e546dfe434669C62820b7D83490
  item: string;
  quantity: number;
  status: string;

  constructor() {
    this.id = randomHexString(30);
    this.item = randomElement(this.items);
    this.quantity = random(10);
    this.status = randomElement(this.statuses);
  }
}
