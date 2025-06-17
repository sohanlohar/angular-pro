import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { TranslationService } from 'libs/ezisend/shared-services/translate.service';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
@Component({
  selector: 'pos-dashboard-main-tile',
  templateUrl: './dashboard-main-tile.component.html',
  styleUrls: ['./dashboard-main-tile.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DashboardMainTileComponent implements OnInit {
  constructor(private router: Router, public commonService: CommonService,
    private translate: TranslationService) { }
  data: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
    (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
      en.data
      actionUrl(url: any, params?: any) {
        const eventDetailsRequestPickup = {
          event: 'go_to_shipment',
          event_category: 'SendParcel Pro - Dashboard',
          event_action: 'Go To Shipment',
          event_label: url == 'shipment' ? 'Single Shipments' : 
                       url == 'bulk-shipment' ? 'Bulk Shipments' : 
                       url == 'my-shipment' ? 'My Shipments - Request For A Pick Up' : ''
        };
        this.commonService.googleEventPush(eventDetailsRequestPickup);
        this.router.navigate([url], { queryParams: params });
      }
  ngOnInit() {
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.data = en.data;
      }
      else if (localStorage.getItem("language") == "my") {
        this.data = bm.data
      }
    })
  }
}
