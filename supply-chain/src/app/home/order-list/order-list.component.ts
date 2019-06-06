/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Output,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  contractId: string;

  get gridSelectedOrder() {
    return this._gridSelectedOrder;
  }

  set gridSelectedOrder(value) {
    if (value && (value.id !== this.route.snapshot.params.order_id || !this._gridSelectedOrder)) {
      value['where'] = 'orderList';
      this.contractId = value.id;
      this.router.navigate(['/orders', value.id]);
      this.blockchainService.populateOrderDetails(value).then(() => {
        this._gridSelectedOrder = value;
        this.blockchainService.updatedOrderSource.next(value);
      });
    }
  }

  constructor(
    private blockchainService: BlockchainService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.blockchainService.orderCount().then(result => this.total = result);
    this.route.params.subscribe(params => this.handleRoutes(params));
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
      if (order['where'] && order['where'] !== 'orderList') {
        this.replaceOrder(order);
      }
    });
  }

  refresh(state: ClrDatagridStateInterface, getLast?: boolean) {
    this.datagridState = state;

    this.loading = true;
    this.blockchainService.orders().then((response) => {
      this.total = response.total;
      this.orders = response.orders;
      this.loading = false;
      if (getLast && this.total > 0) {
        const lastOrder = this.orders[this.orders.length - 1];
        this.contractId = lastOrder.id;
        this._gridSelectedOrder = lastOrder;
      } else {
        this.syncGridSelection();
      }
    });
  }

  private replaceOrder(order: Order) {
    const orderIndex = this.orders.map((o) => o.id).indexOf(order.id);
    if (orderIndex >= 0) {
      this.orders.splice(orderIndex, 1, order);
      this._gridSelectedOrder = order;
    }

  }

  private syncGridSelection() {
    if (this.contractId && this.orders) {
      this.gridSelectedOrder = this.orders.find(order => order.id === this.contractId);
      setTimeout(() => {
        const list = document.getElementsByClassName('datagrid')[0];
        // Scroll to the bottom
        list.scrollTop = list.scrollHeight;
      }, 100);
    }
  }

  private handleRoutes(params) {
    const orderId = params.order_id;
    const web3 = this.blockchainService.web3;

    if (orderId && web3.isAddress(orderId)) {
      this.contractId = orderId;
    }

    if (orderId && orderId === 'last') {
      this.refresh(this.datagridState, true);
    }
  }
}
