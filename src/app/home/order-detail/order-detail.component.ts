/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, Input, ViewChildren } from '@angular/core';
import { OrderStatus } from '../../core/order/order';
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
  set order(value) {
    if (this.controls) {
      this.controls.map((c) => c.reset()); // Reset controls when changing order
    }
    this._order = value;
  }

  get order() {
    return this._order;
  }

  _order;
  _validateValue;

  constructor( private blockchainService: BlockchainService,
               private userService: UserService) {

  }

  approveOrder() {
    this.blockchainService.approveOrder(this.order);
  }

  auditOrder() {
    this.blockchainService.storeAuditDocumentOrder(this.order);
  }

  processStorageOrder() {
    // this.blockchainService.approve(this.order);
  }

  recallOrder() {
    this.blockchainService.revokeOrder(this.order);
  }

  receiveSupermarketOrder() {
    this.blockchainService.confirmDeliveryOrder(this.order);
  }

  receiveStorageOrder() {
    this.blockchainService.warehouseReceivedOrder(this.order);
  }

  releaseStorageOrder() {
    this.blockchainService.warehouseReleasedOrder(this.order);
  }

  shipOrder() {
    this.blockchainService.receivedAndInTransitOrder(this.order);
  }

  validateOrder() {
    this.blockchainService.validatedOrder(this.order);
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

  toggleSelect(name, value) {
    if (name === 'validate' && value === 'organic') {
      this.validateOrder();
    } else if (name === 'storageReceived' && value === 'received') {
      this.receiveStorageOrder();
    } else if (name === 'storageReleased' && value === 'released') {
      this.releaseStorageOrder();
    } else if (name === 'shipped' && value === 'in-transit') {
      this.shipOrder();
    } else if (name === 'received' && value === 'received') {
      this.receiveSupermarketOrder();
    } else if (name === 'recall' && value === 'recall') {
      this.recallOrder();
    }
  }
}
