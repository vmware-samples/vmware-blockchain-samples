/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { random, randomHexString } from '../../shared/utils';
import { BlockchainService } from '../blockchain/blockchain.service';

export enum OrderHistoryAction {
  Approved = 'Approved',
  Audited = 'Audited',
  Received = 'Received',
  Released = 'Released',
  InTransit = 'In Transit',
  ConfirmedDelivery = 'Confirmed Delivery'
}

export enum OrderStatus {
  Ordered,
  Approved,
  Audited,
  AuditDocUploaded,
  AtWarehouse,
  WarehouseReleased,
  InTransit,
  Delivered,
  Revoked
}

export class Order {
  contract;
  id: string; // Format: 0x304a554a310C7e546dfe434669C62820b7D83490
  amount: string;
  document: string;
  product: string;
  quantity: number;
  status: number;
  statusLabel: string;
  history: OrderHistory[];

  public hasHistory(...historyTypes: OrderHistoryAction[]): boolean {
    return this.history.filter((h) => historyTypes.includes(h.action)).length > 0;
  }
}

export interface OrderHistory {
  action: OrderHistoryAction;
  owner: string;
  transactionId: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
}
