/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClrDatagridStateInterface } from '@clr/angular';
import { Order } from '../../core/order/order';
import { BlockchainService } from '../../core/blockchain/blockchain.service';

@Component({
  selector: 'vmw-sc-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnDestroy, OnInit {

  private datagridState: ClrDatagridStateInterface;
  private newOrderRef: Subscription;
  private updatedOrderRef: Subscription;

  pageSize = 20;
  orders;
  _gridSelectedOrder;
  _selectedOrder;
  total;
  loading = true;

  @Input()
  get selectedOrder() {
    return this._selectedOrder;
  }

  set selectedOrder(value) {
    this._selectedOrder = value;
    this.syncGridSelection();
  }

  @Output() selectedOrderChange = new EventEmitter();

  get gridSelectedOrder() {
    return this._gridSelectedOrder;
  }

  set gridSelectedOrder(value) {
    this.blockchainService.populateOrderDetails(value).then(() => {
      this._gridSelectedOrder = value;
      this.selectedOrderChange.emit(value);
    });
    value['where'] = 'gridSelected';
    this.blockchainService.updatedOrderSource.next(value);
  }

  constructor( private blockchainService: BlockchainService ) {
    this.blockchainService.orderCount().then((result) => this.total = result);
  }

  ngOnDestroy() {
    this.newOrderRef.unsubscribe();
    this.updatedOrderRef.unsubscribe();
  }

  ngOnInit() {
    this.newOrderRef = this.blockchainService.newOrder.subscribe((order) => {
      this.refresh(this.datagridState);
    });
    this.updatedOrderRef = this.blockchainService.updatedOrder.subscribe((order) => {
      this.replaceOrder(order);
    });
  }

  refresh(state: ClrDatagridStateInterface) {
    this.datagridState = state;
    this.loading = true;
    this.blockchainService.orders().then((response) => {
      this.total = response.total;
      this.orders = response.orders;
      this.syncGridSelection();
      this.loading = false;
      if (!this.selectedOrder && this.total > 0) {
        this.gridSelectedOrder = this.orders[0];
      }
    });
  }

  private replaceOrder(order: Order) {
    const orderIndex = this.orders.map((o) => o.id).indexOf(order.id);
    if (orderIndex >= 0) {
      this.orders.splice(orderIndex, 1, order);
    }
  }

  private syncGridSelection() {
    if (this.selectedOrder && this.orders) {
      this._gridSelectedOrder = this.orders.find(order => order.id === this.selectedOrder.id);
    }
  }
}
