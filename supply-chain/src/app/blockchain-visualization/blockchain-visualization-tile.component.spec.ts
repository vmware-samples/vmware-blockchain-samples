/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { HttpClient, HttpHandler } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorAlertService } from '../shared/global-alert.service';
import { BlockchainVisualizationCardComponent } from './blockchain-visualization-card.component';
import { BlockchainVisualizationComponent } from './blockchain-visualization.component';
import { BlockchainVisualizationTileComponent } from './blockchain-visualization-tile.component';

describe('BlockchainVisualizationTileComponent', () => {
  let component: BlockchainVisualizationTileComponent;
  let fixture: ComponentFixture<BlockchainVisualizationTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        BlockchainVisualizationCardComponent,
        BlockchainVisualizationComponent,
        BlockchainVisualizationTileComponent
      ],
      providers: [
        ErrorAlertService,
        HttpClient,
        HttpHandler
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainVisualizationTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
