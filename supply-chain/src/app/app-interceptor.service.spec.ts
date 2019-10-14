/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { TestBed } from '@angular/core/testing';

import { AppInterceptor } from './app-interceptor.service';

describe('AppInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [AppInterceptor]
  }));

  it('should be created', () => {
    const service: AppInterceptor = TestBed.get(AppInterceptor);
    expect(service).toBeTruthy();
  });
});
