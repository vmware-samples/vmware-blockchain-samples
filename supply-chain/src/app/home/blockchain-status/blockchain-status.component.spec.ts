/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BlockchainStatusCardComponent } from './blockchain-status-card.component';
import { BlockchainStatusComponent } from './blockchain-status.component';
import { BlockchainStatusConnectorComponent } from './blockchain-status-connector.component';

describe('BlockchainStatusComponent', () => {
  let component: BlockchainStatusComponent;
  let fixture: ComponentFixture<BlockchainStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        BlockchainStatusCardComponent,
        BlockchainStatusComponent,
        BlockchainStatusConnectorComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
