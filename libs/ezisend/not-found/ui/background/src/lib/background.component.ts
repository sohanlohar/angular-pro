import { Component } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-not-found-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss'],
})
export class BackgroundComponent {
  errorCode = '404';
  errorTitle = 'Page not found';
  errorDescription = 'The requested link is not found or has expired.';
  
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.error_handling :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.error_handling :
    en.data.error_handling;

  constructor(private route: ActivatedRoute,private translate: TranslationService) {
    this.extractRouteData();
    this.assignLanguageLabel();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.error_handling;
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.error_handling;
      }
      this.assignLanguageLabel();
    })
  }

  assignLanguageLabel() {
    this.errorTitle = this.languageData.page_not_found;
    this.errorDescription = this.languageData.link_not_found;
  }

  private extractRouteData() {
    this.route.data.subscribe((data: Data) => {
      if (
        Object.keys(data).length !== 0 &&
        data['errorCode'] &&
        data['errorTitle'] &&
        data['errorDescription']
      ) {
        for (const key in data) {
          this[key as keyof BackgroundComponent] = data[key];
        }
      }
    });
  }
}
