import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveShipmentsComponent } from './live-shipments.component';

describe('LiveShipmentsComponent', () => {
  let component: LiveShipmentsComponent;
  let fixture: ComponentFixture<LiveShipmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LiveShipmentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LiveShipmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
