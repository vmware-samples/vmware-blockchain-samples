/*
 * Copyright 2019 VMware, all rights reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
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
    HomeComponent,
    OrderListComponent
  ]
})
export class HomeModule { }
