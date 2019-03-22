/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ClrDatagridStateInterface } from '@clr/angular';
import { Order } from '../../core/order/order';
import { BlockchainService } from '../../core/blockchain/blockchain.service';
import { OrderService } from '../../core/order/order.service';

@Component({
  selector: 'vmw-sc-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent {

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
    this._gridSelectedOrder = value;
    this.selectedOrderChange.emit(value);
  }

  constructor( private blockchainService: BlockchainService,
               private changeDetectorRef: ChangeDetectorRef,
               private orderService: OrderService ) {
    this.blockchainService.orderCount().then((result) => this.total = result);
  }

  refresh(state: ClrDatagridStateInterface) {
    this.loading = true;
    this.blockchainService.orders().then((response) => {
      this.total = response.total;
      this.orders = response.orders;
      this.syncGridSelection();
      this.loading = false;
    });
  }

  private syncGridSelection() {
    if (this.selectedOrder && this.orders) {
      this._gridSelectedOrder = this.orders.find(order => order.id === this.selectedOrder.id);
    }
  }
}
