/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */


import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';

import { OrderListComponent } from './../order/order-list/order-list.component';
import { HomeComponent } from './home.component';
import { HomeModule } from './home.module';
import { ErrorAlertService } from '../shared/global-alert.service';
import { AuthService } from '../auth/auth.service';
import { BlockchainService } from '../core/blockchain/blockchain.service';


describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        HomeModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        ErrorAlertService,
        AuthService,
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: {
              subscribe: (fn: (value) => void) => fn(
                'create'
              ),
            },
            firstChild: {
              params: {
                subscribe: (fn: (value) => void) => fn(
                  {}
                )
              }
            }
          },
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
