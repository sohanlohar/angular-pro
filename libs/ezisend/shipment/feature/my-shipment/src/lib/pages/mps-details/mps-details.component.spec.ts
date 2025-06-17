import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpsDetailsComponent } from './mps-details.component';

describe('MpsDetailsComponent', () => {
  let component: MpsDetailsComponent;
  let fixture: ComponentFixture<MpsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MpsDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MpsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
