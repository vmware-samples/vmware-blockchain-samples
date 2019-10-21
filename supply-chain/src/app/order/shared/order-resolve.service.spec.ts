/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { OrderResolver } from './order-resolve.service';
import { BlockchainService } from './../../core/blockchain/blockchain.service';
import { ErrorAlertService } from './../../shared/global-alert.service';
import { MockTranslateModule } from './../../mocks/mock-translate.module';

describe('OrderResolveService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule, MockTranslateModule],
    providers: [
      BlockchainService,
      OrderResolver,
      ErrorAlertService
    ]
  }));

  it('should be created', () => {
    const service: OrderResolver = TestBed.get(OrderResolver);
    expect(service).toBeTruthy();
  });
});
