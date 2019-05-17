/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { BlockchainVisualizationModule } from '../blockchain-visualization/blockchain-visualization.module';
import { WorldMapModule } from '../world-map/world-map.module';

import { BlockchainStatusComponent } from './blockchain-status/blockchain-status.component';
import { BlockchainStatusCardComponent } from './blockchain-status/blockchain-status-card.component';
import { BlockchainStatusConnectorComponent } from './blockchain-status/blockchain-status-connector.component';
import { CreateOrderComponent } from './create-order/create-order.component';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderListComponent } from './order-list/order-list.component';

@NgModule({
  imports: [
    BlockchainVisualizationModule,
    BrowserAnimationsModule,
    ClarityModule,
    CoreModule,
    FormsModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    TranslateModule,
    WorldMapModule
  ],
  declarations: [
    BlockchainStatusCardComponent,
    BlockchainStatusComponent,
    BlockchainStatusConnectorComponent,
    CreateOrderComponent,
    HomeComponent,
    OrderDetailComponent,
    OrderListComponent
  ],
  exports: [
    CreateOrderComponent
  ]
})
export class HomeModule { }
