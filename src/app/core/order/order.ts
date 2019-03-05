/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { random, randomHexString } from '../../shared/utils';
import { BlockchainService } from '../blockchain/blockchain.service';

export enum OrderStatus {
  Ordered,
  Approved,
  Audited,
  AtWarehouse,
  InTransit,
  Delivered,
  Revoked
}

export interface Order {
  contract;
  id: string; // Format: 0x304a554a310C7e546dfe434669C62820b7D83490
  amount: string;
  product: string;
  quantity: number;
  status: string;
  statusLabel: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
}
