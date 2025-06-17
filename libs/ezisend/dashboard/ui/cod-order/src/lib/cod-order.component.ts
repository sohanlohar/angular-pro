import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { TranslationService } from 'libs/ezisend/shared-services/translate.service';
import { bm } from 'libs/ezisend/assets/my';
import { en } from 'libs/ezisend/assets/en';
@Component({
  selector: 'pos-cod-order',
  templateUrl: './cod-order.component.html',
  styleUrls: ['./cod-order.component.scss'],
})
export class CodOrderComponent implements OnInit {
  private readonly themeMap = {
    green: 'green-theme-color',
    blue: 'blue-theme-color',
    red: 'red-theme-color',
  };
  @Input() theme = 'green';
  @Input() icon = '';
  @Input() label = '';
  @Input() price = '';
  @Input() status = '';
  data: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
    (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
      en.data
  constructor(
    private _commonService: CommonService,
    private translate: TranslationService
    ) {}
  ngOnInit(): void {
    this.theme =
      this.themeMap[this.theme as keyof typeof this.themeMap] ??
      'green-theme-color';
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.data = en.data;
      }
      else if (localStorage.getItem("language") == "my") {
        this.data = bm.data
      }
    })  
  }
  openShipment() {
    const activeTab =
      this.status === 'live'
      ? 'live-shipment'
      : this.status === 'delivered'
      ? 'delivered'
      : this.status === 'failed'
      ? 'fail-delivered'
      : '';
      const eventDetails = {
        event: 'go_to_shipment',
        event_category: 'SendParcel Pro - Dashboard',
        event_action: 'Go To Shipment',
        event_label: this.status === 'delivered' 
          ? 'My COD Orders - Collected From Recipient' 
          : this.status === 'failed' 
          ? 'My COD Orders - Failed to Collect' 
          : this.status === 'live' 
          ? 'My COD Orders - Pending Collections' 
          : '',
      };
    this._commonService.googleEventPush(eventDetails);
    this._commonService.redirectTo('/my-shipment', { t: activeTab, q: 'cod' });
  }
}
