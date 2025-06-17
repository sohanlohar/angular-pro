import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { CommonService } from '@pos/ezisend/shared/data-access/services';

import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Injectable({
  providedIn: 'root',
})
export class MobileBlockGuard implements CanActivate {
    languageData: any =
    localStorage.getItem('language') &&
    localStorage.getItem('language') === 'en'
        ? en.data.dashboard
        : localStorage.getItem('language') &&
        localStorage.getItem('language') === 'my'
        ? bm.data.dashboard
        : en.data.dashboard;

    constructor(
        private router: Router, 
        public dialog: MatDialog,
        private commonService: CommonService,
        private translate: TranslationService
    ) {
        this.translate.buttonClick$.subscribe(() => {
            if (localStorage.getItem('language') == 'en') {
              this.languageData = en.data.dashboard;
            } else if (localStorage.getItem('language') == 'my') {
              this.languageData = bm.data.dashboard;
            }      
        });
    }

    canActivate(): boolean {
        if(this.commonService.checkIfMobile()){
            const dialogRefConfig = new MatDialogConfig();
            dialogRefConfig.data = {
                descriptions: this.languageData.not_access_to_mobile,
                confirmEvent: true,
                actionText: this.languageData.okay
            };

            const dialogRef = this.dialog.open(DialogComponent, dialogRefConfig);
            const dialogSubmitSubscription =
                dialogRef.componentInstance.confirmEvent.subscribe((result) => {
                if (result) 
                dialogSubmitSubscription.unsubscribe();
                dialogRef.close(); 
                // this.router.navigate(['/']);
            });
            return false;
        }
        return true;
    }
}
