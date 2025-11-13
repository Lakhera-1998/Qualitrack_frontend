import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCaseDetailsComponent } from './test-case-details.component';

describe('TestCaseDetailsComponent', () => {
  let component: TestCaseDetailsComponent;
  let fixture: ComponentFixture<TestCaseDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCaseDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestCaseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
