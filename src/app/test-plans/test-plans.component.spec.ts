import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPlansComponent } from './test-plans.component';

describe('TestPlansComponent', () => {
  let component: TestPlansComponent;
  let fixture: ComponentFixture<TestPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestPlansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
