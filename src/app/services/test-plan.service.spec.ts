import { TestBed } from '@angular/core/testing';

import { TestPlanService } from './test-plan.service';

describe('TestPlanService', () => {
  let service: TestPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestPlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
