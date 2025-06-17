import { Component, OnInit } from '@angular/core';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { environment } from '@pos/shared/environments';

@Component({
    selector: 'plugins-instruction',
    templateUrl: './instruction.component.html',
    styleUrls:['./instruction.component.scss']
})

export class InstructionComponent implements OnInit {

  shopifyURL = environment.shopifyURL;
  wooCommerceURL = environment.wooCommerceURL;
  posMalaysiaPluginURL = environment.posMalaysiaPluginURL;
  wooCommercePluginURL = environment.templateAPI+'PosPluginWooCommerce_v1.0.6.zip';

    constructor(
      public commonService : CommonService
    ) { }

    ngOnInit() { }

    plugin = this.commonService.selectedPlugin
    wooCommerceSvg = './assets/wooCommerce2.svg'
    shopifySvg = './assets/shopify2.svg'
    posLaju='./assets/pos-logo.svg'
    step1 = './assets/wooGuide1.svg' 
    step2 = './assets/wooGuide2.svg'
    step3 = './assets/wooGuide3.svg'
    step4 = './assets/wooGuide4.svg'
    shopifyGuide1 = './assets/shopifyGuide1.svg'
    shopifyGuide2 = './assets/shopifyGuide2.svg'
    shopifyGuide3 = './assets/shopifyGuide3.svg'
    shopifyGuide4 = './assets/shopifyGuide4.svg'
    breadcrumbItems: BreadcrumbItem[] = [
        {
          title: 'Home',
          routerLink: [''],
          external: false,
          current: false,
        },
        {
          title: 'Add Store',
          routerLink: ['/integration/add-store'],
          external: false,
          current: false,
        },
        {
          title: this.commonService.selectedPlugin.getValue(),
          external: false,
          current: true,
        },
      ];
}