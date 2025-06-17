import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingPickupComponent } from './pending-pickup.component';

describe('PendingPickupComponent', () => {
  let component: PendingPickupComponent;
  let fixture: ComponentFixture<PendingPickupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PendingPickupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingPickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
