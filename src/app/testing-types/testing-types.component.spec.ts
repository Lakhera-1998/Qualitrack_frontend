import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingTypesComponent } from './testing-types.component';

describe('TestingTypesComponent', () => {
  let component: TestingTypesComponent;
  let fixture: ComponentFixture<TestingTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
