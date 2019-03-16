/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, OnInit, Output } from '@angular/core';
import { BlockchainService } from '../core/blockchain/blockchain.service';
import { Order } from '../core/order/order';

@Component({
  selector: 'vmw-sc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  _selectedOrder: Order;

  get selectedOrder() {
    return this._selectedOrder;
  }

  set selectedOrder(value) {
    this._selectedOrder = value;
  }

  constructor(private blockchainService: BlockchainService) { }

  ngOnInit() {
    this.blockchainService.getOrder(0).then((order) => {
      this.selectedOrder = order;
    });
  }
}
