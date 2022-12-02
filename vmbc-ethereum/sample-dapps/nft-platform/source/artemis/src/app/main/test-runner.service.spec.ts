import { TestBed } from '@angular/core/testing';

import { TestRunnerService } from './test-runner.service';

describe('TestRunnerService', () => {
  let service: TestRunnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestRunnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
