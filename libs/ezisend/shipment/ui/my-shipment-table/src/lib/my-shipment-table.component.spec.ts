import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyShipmentTableComponent } from './my-shipment-table.component';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { TranslationService } from '../../../../../shared-services/translate.service';
import { of } from 'rxjs';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'pos-paginator',
  template: '',
})
class MockPaginatorComponent {
  @Input() length: number = 0;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 25;
  @Input() pageSizeOptions: number[] = [25, 50, 100];

  onCurrentPage = jest.fn();
}

@Component({
  selector: 'mat-icon',
  template: '<ng-content></ng-content>',
})
class MockMatIconComponent {
  matTooltip: string = '';
  matTooltipPosition: string = '';
  matTooltipClass: string = '';
  class: string = '';
  click = jest.fn();
}

describe('MyShipmentTableComponent', () => {
  let component: MyShipmentTableComponent;
  let fixture: ComponentFixture<MyShipmentTableComponent>;
  let commonServiceMock: any;
  let translationServiceMock: any;

  beforeEach(() => {
    commonServiceMock = {
      fetchList: jest.fn().mockReturnValue(
        of({
          data: {
            feature_cod: true,
            feature_codubat: true,
            feature_melplus: true,
          },
        })
      ),
      isCOD: { next: jest.fn() },
      isCODUbat: { next: jest.fn() },
      isMelPlus: { next: jest.fn() },
      setTableLoad: jest.fn(),
    };

    translationServiceMock = {
      buttonClick$: of({}),
    };

    TestBed.configureTestingModule({
      imports: [MatTableModule],
      declarations: [
        MyShipmentTableComponent,
        MockPaginatorComponent,
        MockMatIconComponent,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CommonService, useValue: commonServiceMock },
        { provide: TranslationService, useValue: translationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyShipmentTableComponent);
    component = fixture.componentInstance;

    component.dataTable = new MatTableDataSource<any>([
      {
        pickup_details: { pickup_status: 'pickup-requested' },
        tracking_details: { tracking_id: '12345' },
      },
      {
        pickup_details: { pickup_status: 'delivered' },
        tracking_details: { tracking_id: '' },
      },
    ]);

    component.iconActions = ['history'];

    fixture.detectChanges();
  });

  it('#1 should create the component and call the constructor logic', () => {
    expect(component).toBeTruthy();
    expect(commonServiceMock.fetchList).toHaveBeenCalledWith('user', 'config');
    expect(commonServiceMock.isCOD.next).toHaveBeenCalledWith(true);
    expect(commonServiceMock.isCODUbat.next).toHaveBeenCalledWith(true);
    expect(commonServiceMock.isMelPlus.next).toHaveBeenCalledWith(true);
  });

  it('#2 should render history mat-icon button', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const icon = fixture.debugElement.query(By.css('#reschedule-pick-up'));
      expect(icon).toBeTruthy();
    });
  });

  it('#3 should call actionHandler', () => {
    const mockData = component.dataTable.data[0];
    const actionType = 'reschedule-pick-up';

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const icon = fixture.debugElement.query(By.css('#reschedule-pick-up'));
      icon.triggerEventHandler('click');
      expect(component.actionHandler).toHaveBeenCalledWith(
        mockData,
        actionType
      );
    });
  });

  it('#4 should emit actionIconEvent with correct data and actionType when actionHandler is called', () => {
    const mockData = component.dataTable.data[0];
    const actionType = 'reschedule-pick-up';

    const emitSpy = jest.spyOn(component.actionIconEvent, 'emit');
    component.actionHandler(mockData, actionType);
    expect(emitSpy).toHaveBeenCalledWith({ data: mockData, actionType });
  });
});
