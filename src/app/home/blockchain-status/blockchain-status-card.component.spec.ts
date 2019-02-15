/*
 * Copyright 2019 VMware, all rights reserved.
 */

import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BlockchainStatusCardComponent } from './blockchain-status-card.component';

describe('BlockchainStatusCardComponent', () => {
  let component: BlockchainStatusCardComponent;
  let fixture: ComponentFixture<BlockchainStatusCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        TranslateModule.forRoot()
      ],
      declarations: [ BlockchainStatusCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainStatusCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
