import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailDeliverComponent } from './fail-deliver.component';

describe('FailDeliverComponent', () => {
  let component: FailDeliverComponent;
  let fixture: ComponentFixture<FailDeliverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FailDeliverComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FailDeliverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
