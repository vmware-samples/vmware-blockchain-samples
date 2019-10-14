/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { OrderResolver } from './shared/order-resolve.service';
import { OrderComponent } from './order.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderListComponent } from './order-list/order-list.component';
import { StatusCardComponent } from './order-status/status-card.component';
import { StatusComponent } from './order-status/status.component';
import { StatusConnectorComponent } from './order-status/status-connector.component';
import { CreateOrderComponent } from './create-order/create-order.component';

@NgModule({
  declarations: [
    OrderComponent,
    OrderDetailComponent,
    OrderListComponent,
    StatusCardComponent,
    StatusComponent,
    StatusConnectorComponent,
    CreateOrderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    OrderListComponent,
    CreateOrderComponent
  ],
  providers: [
    OrderResolver
  ]
})
export class OrderModule { }
