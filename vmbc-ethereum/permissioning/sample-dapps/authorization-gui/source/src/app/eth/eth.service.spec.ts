import { TestBed } from '@angular/core/testing';

import { EthService } from './eth.service';

describe('EthService', () => {
  let service: EthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
