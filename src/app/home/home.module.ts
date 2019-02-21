/*
 * Copyright 2019 VMware, all rights reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { BlockchainStatusComponent } from './blockchain-status/blockchain-status.component';
import { BlockchainStatusCardComponent } from './blockchain-status/blockchain-status-card.component';
import { BlockchainStatusConnectorComponent } from './blockchain-status/blockchain-status-connector.component';
import { BlockchainVisualizationComponent } from './blockchain-visualization/blockchain-visualization.component';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { OrderListComponent } from './order-list/order-list.component';

@NgModule({
  imports: [
    ClarityModule,
    CommonModule,
    HomeRoutingModule,
    TranslateModule
  ],
  declarations: [
    BlockchainStatusCardComponent,
    BlockchainStatusComponent,
    BlockchainStatusConnectorComponent,
    BlockchainVisualizationComponent,
    HomeComponent,
    OrderListComponent
  ]
})
export class HomeModule { }
