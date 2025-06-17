import { Component, OnDestroy, ViewChild } from '@angular/core';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { IPickupAddress } from 'libs/ezisend/profile/data-access/models/src/lib/model';
import { GeneralFormDialogComponent } from '@pos/ezisend/shared/ui/dialogs/general-form-dialog';
import { PickupCardListComponent } from '@pos/ezisend/shared/ui/pickup-card-list';
import { TranslationService } from 'libs/ezisend/shared-services/translate.service';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'pos-order-edit-form',
  templateUrl: './order-edit-form.component.html',
  styleUrls: ['./order-edit-form.component.scss']
})
export class OrderEditFormComponent implements OnDestroy {

  @ViewChild('cardList') cardList!: PickupCardListComponent;
  protected _onDestroy = new Subject<void>();

  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.myShipments :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.myShipments :
    en.data.myShipments;

  constructor(
    public dialog: MatDialog, 
    private translate: TranslationService,
    private commonService:CommonService){
    
      this.translate.buttonClick$.subscribe(() => {
        if (localStorage.getItem("language") == "en") {
          this.languageData = en.data.myShipments
        }
        else if (localStorage.getItem("language") == "my") {
          this.languageData = bm.data.myShipments
        }
      })

      this.commonService.countryList$ = this.commonService.getAPI(
        'countries',
        'list',
        0
      );
      this.commonService
      .fetchList('user', 'config')
      .pipe(takeUntil(this._onDestroy))
      .subscribe((data) => {
        this.commonService.isCOD.next(data.data?.feature_cod);
        this.commonService.isCODUbat.next(data.data?.feature_codubat);
        this.commonService.isMelPlus.next(data.data?.feature_melplus);
        this.commonService.isMelPlusCOD.next(data.data?.feature_melplus_cod);
        this.commonService.isMPS.next(data.data?.feature_mps);
      });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  onEventAddEditPickup(data: {isNew: boolean, item: IPickupAddress}) {
    const dialogRefConfig = new MatDialogConfig();
    dialogRefConfig.disableClose = true;
    dialogRefConfig.data = {
      title: (data && !data.isNew) ? this.languageData.update : this.languageData.add + ' '+ this.languageData.pick_up_address,
      formData: data?.item ? data.item : {},
      isNew: data && !data.isNew ? false : true
    };

    const dialogRef = this.dialog.open(GeneralFormDialogComponent, dialogRefConfig);

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((isEvent: boolean) => {
        if (isEvent) this.cardList.getPickUp();
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }
}
