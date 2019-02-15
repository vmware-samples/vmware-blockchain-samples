/*
 * Copyright 2019 VMware, all rights reserved.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { BlockchainStatusCardComponent } from '../blockchain-status/blockchain-status-card.component';
import { BlockchainVisualizationComponent } from './blockchain-visualization.component';

describe('BlockchainVisualizationComponent', () => {
  let component: BlockchainVisualizationComponent;
  let fixture: ComponentFixture<BlockchainVisualizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        BlockchainStatusCardComponent,
        BlockchainVisualizationComponent
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

});
