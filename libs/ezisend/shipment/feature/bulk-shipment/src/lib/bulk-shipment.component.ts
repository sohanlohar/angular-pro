import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';
import { MatStepper } from '@angular/material/stepper';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { Subject, takeUntil } from 'rxjs';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-bulk-shipment',
  templateUrl: './bulk-shipment.component.html',
  styleUrls: ['./bulk-shipment.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class BulkShipmentComponent implements OnDestroy {
  protected _onDestroy = new Subject<void>();
  data: any =
    localStorage.getItem('language') &&
    localStorage.getItem('language') === 'en'
      ? en.data.bulkShipment
      : localStorage.getItem('language') &&
        localStorage.getItem('language') === 'my'
      ? bm.data.bulkShipment
      : en.data.bulkShipment;
  constructor(
    public commonService: CommonService,
    private translate: TranslationService
  ) {
    this.commonService
      .fetchList('user', 'config')
      .pipe(takeUntil(this._onDestroy))
      .subscribe((data) => {
        this.commonService.isCOD.next(data.data?.feature_cod);
        this.commonService.isCODUbat.next(data.data?.feature_codubat);
        this.commonService.isMelPlus.next(data.data?.feature_melplus);
        this.commonService.isMPS.next(data.data?.feature_mps);
        this.commonService.isMelPlusCOD.next(data.data?.feature_melplus_cod);
      });
    this.assingLanguageLabel();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem('language') == 'en') {
        this.data = en.data.bulkShipment;
      } else if (localStorage.getItem('language') == 'my') {
        this.data = bm.data.bulkShipment;
      }

      this.assingLanguageLabel();
    });
  }

  @ViewChild('stepper') stepper!: MatStepper;
  pageTitle = 'Bulk Shipments';
  selectedIndex = 0;

  breadcrumbItems: BreadcrumbItem[] = [];

 ngOnInit(): void {
    // Trigger tab_to_section event for the default "Domestic" tab
    this.commonService.googleEventPush({
      event: 'tab_to_section',
      event_category: 'SendParcel Pro - Bulk Shipments - Domestic',
      event_action: 'Tab To Section',
      event_label: 'Domestic',
    });
  }
  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  assingLanguageLabel() {
    this.pageTitle = this.data.bulk_shipment;
    this.breadcrumbItems = [
      {
        title: this.data.home,
        routerLink: [''],
        external: false,
        current: false,
      },
      {
        title: this.data.bulk_shipment,
        external: false,
        current: true,
      },
    ];
  }
  tabChanged(value: any) {
    if (value.index === 0) {
      this.commonService.googleEventPush({
        event: 'tab_to_section',
        event_category: 'SendParcel Pro - Bulk Shipments - Domestic',
        event_action: 'Tab To Section',
        event_label: 'Domestic',
      });
    } else if (value.index === 1) {
      this.commonService.googleEventPush({
        event: 'tab_to_section',
        event_category: 'SendParcel Pro - Bulk Shipments - International',
        event_action: 'Tab To Section',
        event_label: 'International',
      });

    } else if (value.index === 2) {
      this.commonService.googleEventPush({
        event: 'tab_to_section',
        event_category: 'SendParcel Pro - Bulk Shipments - MelPlus',
        event_action: 'Tab To Section',
        event_label: 'MelPlus',
      });

    }
    else if (value.index === 3) {
      this.commonService.googleEventPush({
        event: 'tab_to_section',
        event_category: 'SendParcel Pro - Bulk Shipments - MPS',
        event_action: 'Tab To Section',
        event_label: 'MPS',
      });

    }

  }
}
