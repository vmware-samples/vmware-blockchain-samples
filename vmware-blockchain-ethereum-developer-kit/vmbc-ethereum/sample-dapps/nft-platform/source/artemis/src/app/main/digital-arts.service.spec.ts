import { TestBed } from '@angular/core/testing';

import { DigitalArtsService } from './digital-arts.service';

describe('DigitalArtsService', () => {
  let service: DigitalArtsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DigitalArtsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
