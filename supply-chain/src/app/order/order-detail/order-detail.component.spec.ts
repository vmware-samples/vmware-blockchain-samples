/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';
import { OrderDetailComponent } from './order-detail.component';
import { StatusComponent } from './../order-status/status.component';
import { StatusCardComponent } from './../order-status/status-card.component';
import { StatusConnectorComponent } from './../order-status/status-connector.component';

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        SharedModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      declarations: [
        OrderDetailComponent,
        StatusComponent,
        StatusCardComponent,
        StatusConnectorComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: {
              subscribe: (fn: (value) => void) => fn(
                {}
              )
            }
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
