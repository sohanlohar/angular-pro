import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'pos-return-order-form',
  templateUrl: './return-order-form.component.html',
  styleUrls: ['./return-order-form.component.scss'],
})
export class ReturnOrderFormComponent implements OnInit, OnDestroy {
  protected _onDestroy = new Subject<void>();
  constructor(public commonService:CommonService) { // Made commonService public for potential template access
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
      this.commonService.isMPS.next(data.data?.feature_mps);
    });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  ngOnInit(): void {}

  /**
   * Handles changes from the form editing the "sender of the return" (original recipient's details).
   * This method should be connected to an output event from that form component in your template.
   * For example, in return-order-form.component.html:
   * <pos-recipient-detail-form ... (formDataChange)="onOriginalRecipientFormChange($event)"></pos-recipient-detail-form>
   * @param updatedData The updated form data for the original recipient.
   */
  onOriginalRecipientFormChange(updatedData: any): void {
    this.commonService.setRecipientDetail(updatedData);
  }
}