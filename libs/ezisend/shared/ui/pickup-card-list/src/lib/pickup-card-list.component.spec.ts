import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickupCardListComponent } from './pickup-card-list.component';

describe('PickupCardListComponent', () => {
  let component: PickupCardListComponent;
  let fixture: ComponentFixture<PickupCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PickupCardListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PickupCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
