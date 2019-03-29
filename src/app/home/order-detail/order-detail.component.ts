/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, Input, ViewChildren } from '@angular/core';
import { Order, OrderHistoryAction, OrderStatus } from '../../core/order/order';
import { BlockchainService } from '../../core/blockchain/blockchain.service';
import { UserService } from '../../core/user/user.service';
import { ToggleRadioGroupComponent } from '../../shared/toggle-radio-group/toggle-radio-group.component';

@Component({
  selector: 'vmw-sc-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent {
  @ViewChildren(ToggleRadioGroupComponent) controls;
  @Input()
  set order(value: Order) {
    this._order = value;
    this.buildSelectedValues(); // also handles resetting values
  }

  get order() {
    return this._order;
  }

  _order;

  readonly ACTION_APPROVED = 'approved';
  readonly ACTION_RECALL = 'recall';
  readonly ACTION_RECEIVED = 'received';
  readonly ACTION_SHIPPED = 'shipped';
  readonly ACTION_STORAGE_RECEIVED = 'storageReceived';
  readonly ACTION_STORAGE_RELEASED = 'storageReleased';
  readonly ACTION_VALIDATED = 'validated';
  readonly VALUE_APPROVE = 'approve';
  readonly VALUE_DENY = 'deny';
  readonly VALUE_FINISHED = 'finished';
  readonly VALUE_IN_TRANSIT = 'in-transit';
  readonly VALUE_ISSUE_AROSE = 'issue-arose';
  readonly VALUE_ISSUE_RECEIVED = 'issue-received';
  readonly VALUE_NEVER_RECEIVED = 'never-received';
  readonly VALUE_NOT_ORGANIC = 'not-organic';
  readonly VALUE_ORGANIC = 'organic';
  readonly VALUE_RECALL = 'recall';
  readonly VALUE_RECEIVED = 'received';
  readonly VALUE_RELEASED = 'released';
  readonly VALUE_UPLOAD = 'upload';


  // Todo - calculate this order state from the contract
  selectedValues;

  constructor( private blockchainService: BlockchainService,
               private userService: UserService ) {

  }

  approveOrder(): Promise<any> {
    return this.blockchainService.approveOrder(this.order);
  }

  auditOrder(): Promise<any> {
    return this.blockchainService.storeAuditDocumentOrder(this.order);
  }

  buildSelectedValues() {
    const values = {};
    if ( this.order.hasHistory(OrderHistoryAction.Approved) ) {
      values[this.ACTION_APPROVED] = this.VALUE_APPROVE;
    }
    if ( this.order.hasHistory(OrderHistoryAction.Audited) ) {
      values[this.ACTION_VALIDATED] = this.VALUE_ORGANIC;
    }
    if ( this.order.hasHistory(OrderHistoryAction.Received) ) {
      values[this.ACTION_STORAGE_RECEIVED] = this.VALUE_RECEIVED;
    }
    if ( this.order.hasHistory(OrderHistoryAction.Released) ) {
      values[this.ACTION_STORAGE_RELEASED] = this.VALUE_RELEASED;
    }
    if ( this.order.hasHistory(OrderHistoryAction.InTransit) ) {
      values[this.ACTION_SHIPPED] = this.VALUE_IN_TRANSIT;
    }
    if ( this.order.hasHistory(OrderHistoryAction.ConfirmedDelivery) ) {
      values[this.ACTION_RECEIVED] = this.VALUE_RECEIVED;
    }
    this.selectedValues = values;
  }

  processStorageOrder() {
    // this.blockchainService.approve(this.order);
  }

  recallOrder(): Promise<any> {
    return this.blockchainService.revokeOrder(this.order);
  }

  receiveSupermarketOrder(): Promise<any> {
    return this.blockchainService.confirmDeliveryOrder(this.order);
  }

  receiveStorageOrder(): Promise<any> {
    return this.blockchainService.warehouseReceivedOrder(this.order);
  }

  releaseStorageOrder(): Promise<any> {
    return this.blockchainService.warehouseReleasedOrder(this.order);
  }

  shipOrder(): Promise<any> {
    return this.blockchainService.receivedAndInTransitOrder(this.order);
  }

  validateOrder(): Promise<any> {
    return this.blockchainService.validatedOrder(this.order);
  }

  canApproveOrder() {
    return this.order.status === OrderStatus.Ordered && this.userService.hasRole('farmer');
  }

  canAuditOrder() {
    return this.order.status === OrderStatus.Approved  && this.userService.hasRole('auditor');
  }

  canProcessStorageOrder() {
    return this.order.status === OrderStatus.AtWarehouse && this.userService.hasRole('storage');
  }

  canRecallOrder() {
    return this.userService.hasRole('farmer', 'auditor');
  }

  canReceiveOrder() {
    return this.order.status === OrderStatus.InTransit && this.userService.hasRole('super_market');
  }

  canReleaseStorageOrder() {
    return this.order.status === OrderStatus.AtWarehouse && this.userService.hasRole('storage');
  }

  canReceiveStorageOrder() {
    return this.order.status === OrderStatus.Audited && this.userService.hasRole('storage');
  }

  canShipOrder() {
    return this.order.status === OrderStatus.WarehouseReleased && this.userService.hasRole('distributor');
  }

  canValidateOrder() {
    return this.order.status === OrderStatus.Approved && this.userService.hasRole('auditor');
  }

  processAction(action, value): Promise<any> {
    if (action === this.ACTION_APPROVED && value === this.VALUE_APPROVE) {
      return this.approveOrder();
    } else if (action === this.ACTION_VALIDATED && value === this.VALUE_ORGANIC) {
      return this.validateOrder();
    } else if (action === this.ACTION_STORAGE_RECEIVED && value === this.VALUE_RECEIVED) {
      return this.receiveStorageOrder();
    } else if (action === this.ACTION_STORAGE_RELEASED && value === this.VALUE_RELEASED) {
      return this.releaseStorageOrder();
    } else if (action === this.ACTION_SHIPPED && value === this.VALUE_IN_TRANSIT) {
      return this.shipOrder();
    } else if (action === this.ACTION_RECEIVED && value === this.VALUE_RECEIVED) {
      return this.receiveSupermarketOrder();
    } else if (action === this.ACTION_RECALL && value === this.VALUE_RECALL) {
      return this.recallOrder();
    } else {
      return Promise.resolve();
    }
  }
}
