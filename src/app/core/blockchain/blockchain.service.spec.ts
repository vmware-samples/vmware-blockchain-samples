/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';

import { BlockchainService } from './blockchain.service';
import { AuthService } from './../../auth/auth.service';

describe('BlockchainService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [AuthService, HttpClient, HttpHandler]
  }));

  it('should be created', () => {
    const service: BlockchainService = TestBed.get(BlockchainService);
    expect(service).toBeTruthy();
  });
});
