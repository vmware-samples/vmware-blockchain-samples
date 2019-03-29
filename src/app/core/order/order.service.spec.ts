/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { TestBed } from '@angular/core/testing';
import { OrderService } from './order.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('OrderService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [HttpClient, HttpHandler]
  }));

  it('should be created', () => {
    const service: OrderService = TestBed.get(OrderService);
    expect(service).toBeTruthy();
  });
});
