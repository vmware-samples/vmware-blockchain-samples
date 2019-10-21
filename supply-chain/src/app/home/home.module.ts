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
import { WorldMapModule } from '../world-map/world-map.module';
import { OrderModule } from './../order/order.module';

import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    ClarityModule,
    CoreModule,
    FormsModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    TranslateModule,
    WorldMapModule,
    OrderModule
  ],
  declarations: [
    HomeComponent,
  ],
})
export class HomeModule { }
