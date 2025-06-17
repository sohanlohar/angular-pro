import { Component, OnInit } from '@angular/core';
import { RateCalculatorService } from 'libs/ezisend/shipment/ui/rate-calc/services/rate-calc.service';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';

@Component({
  selector: 'pos-rate-calc-feature',
  templateUrl: './rate-calc-feature.component.html',
  styleUrls: ['./rate-calc-feature.component.scss'],
})
export class RateCalcFeatureComponent implements OnInit {
  
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.rate_calulator :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.rate_calulator :
    en.data.rate_calulator;

  panelOpenState: 'none' | 'shipment' | 'rateCard' = 'none';
  currentUserId!: string;
  breadcrumbItems: BreadcrumbItem[] = [];

  constructor(private rateCalculatorService: RateCalculatorService, private translate: TranslationService){
    this.rateCalculatorService._tabName.subscribe((panel : any) =>{
      this.panelOpenState = panel;
    })

    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.rate_calulator;
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.rate_calulator
      }
    })
  }

  ngOnInit() {
    this.currentUserId = this.getCurrentUserId();
    this.setInitialPanelState();
    this.assignLanguageLabel();
  }

  setPanelOpenState(panel: 'none' | 'shipment' | 'rateCard') {
    this.panelOpenState = panel;
  }

  setInitialPanelState() {
    return
  }

  checkIfRateCardIsConfigured(): boolean {
    const configKey = `rateCardConfigured_${this.currentUserId}`;
    const isConfigured = localStorage.getItem(configKey) === 'true';
    return isConfigured;
  }

  setRateCardConfigured(isConfigured: boolean) {
    const configKey = `rateCardConfigured_${this.currentUserId}`;
    localStorage.setItem(configKey, isConfigured.toString());
  }

  getCurrentUserId(): string {
    return 'newUser';
  }

  assignLanguageLabel(){
    this.breadcrumbItems = [
      {
        title: this.languageData?.home,
        routerLink: [''],
        external: false,
        current: false,
      },
      {
        title: this.languageData?.rate_calculator,
        external: false,
        current: true,
      },
    ];
  }
}
