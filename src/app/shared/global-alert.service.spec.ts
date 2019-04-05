import { TestBed } from '@angular/core/testing';

import { GlobalAlertService } from './global-alert.service';

describe('GlobalAlertService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlobalAlertService = TestBed.get(GlobalAlertService);
    expect(service).toBeTruthy();
  });
});
