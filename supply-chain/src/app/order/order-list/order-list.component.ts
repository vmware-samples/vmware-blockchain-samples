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
import { Order } from '../shared/order';
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
     this._gridSelectedOrder = value;
     this.contractId = value.id;
     this.router.navigate(['/orders', value.id]);
  }

  constructor(
    private blockchainService: BlockchainService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.blockchainService.orderCount().then(result => this.total = result);
    this.route.firstChild.params.subscribe(params => this.handleRoutes(params));
  }

  ngOnDestroy() {
    this.updatedOrderRef.unsubscribe();
  }

  ngOnInit() {
    this.updatedOrderRef = this.blockchainService.updatedOrder.subscribe((order) => {
      const where = order['where'];

      if (where && where !== 'orderList') {
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
      this.syncGridSelection();
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

    if (this.orders && web3.isAddress(orderId)) {
      const orderIsPresent = this.orders.find(order => order.id === this.contractId);
      if (!orderIsPresent) {
        this.refresh(this.datagridState, true);
      }
    }
  }
}
