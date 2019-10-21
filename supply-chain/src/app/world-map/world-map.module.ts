/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './../shared/shared.module';

import { WorldMapComponent } from './world-map.component';

@NgModule({
  declarations: [WorldMapComponent],
  imports: [
    SharedModule
  ],
  exports: [WorldMapComponent]
})
export class WorldMapModule { }
