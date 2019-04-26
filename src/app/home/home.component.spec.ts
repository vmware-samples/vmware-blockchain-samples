/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */


import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';

import { BlockchainVisualizationModule } from '../blockchain-visualization/blockchain-visualization.module';
import { OrderListComponent } from './order-list/order-list.component';
import { HomeComponent } from './home.component';
import { HomeModule } from './home.module';
import { ErrorAlertService } from '../shared/global-alert.service';


describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BlockchainVisualizationModule,
        ClarityModule,
        HomeModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        HttpClient,
        ErrorAlertService,
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: {
              subscribe: (fn: (value) => void) => fn(
                'create'
              ),
            },
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
