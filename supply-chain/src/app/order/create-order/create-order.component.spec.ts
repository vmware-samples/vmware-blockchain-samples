/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CreateOrderComponent } from './create-order.component';
import { BlockchainService } from './../../core/blockchain/blockchain.service';
import { ErrorAlertService } from './../../shared/global-alert.service';

describe('CreateOrderComponent', () => {
  let component: CreateOrderComponent;
  let fixture: ComponentFixture<CreateOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ClarityModule,
        FormsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        RouterTestingModule
      ],
      declarations: [
        CreateOrderComponent
      ],
      providers: [
        BlockchainService,
        ErrorAlertService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
