import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SummaryTile } from '@pos/ezisend/dashboard/data-access/models';
import { TranslationService } from 'libs/ezisend/shared-services/translate.service';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { CommonService } from '@pos/ezisend/shared/data-access/services';

@Component({
  selector: 'pos-shipment-tile',
  templateUrl: './shipment-tile.component.html',
  styleUrls: ['./shipment-tile.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ShipmentTileComponent implements OnInit{
  data: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
    (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
      en.data;

  constructor(private router: Router,private translate: TranslationService, public commonService: CommonService,) {}
  
  @Input() summaryTile: SummaryTile = {
    image: 'cart',
    title: this.data?.pending_pickup,
    link: '',
    count: 0,
  };
  @Input() boxHeight = 'auto';

  
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

  routeUrl(url:string) {
    if (url === 'pending-pickup') {
      this.commonService.googleEventPush({
        event: 'go_to_shipment',
        event_category: 'SendParcel Pro - Dashboard',
        event_action: 'Go To Shipment',
        event_label: 'My Shipments - Pending Pick Up',
      });      
    }
    if (url === 'live-shipment') {
      this.commonService.googleEventPush({
        event: 'go_to_shipment',
        event_category: 'SendParcel Pro - Dashboard',
        event_action: 'Go To Shipment',
        event_label: 'My Shipments Live Shipment',
      });      
    }
    if (url === 'delivered') {
      this.commonService.googleEventPush({
        event: 'go_to_shipment',
        event_category: 'SendParcel Pro - Dashboard',
        event_action: 'Go To Shipment',
        event_label: 'My Shipments Delivered',
      });      
    }
    if (url === 'fail-delivered') {
      this.commonService.googleEventPush({
        event: 'go_to_shipment',
        event_category: 'SendParcel Pro - Dashboard',
        event_action: 'Go To Shipment',
        event_label: 'My Shipments Failed Deliveries',
      });      
    }
    if (url === 'return') {
      this.commonService.googleEventPush({
        event: 'go_to_shipment',
        event_category: 'SendParcel Pro - Dashboard',
        event_action: 'Go To Shipment',
        event_label: 'My Shipments Returns',
      });      
    }
    this.router.navigateByUrl('/my-shipment?t='+url);
  }
}
