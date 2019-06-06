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
  ConfirmedDelivery = 'Confirmed Delivery',
  NotApproved = 'Not Approved',
  AuditFailed = 'Audit Failed',
  NotAtWarehouse = 'Did not receive',
  WarehouseIssue = 'Issue at warehouse',
  DistributorNeverReceived = 'Never Received',
  NotDelivered = 'Not Delivered',
  // Order Revoked
  Recalled = 'Recalled'
}

export enum OrderStatus {
  // Positive states
  Ordered,
  Approved,
  Audited,
  AuditDocUploaded,
  AtWarehouse,
  WarehouseReleased,
  InTransit,
  Delivered,
  // Negative states
  NotApproved,
  AuditFailed,
  NotAtWarehouse,
  WarehouseIssue,
  DistributorNeverReceived,
  NotDelivered,
  // Order Recalled
  Recalled
}

export class Order {
  contract;
  id: string; // Format: 0x304a554a310C7e546dfe434669C62820b7D83490
  amount: string;
  detailsPopulated = false;
  document: string;
  product: string;
  quantity: number;
  status: number;
  statusLabel: string;
  history: OrderHistory[];

  public hasHistory(...historyTypes: OrderHistoryAction[]): boolean {
    if (!this.history) { return false; }
    return this.history.filter((h) => historyTypes.includes(h.action)).length > 0;
  }
}

export enum OrderMethods {
  approve = 'approve',
  validated = 'validated',
  warehouseReceivedOrder = 'warehouseReceivedOrder',
  warehouseReleasedOrder = 'warehouseReleasedOrder',
  receivedAndInTransit = 'receivedAndInTransit',
  confirmDelivery = 'confirmDelivery',
  notApprove = 'notApprove',
  invalid = 'invalid',
  warehouseNotReceivedOrder = 'warehouseNotReceivedOrder',
  warehouseIssueOrder = 'warehouseIssueOrder',
  neverReceived = 'neverReceived',
  notDelivered  = 'notDelivered',
  revoke = 'revoke',
}

export enum OrderActions {
  ACTION_APPROVED = 'approved',
  ACTION_RECALL = 'recall',
  ACTION_RECEIVED = 'received',
  ACTION_SHIPPED = 'shipped',
  ACTION_STORAGE_RECEIVED = 'storageReceived',
  ACTION_STORAGE_RELEASED = 'storageReleased',
  ACTION_VALIDATED = 'validated',
  VALUE_APPROVE = 'approve',
  VALUE_DENY = 'deny',
  VALUE_FINISHED = 'finished',
  VALUE_IN_TRANSIT = 'in-transit',
  VALUE_ISSUE_AROSE = 'issue-arose',
  VALUE_ISSUE_RECEIVED = 'issue-received',
  VALUE_NEVER_RECEIVED = 'never-received',
  VALUE_WH_NEVER_RECEIVED = 'wh-never-received',
  VALUE_NOT_DELIVERED = 'not-delivered',
  VALUE_NOT_ORGANIC = 'not-organic',
  VALUE_ORGANIC = 'organic',
  VALUE_RECALL = 'recall',
  VALUE_RECEIVED = 'received',
  VALUE_DELIVERED = 'delivered',
  VALUE_RELEASED = 'released',
  VALUE_UPLOAD = 'upload',
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

