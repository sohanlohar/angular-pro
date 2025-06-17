import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'pos-password-reset',
  templateUrl: './password-reset.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
      pos-password-reset-form {
        margin-top: 1rem;
      }
  `]
})
export class PasswordResetComponent implements OnDestroy {
  isLoading = false;
  isFTUser = false;
  emailToken = '';
  isActive = '';
  pro = '';
  title = 'Change your Password';
  description = `Please fill in the fields below with your new password`;
  footerLink = false;
  protected _onDestroy = new Subject<void>();

  constructor(
    private activeRouter: ActivatedRoute,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
  ) {
    this.isLoading = true;
    activeRouter.queryParams
    .pipe(
      takeUntil(this._onDestroy)
    )
    .subscribe({
      next: (params) => {
        if(params['isactivation'] === 'true') {
          this.title = 'Congratulations! Your account has been activated!';
          this.description = 'Please create a Password to begin using your account';
          this.footerLink = false;
          this.isFTUser = true;
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
        this.isActive = params['isactivation'];
        this.emailToken = params['EmailToken'];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: ()=>{
        this.commonService.openErrorDialog();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
