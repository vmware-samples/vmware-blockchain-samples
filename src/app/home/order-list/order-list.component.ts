/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ClrDatagridStateInterface } from '@clr/angular';
import { Order } from '../../core/order/order';
import { BlockchainService } from '../../core/blockchain/blockchain.service';
import { OrderService } from '../../core/order/order.service';

@Component({
  selector: 'vmw-sc-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

  pageSize = 20;
  orders;
  total;
  loading = true;

  constructor( private blockchainService: BlockchainService,
               private changeDetectorRef: ChangeDetectorRef,
               private orderService: OrderService ) {
  }

  ngOnInit() {

  }

  refresh(state: ClrDatagridStateInterface) {
    this.loading = true;
    this.blockchainService.orders().then((response) => {
      this.total = response.total;
      this.orders = response.orders;
      this.loading = false;
    });
  }
}
