/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';

import { MockSharedModule } from '../shared/shared.module';
import { ToggleRadioGroupComponent } from '../shared/toggle-radio-group/toggle-radio-group.component';
import { SimpleConfirmationComponent } from '../shared/simple-confirmation/simple-confirmation.component';
import { OrderComponent } from './order.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { StatusComponent } from './order-status/status.component';
import { StatusCardComponent } from './order-status/status-card.component';
import { StatusConnectorComponent } from './order-status/status-connector.component';

describe('OrderComponent', () => {
  let component: OrderComponent;
  let fixture: ComponentFixture<OrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MockSharedModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      declarations: [
        OrderComponent,
        OrderDetailComponent,
        StatusComponent,
        StatusCardComponent,
        StatusConnectorComponent,
        ToggleRadioGroupComponent,
        SimpleConfirmationComponent
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
    fixture = TestBed.createComponent(OrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
