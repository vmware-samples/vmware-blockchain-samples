/*
 * Copyright 2019 VMware, all rights reserved.
 */

import { ClarityModule } from '@clr/angular';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BlockchainStatusConnectorComponent } from './blockchain-status-connector.component';

describe('BlockchainStatusConnectorComponent', () => {
  let component: BlockchainStatusConnectorComponent;
  let fixture: ComponentFixture<BlockchainStatusConnectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ClarityModule ],
      declarations: [ BlockchainStatusConnectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainStatusConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
