import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, Input, Inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'pos-custom-snackbar',
  templateUrl: './custom-snackbar.component.html',
  styleUrls: ['./custom-snackbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CustomSnackbarComponent {

  constructor(
    private _snackBar: MatSnackBar,
    @Inject(MAT_SNACK_BAR_DATA)  
  public data: { message: string, action: string}) {}

  closeSnackBar() {
    this._snackBar.dismiss();
  }

}
