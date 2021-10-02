/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import {
  Component,
  Input,
  ViewChildren,
  ElementRef,
  NgZone
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BlockchainService } from '../../core/blockchain/blockchain.service';
import { UserService } from '../../core/user/user.service';
import { ToggleRadioGroupComponent } from '../../shared/toggle-radio-group/toggle-radio-group.component';
import { UserRole } from './../../core/user/user';
import {
  Order,
  OrderHistoryAction,
  OrderStatus,
  OrderActions,
  OrderMethods
} from '../shared/order';


@Component({
  selector: 'vmw-sc-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent {
  @ViewChildren(ToggleRadioGroupComponent) controls;
  @ViewChildren('fileUpload') fileUpload: ElementRef;

  set order(value: Order) {
    if (value) {
      this._order = value;
      this.buildSelectedValues(); // also handles resetting values
    }
  }
  get order(): Order {
    return this.blockchainService.currentOrder;
  }

  uploading: boolean;
  uploadError: boolean;
  orderStatus = OrderStatus;
  methodsValueMapping = {};
  fakeLocations: any;
  _order: Order;
  actions = OrderActions;
  selectedValues;

  constructor(
    private blockchainService: BlockchainService,
    private userService: UserService,
    private zone: NgZone,
    private route: ActivatedRoute,
  ) {
    this.route.params.subscribe(params => {
      this.selectedValues = undefined;
      this.order = this.blockchainService.currentOrder;
    });
    this.setMethodsMapping();
    this.fakeLocations = this.blockchainService.genFakeLocations();
  }

  canApproveOrder() {
    return this.order.status === OrderStatus.Ordered && this.userService.hasRole(UserRole.farmer);
  }

  canAuditOrder() {
    const canAuditOrder = this.order.status === OrderStatus.Audited && this.userService.hasRole(UserRole.auditor);
    if (!canAuditOrder) { this.uploading = false; }
    return canAuditOrder;
  }

  canProcessStorageOrder() {
    return this.order.status === OrderStatus.AtWarehouse && this.userService.hasRole(UserRole.storage);
  }

  canDownloadDoc() {
    return this.order.document !== '0x0000000000000000000000000000000000000000';
  }

  canRecallOrder() {
    return this.userService.hasRole(UserRole.farmer, UserRole.auditor);
  }

  canReceiveOrder() {
    return this.order.status === OrderStatus.InTransit && this.userService.hasRole(UserRole.super_market);
  }

  canReleaseStorageOrder() {
    return this.order.status === OrderStatus.AtWarehouse && this.userService.hasRole(UserRole.storage);
  }

  canReceiveStorageOrder() {
    return this.order.status === OrderStatus.AuditDocUploaded && this.userService.hasRole(UserRole.storage);
  }

  canShipOrder() {
    return this.order.status === OrderStatus.WarehouseReleased && this.userService.hasRole(UserRole.distributor);
  }

  canValidateOrder() {
    return this.order.status === OrderStatus.Approved && this.userService.hasRole(UserRole.auditor);
  }

  processAction(action, value): Promise<any> {
    this.addLocation(action);
    return this.blockchainService.sendOrder(
      this.order, this.methodsValueMapping[value]
    ).then(respone => {
      this.order = respone;
      return respone;
    });
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
          web3.utils.fromAscii(location[1].toString()),
          web3.utils.fromAscii(location[0].toString())
        );
      }
    }
  }

  private buildSelectedValues() {
    const values = {};

    if (this._order.hasHistory(OrderHistoryAction.Approved)) {
      values[this.actions.ACTION_APPROVED] = this.actions.VALUE_APPROVE;
    }
    if (this._order.hasHistory(OrderHistoryAction.NotApproved)) {
      values[this.actions.ACTION_APPROVED] = this.actions.VALUE_DENY;
    }
    if (this._order.hasHistory(OrderHistoryAction.Audited)) {
      values[this.actions.ACTION_VALIDATED] = this.actions.VALUE_ORGANIC;
    }
    if (this._order.hasHistory(OrderHistoryAction.AuditFailed)) {
      values[this.actions.ACTION_VALIDATED] = this.actions.VALUE_NOT_ORGANIC;
    }
    if (this._order.hasHistory(OrderHistoryAction.Received)) {
      values[this.actions.ACTION_STORAGE_RECEIVED] = this.actions.VALUE_RECEIVED;
    }
    if (this._order.hasHistory(OrderHistoryAction.NotAtWarehouse)) {
      values[this.actions.ACTION_STORAGE_RECEIVED] = this.actions.VALUE_WH_NEVER_RECEIVED;
    }
    if (this._order.hasHistory(OrderHistoryAction.Released)) {
      values[this.actions.ACTION_STORAGE_RELEASED] = this.actions.VALUE_RELEASED;
    }
    if (this._order.hasHistory(OrderHistoryAction.WarehouseIssue)) {
      values[this.actions.ACTION_STORAGE_RELEASED] = this.actions.VALUE_ISSUE_AROSE;
    }
    if (this._order.hasHistory(OrderHistoryAction.InTransit)) {
      values[this.actions.ACTION_SHIPPED] = this.actions.VALUE_IN_TRANSIT;
    }
    if (this._order.hasHistory(OrderHistoryAction.DistributorNeverReceived)) {
      values[this.actions.ACTION_SHIPPED] = this.actions.VALUE_NEVER_RECEIVED;
    }
    if (this._order.hasHistory(OrderHistoryAction.ConfirmedDelivery)) {
      values[this.actions.ACTION_RECEIVED] = this.actions.VALUE_DELIVERED;
    }
    if (this._order.hasHistory(OrderHistoryAction.NotDelivered)) {
      values[this.actions.ACTION_RECEIVED] = this.actions.VALUE_NOT_DELIVERED;
    }
    if (this._order.hasHistory(OrderHistoryAction.NotDelivered)) {
      values[this.actions.ACTION_RECEIVED] = this.actions.VALUE_NOT_DELIVERED;
    }
    if (this._order.hasHistory(OrderHistoryAction.Recalled)) {
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
