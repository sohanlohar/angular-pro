import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestForPickupComponent } from './request-for-pickup.component';

describe('RequestForPickupComponent', () => {
  let component: RequestForPickupComponent;
  let fixture: ComponentFixture<RequestForPickupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestForPickupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestForPickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
