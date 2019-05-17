/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, Input, ViewChildren, ElementRef } from '@angular/core';
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
  @ViewChildren('fileUpload') fileUpload: ElementRef;
  @Input()
  set order(value: Order) {
    this._order = value;
    this.buildSelectedValues(); // also handles resetting values
  }

  get order() {
    return this._order;
  }
  uploading: boolean;
  uploadError: boolean;
  orderStatus = OrderStatus;
  methodsValueMapping = {};

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
  readonly VALUE_WH_NEVER_RECEIVED = 'wh-never-received';
  readonly VALUE_NOT_DELIVERED = 'not-delivered';
  readonly VALUE_NOT_ORGANIC = 'not-organic';
  readonly VALUE_ORGANIC = 'organic';
  readonly VALUE_RECALL = 'recall';
  readonly VALUE_RECEIVED = 'received';
  readonly VALUE_DELIVERED = 'delivered';
  readonly VALUE_RELEASED = 'released';
  readonly VALUE_UPLOAD = 'upload';


  // Todo - calculate this order state from the contract
  selectedValues;

  constructor(private blockchainService: BlockchainService,
    private userService: UserService) {
    this.setMethodsMapping();
  }

  buildSelectedValues() {
    const values = {};
    if (this.order.hasHistory(OrderHistoryAction.Approved)) {
      values[this.ACTION_APPROVED] = this.VALUE_APPROVE;
    }
    if (this.order.hasHistory(OrderHistoryAction.NotApproved)) {
      values[this.ACTION_APPROVED] = this.VALUE_DENY;
    }
    if (this.order.hasHistory(OrderHistoryAction.Audited)) {
      values[this.ACTION_VALIDATED] = this.VALUE_ORGANIC;
    }
    if (this.order.hasHistory(OrderHistoryAction.AuditFailed)) {
      values[this.ACTION_VALIDATED] = this.VALUE_NOT_ORGANIC;
    }
    if (this.order.hasHistory(OrderHistoryAction.Received)) {
      values[this.ACTION_STORAGE_RECEIVED] = this.VALUE_RECEIVED;
    }
    if (this.order.hasHistory(OrderHistoryAction.NotAtWarehouse)) {
      values[this.ACTION_STORAGE_RECEIVED] = this.VALUE_WH_NEVER_RECEIVED;
    }
    if (this.order.hasHistory(OrderHistoryAction.Released)) {
      values[this.ACTION_STORAGE_RELEASED] = this.VALUE_RELEASED;
    }
    if (this.order.hasHistory(OrderHistoryAction.WarehouseIssue)) {
      values[this.ACTION_STORAGE_RELEASED] = this.VALUE_ISSUE_AROSE;
    }
    if (this.order.hasHistory(OrderHistoryAction.InTransit)) {
      values[this.ACTION_SHIPPED] = this.VALUE_IN_TRANSIT;
    }
    if (this.order.hasHistory(OrderHistoryAction.DistributorNeverReceived)) {
      values[this.ACTION_SHIPPED] = this.VALUE_NEVER_RECEIVED;
    }
    if (this.order.hasHistory(OrderHistoryAction.ConfirmedDelivery)) {
      values[this.ACTION_RECEIVED] = this.VALUE_DELIVERED;
    }
    if (this.order.hasHistory(OrderHistoryAction.NotDelivered)) {
      values[this.ACTION_RECEIVED] = this.VALUE_NOT_DELIVERED;
    }
    if (this.order.hasHistory(OrderHistoryAction.NotDelivered)) {
      values[this.ACTION_RECEIVED] = this.VALUE_NOT_DELIVERED;
    }
    if (this.order.hasHistory(OrderHistoryAction.Recalled)) {
      values[this.ACTION_RECALL] = this.VALUE_RECALL;
    }
    this.selectedValues = values;
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
    console.log('value')
    console.log(value)
    console.log(this.methodsValueMapping[value]);
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

  private setMethodsMapping() {
    this.methodsValueMapping[this.VALUE_APPROVE] = 'approve';
    this.methodsValueMapping[this.VALUE_ORGANIC] = 'validated';
    this.methodsValueMapping[this.VALUE_RECEIVED] = 'warehouseReceivedOrder';
    this.methodsValueMapping[this.VALUE_RELEASED] = 'warehouseReleasedOrder';
    this.methodsValueMapping[this.VALUE_IN_TRANSIT] = 'receivedAndInTransit';
    this.methodsValueMapping[this.VALUE_DELIVERED] = 'confirmDelivery';

    this.methodsValueMapping[this.VALUE_DENY] = 'notApprove';
    this.methodsValueMapping[this.VALUE_NOT_ORGANIC] = 'invalid';
    this.methodsValueMapping[this.VALUE_WH_NEVER_RECEIVED] = 'warehouseNotReceivedOrder';
    this.methodsValueMapping[this.VALUE_ISSUE_AROSE] = 'warehouseIssueOrder';
    this.methodsValueMapping[this.VALUE_NEVER_RECEIVED] = 'neverReceived';
    this.methodsValueMapping[this.VALUE_NOT_DELIVERED] = 'notDelivered';

    this.methodsValueMapping[this.VALUE_RECALL] = 'revoke';
  }
}
