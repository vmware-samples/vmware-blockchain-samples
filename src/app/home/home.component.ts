/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { BlockchainService } from '../core/blockchain/blockchain.service';
import { Order } from '../core/order/order';

@Component({
  selector: 'vmw-sc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy, OnInit {

  _selectedOrder: Order;
  private updatedOrderRef: Subscription;

  get selectedOrder() {
    return this._selectedOrder;
  }

  set selectedOrder(value) {
    this._selectedOrder = value;
  }

  constructor(private blockchainService: BlockchainService) {

  }

  ngOnDestroy() {
    this.updatedOrderRef.unsubscribe();
  }

  ngOnInit() {
    this.updatedOrderRef = this.blockchainService.updatedOrder.subscribe((order) => {
      if (this.selectedOrder.id === order.id) {
        this.selectedOrder = order;
      }
    });
  }
}
