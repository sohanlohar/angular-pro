import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { LoginService } from '@pos/ezisend/auth/data-access/services';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { environment } from '@pos/shared/environments';
import { Subject, takeUntil } from 'rxjs';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-bulk-dom-intl-shipment',
  templateUrl: './bulk-dom-intl-shipment.component.html',
  styleUrls: ['./bulk-dom-intl-shipment.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class BulkDomIntlShipmentComponent implements OnInit {
  @Input() BU_type: any;
  title = '';
  description = '';
  templateAPI = environment.templateAPI;
  templateHSC = environment.templateHSCUrl;
  protected _onDestroy = new Subject<void>();
  data: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.bulkShipment :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.bulkShipment :
    en.data.bulkShipment;

  languageSelected:string = 'EN'; // is used to just manage the EN | MY meaningfull sentence
  isMelPlusCod:any;

  constructor(private loginService: LoginService, private cdr: ChangeDetectorRef, private commonService: CommonService, private translate: TranslationService) {
    this.commonService.getIsMelplusCod$.subscribe(res=>{
      this.isMelPlusCod = res;
    })

    this.languageSelected = localStorage.getItem("language") == "my" ? 'MY' : 'EN';

    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.data = en.data.bulkShipment
        this.languageSelected = 'EN';
      }
      else if (localStorage.getItem("language") == "my") {
        this.data = bm.data.bulkShipment
        this.languageSelected = 'MY';
      }
      this.tabSelection();
    })
  }


  ngOnInit(): void {
    this.tabSelection();
  }

  /**
   * Method Name:   tabSelection
   * 
   * Input Parameters: -
   * 
   * Output Parameters:
   *   - The method updates the component's title and description properties..
   * 
   * Purpose:
   *   - Updates the component's title and description based on the current (BU) type and relevant conditions.
   *   - Reactively updates the title based on changes to the COD status (only for the domestic BU type).
   * 
   * Author:
   *   - Sridhar | Clayton
   * 
   * Description:
   *   - This method dynamically updates the component's title and description based on the current (BU) type 
   *      and relevant conditions.
   */
  tabSelection() {
    // this.commonService._selectedTab.index = 0;
    if(this.BU_type === 'dom') {
      this.commonService._selectedTab.index = 0;
      this.commonService.isCODUbat
      .pipe(takeUntil(this._onDestroy))
      .subscribe((data) => {
        if(data) {
          this.title = 'COD Ubat';
        } else {
          this.title = this.loginService.getCodStatus() ? `${this.data.domestic_lower} / COD` : `${this.data.domestic_lower}`;
        }
        this.cdr.detectChanges();
      })

      this.description = this.data.within_east_west;
    } else if(this.BU_type === 'melplus') {
      this.commonService.isMelPlus
          .pipe(takeUntil(this._onDestroy))
          .subscribe((data) => {
            if(data) {
              this.title = 'MelPlus' + (this.isMelPlusCod ? ' COD' : '');
            }
            this.cdr.detectChanges();
          })
          this.description = this.data.within_east_west;
    } else if(this.BU_type === 'bulk-contact'){
      this.title = this.data.contact_upload_templete;
    } else if(this.BU_type === 'mps'){
      this.commonService.isMPS
          .pipe(takeUntil(this._onDestroy))
          .subscribe((data) => {
            if(data) {
              this.title = 'MPS';
            }
            this.cdr.detectChanges();
          })
          this.description = this.data.within_east_west;
    }
    else {
      this.title = this.data.international;
      this.description = this.data.outside_malasiya;
    }
    this.loginService.codStatusUpdated.subscribe(latestStatus => {
      if(this.BU_type === 'dom') {
          this.commonService.isCODUbat
          .pipe(takeUntil(this._onDestroy))
          .subscribe((data) => {
            if(data) {
              this.title = 'COD Ubat';
            } else {
              this.title = latestStatus ? `${this.data.domestic_lower} / COD` : `${this.data.domestic_lower}`;
            }
            this.cdr.detectChanges();
          })

      }
      this.cdr.detectChanges();
    })
  }

  /**
   * Method Name: downloadTemplate
   * 
   * Input Parameters:
   *   - val: A string representing the type of template to download. 
   *   - Possible values: dom, bulk, melplus, bulk-contact, or mps.
   * 
   * Output Parameters:
   *   - Returns a string representing the URL of the desired template file.
   * 
   * Purpose:
   *   - This method dynamically determines the appropriate template file URL based on the provided val parameter.
   *   - It takes into account various conditions, such as the user's COD status, MelPlus status, and the type of shipment.
   * 
   * Author:
   *   - Sridhar | Clayton
   * 
   * Description:
   *   - The method returns the URL of the desired template file.
   */
  downloadTemplate(val:any) {
    if(val === 'dom') {
      if(this.commonService.isCODUbat.getValue() === true) {
        return this.templateAPI + 'Bulk_Upload_COD_Ubat_Domestic_Shipment.xlsx';
      }
      else {
        if(this.loginService.getCodStatus()) {
          return this.templateAPI + 'Bulk_Upload_COD_Domestic_Shipment.xlsx';
        }
        else {
          return this.templateAPI + 'Bulk_Upload_Domestic_NON_COD_Shipment.xlsx';
        }
      }

    }else if(val === 'bulk'){
      return this.templateAPI + 'Bulk_Upload_International_Shipment.xlsx';
    }
    else if(val === 'melplus') {
      let fileName = this.isMelPlusCod ? 'Bulk_Upload_MelPlus_COD_Shipment.xlsx' :  'Bulk_Upload_MelPlus_Shipment.xlsx';
      return this.templateAPI + fileName;
    }
    else if(val === 'bulk-contact'){
      return this.templateAPI + 'Contact_Bulk_Upload_Template.xlsx';
    }
    else {
      return this.templateAPI + 'MPS_Bulk_Upload.xlsx'
    }
  }

  downloadHScode() {
    return this.templateHSC + 'HS_Code_ISO_Code.xlsx';
  }

}
