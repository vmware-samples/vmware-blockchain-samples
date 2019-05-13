/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { BlockchainNodeTransactionStates } from '../core/blockchain/blockchain-node';
import { ErrorAlertService } from '../shared/global-alert.service';
import { BlockchainVisualizationCardComponent } from './blockchain-visualization-card.component';
import { BlockchainVisualizationComponent } from './blockchain-visualization.component';

describe('BlockchainVisualizationComponent', () => {
  let component: BlockchainVisualizationComponent;
  let fixture: ComponentFixture<BlockchainVisualizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        BlockchainVisualizationCardComponent,
        BlockchainVisualizationComponent
      ],
      providers: [
        ErrorAlertService,
        HttpClient
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger onResize method when window is resized', () => {
     const spyOnResize = spyOn(component, 'onResize');
     window.dispatchEvent(new Event('resize'));
     expect(spyOnResize).toHaveBeenCalled();
   });

   describe('drawPaths()', () => {
     beforeEach(() => {
       component.nodes = Array(4).fill({
         address: '0x123098324908249abcfed1',
         hostname: 'test',
         status: 'live',
         transactionState: BlockchainNodeTransactionStates.healthy
       });
       component.drawPaths();
     });

     it('should draw double paths between nodes', () => {
       expect(component.paths.length).toBe(12);
     });

     it('should give unique path names', () => {
       expect(Array.from(new Set(component.paths.map(c => c.id))).length).toBe(12);
     });

     it('should name paths based on node ids', () => {
       expect(component.paths[0].id).toBe('path-0-1');
     });
   });
});
