/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockTranslateModule } from '../../mocks/mock-translate.module';

import { BlockchainService } from './blockchain.service';
import { AuthService } from './../../auth/auth.service';
import { ErrorAlertService } from './../../shared/global-alert.service';

describe('BlockchainService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      MockTranslateModule,
      RouterTestingModule
    ],
    providers: [
      AuthService,
      ErrorAlertService
    ]
  }));

  it('should be created', () => {
    const service: BlockchainService = TestBed.get(BlockchainService);
    expect(service).toBeTruthy();
  });
});
