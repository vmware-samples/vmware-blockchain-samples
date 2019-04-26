/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BlockchainVisualizationCardComponent } from './blockchain-visualization-card.component';

describe('BlockchainVisualizationCardComponent', () => {
  let component: BlockchainVisualizationCardComponent;
  let fixture: ComponentFixture<BlockchainVisualizationCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        TranslateModule.forRoot()
      ],
      declarations: [ BlockchainVisualizationCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainVisualizationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
