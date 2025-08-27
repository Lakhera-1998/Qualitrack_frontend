import { TestBed } from '@angular/core/testing';

import { TestingTypeService } from './testing-type.service';

describe('TestingTypeService', () => {
  let service: TestingTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestingTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
