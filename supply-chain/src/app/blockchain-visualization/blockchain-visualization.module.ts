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

import { BlockchainVisualizationComponent } from './blockchain-visualization.component';
import { BlockchainVisualizationCardComponent } from './blockchain-visualization-card.component';
import { BlockchainVisualizationTileComponent } from './blockchain-visualization-tile.component';

@NgModule({
  imports: [
    // BrowserAnimationsModule,
    ClarityModule,
    CommonModule,
    CoreModule,
    // FormsModule,
    // HomeRoutingModule,
    // ReactiveFormsModule,
    SharedModule,
    TranslateModule,
  ],
  declarations: [
    BlockchainVisualizationCardComponent,
    BlockchainVisualizationComponent,
    BlockchainVisualizationTileComponent
  ],
  exports: [
    BlockchainVisualizationTileComponent
  ]
})
export class BlockchainVisualizationModule { }
