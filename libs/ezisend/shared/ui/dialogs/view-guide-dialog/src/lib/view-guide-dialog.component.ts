import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { bm } from '../../../../../../assets/my';
import { en } from '../../../../../../assets/en';
import { TranslationService } from '../../../../../../shared-services/translate.service';
@Component({
  selector: 'pos-view-guide-dialog',
  templateUrl: './view-guide-dialog.component.html',
  styleUrls: ['./view-guide-dialog.component.scss'],
})
export class ViewGuideDialogComponent {
  
  public languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.myShipments :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.myShipments :
    en.data.myShipments;

  public isLanguageEnglish: string = (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? 'my' : 'en';

  constructor(
    public dialogRef: MatDialogRef<ViewGuideDialogComponent>,
    public commonService: CommonService,
    private sanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private translate: TranslationService
  ) {
    this.dialogRef.addPanelClass('dialog-container-custom');

    this.matIconRegistry.addSvgIcon(
      `close_icon`,
      this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/close-x.svg`)
    );
      
    this.translate.buttonClick$.subscribe(() => {
      
      this.isLanguageEnglish = 'en'; // by default

      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.myShipments;
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.myShipments;
        this.isLanguageEnglish = 'my';
      }
    })
  }

}

export function openViewGuideDialog(dialog: MatDialog, test:boolean) {
  const config = new MatDialogConfig();

  config.minWidth = 500;
  config.maxWidth = 850;

  const dialogRef = dialog.open(ViewGuideDialogComponent, config);

  return dialogRef.afterClosed();
}
