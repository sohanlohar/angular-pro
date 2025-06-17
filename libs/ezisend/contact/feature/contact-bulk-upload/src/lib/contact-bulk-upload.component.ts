import { Component, OnInit } from '@angular/core';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
    selector: 'pos-contact-bulk-upload',
    templateUrl: 'contact-bulk-upload.component.html',
    styleUrls: ['contact-bulk-upload.component.scss']
})

export class BulkContactComponent implements OnInit {
downloadTemplate(arg0: any) {
throw new Error('Method not implemented.');
}


  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.contact :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.contact :
    en.data.contact;

  constructor(public commonService: CommonService, private translate: TranslationService) {
    this.AssignLanguageLabel();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.contact
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.contact
      }
      this.AssignLanguageLabel();
    })
  }

    ngOnInit() {
      this.commonService._selectedTab.index = 4;
    }

    selectedIndex = 0;
    description = '';

    breadcrumbItems: BreadcrumbItem[] = [];

  AssignLanguageLabel(){
    this.breadcrumbItems = [
      {
        title: this.languageData.home,  // 'Home',
        routerLink: [''],
        external: false,
        current: false,
      },
      {
        title: this.languageData.bulk_upload,  // 'Bulk Contact',
        external: false,
        current: true,
      },
    ];
  }
}
