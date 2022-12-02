import { TestBed } from '@angular/core/testing';

import { EthereumService } from './ethereum.service';

describe('EthereumService', () => {
  let service: EthereumService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EthereumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
