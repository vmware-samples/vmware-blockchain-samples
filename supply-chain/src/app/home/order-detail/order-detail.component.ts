/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, Input, ViewChildren, ElementRef, NgZone } from '@angular/core';
import { Order, OrderHistoryAction, OrderStatus, OrderActions, OrderMethods } from '../../core/order/order';
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
  @ViewChildren('fileUpload') fileUpload: ElementRef;
  @Input()
  set order(value: Order) {
    if (value) {
      this._order = value;
      this.buildSelectedValues(); // also handles resetting values
    }

  }

  get order() {
    return this._order;
  }
  uploading: boolean;
  uploadError: boolean;
  orderStatus = OrderStatus;
  methodsValueMapping = {};
  fakeLocations: any;
  _order;
  actions = OrderActions;

  // Todo - calculate this order state from the contract
  selectedValues;

  constructor(
    private blockchainService: BlockchainService,
    private userService: UserService,
    private zone: NgZone
  ) {
    this.setMethodsMapping();
    this.fakeLocations = this.blockchainService.genFakeLocations();

  }

  canApproveOrder() {
    return this.order.status === OrderStatus.Ordered && this.userService.hasRole('farmer');
  }

  canAuditOrder() {
    const canAuditOrder = this.order.status === OrderStatus.Audited && this.userService.hasRole('auditor');
    if (!canAuditOrder) { this.uploading = false; }
    return canAuditOrder;
  }

  canProcessStorageOrder() {
    return this.order.status === OrderStatus.AtWarehouse && this.userService.hasRole('storage');
  }

  canDownloadDoc() {
    return this.order.document !== '0x0000000000000000000000000000000000000000';
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
    return this.order.status === OrderStatus.AuditDocUploaded && this.userService.hasRole('storage');
  }

  canShipOrder() {
    return this.order.status === OrderStatus.WarehouseReleased && this.userService.hasRole('distributor');
  }

  canValidateOrder() {
    return this.order.status === OrderStatus.Approved && this.userService.hasRole('auditor');
  }

  processAction(action, value): Promise<any> {
    this.addLocation(action);
    return this.blockchainService.sendOrder(
      this.order, this.methodsValueMapping[value]
    );
  }

  upload() {
    this.fileUpload['first'].nativeElement.click();
  }

  storeDocument(event: Event) {
    this.uploadError = false;
    this.uploading = true;

    if (event.target['files'][0].size > 210000) {
      this.uploading = false;
      this.uploadError = true;
      return;
    }

    this.blockchainService.storeDocument(this.order, event)
      .then(() => {
      }, error => {
        this.uploading = false;
      });
  }

  async downloadDocument() {
    const doc = await this.blockchainService.getDocument(this.order.document);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(doc);
    const dlAnchorElem = document.createElement('a');

    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'supply_chain_audit_document.json');
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
  }

  private async addLocation(action: string) {
    const locations = this.fakeLocations[action];
    const web3 = this.blockchainService.web3;

    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      if (location) {
        await this.blockchainService.sendOrder(
          this._order,
          'updateLocation',
          web3.fromAscii(location[1].toString()),
          web3.fromAscii(location[0].toString())
        );
      }
    }
  }

  private buildSelectedValues() {
    console.log('hello build selected values')
    console.log(this.order.hasHistory(OrderHistoryAction.Approved))
    const values = {};
    if (this.order.hasHistory(OrderHistoryAction.Approved)) {
      values[this.actions.ACTION_APPROVED] = this.actions.VALUE_APPROVE;
    }
    if (this.order.hasHistory(OrderHistoryAction.NotApproved)) {
      values[this.actions.ACTION_APPROVED] = this.actions.VALUE_DENY;
    }
    if (this.order.hasHistory(OrderHistoryAction.Audited)) {
      values[this.actions.ACTION_VALIDATED] = this.actions.VALUE_ORGANIC;
    }
    if (this.order.hasHistory(OrderHistoryAction.AuditFailed)) {
      values[this.actions.ACTION_VALIDATED] = this.actions.VALUE_NOT_ORGANIC;
    }
    if (this.order.hasHistory(OrderHistoryAction.Received)) {
      values[this.actions.ACTION_STORAGE_RECEIVED] = this.actions.VALUE_RECEIVED;
    }
    if (this.order.hasHistory(OrderHistoryAction.NotAtWarehouse)) {
      values[this.actions.ACTION_STORAGE_RECEIVED] = this.actions.VALUE_WH_NEVER_RECEIVED;
    }
    if (this.order.hasHistory(OrderHistoryAction.Released)) {
      values[this.actions.ACTION_STORAGE_RELEASED] = this.actions.VALUE_RELEASED;
    }
    if (this.order.hasHistory(OrderHistoryAction.WarehouseIssue)) {
      values[this.actions.ACTION_STORAGE_RELEASED] = this.actions.VALUE_ISSUE_AROSE;
    }
    if (this.order.hasHistory(OrderHistoryAction.InTransit)) {
      values[this.actions.ACTION_SHIPPED] = this.actions.VALUE_IN_TRANSIT;
    }
    if (this.order.hasHistory(OrderHistoryAction.DistributorNeverReceived)) {
      values[this.actions.ACTION_SHIPPED] = this.actions.VALUE_NEVER_RECEIVED;
    }
    if (this.order.hasHistory(OrderHistoryAction.ConfirmedDelivery)) {
      values[this.actions.ACTION_RECEIVED] = this.actions.VALUE_DELIVERED;
    }
    if (this.order.hasHistory(OrderHistoryAction.NotDelivered)) {
      values[this.actions.ACTION_RECEIVED] = this.actions.VALUE_NOT_DELIVERED;
    }
    if (this.order.hasHistory(OrderHistoryAction.NotDelivered)) {
      values[this.actions.ACTION_RECEIVED] = this.actions.VALUE_NOT_DELIVERED;
    }
    if (this.order.hasHistory(OrderHistoryAction.Recalled)) {
      values[this.actions.ACTION_RECALL] = this.actions.VALUE_RECALL;
    }
    this.selectedValues = values;
  }

  private setMethodsMapping() {
    this.methodsValueMapping[this.actions.VALUE_APPROVE] = OrderMethods.approve;
    this.methodsValueMapping[this.actions.VALUE_ORGANIC] = OrderMethods.validated;
    this.methodsValueMapping[this.actions.VALUE_RECEIVED] = OrderMethods.warehouseReceivedOrder;
    this.methodsValueMapping[this.actions.VALUE_RELEASED] = OrderMethods.warehouseReleasedOrder;
    this.methodsValueMapping[this.actions.VALUE_IN_TRANSIT] = OrderMethods.receivedAndInTransit;
    this.methodsValueMapping[this.actions.VALUE_DELIVERED] = OrderMethods.confirmDelivery;

    this.methodsValueMapping[this.actions.VALUE_DENY] = OrderMethods.notApprove;
    this.methodsValueMapping[this.actions.VALUE_NOT_ORGANIC] = OrderMethods.invalid;
    this.methodsValueMapping[this.actions.VALUE_WH_NEVER_RECEIVED] = OrderMethods.warehouseNotReceivedOrder;
    this.methodsValueMapping[this.actions.VALUE_ISSUE_AROSE] = OrderMethods.warehouseIssueOrder;
    this.methodsValueMapping[this.actions.VALUE_NEVER_RECEIVED] = OrderMethods.neverReceived;
    this.methodsValueMapping[this.actions.VALUE_NOT_DELIVERED] = OrderMethods.notDelivered;

    this.methodsValueMapping[this.actions.VALUE_RECALL] = OrderMethods.revoke;
  }

}
