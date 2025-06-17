import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, Input } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { CustomSnackbarComponent } from 'libs/ezisend/shared/ui/custom-snackbar/src/lib/custom-snackbar.component';
import { Subject, takeUntil } from 'rxjs';
declare const window: any;

@Component({
  selector: 'pos-forgot-password-ui',
  templateUrl: './forgot-password-ui.component.html',
  styleUrls: ['./forgot-password-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordUIComponent implements OnDestroy {
  errMsg = '';
  isSubmitting = false;
  protected _onDestroy = new Subject<void>();
  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(this.commonService.emailOnly)]],
  });
  forgotPasswordForm2 = this.fb.group({
    number: ['', [Validators.required, Validators.pattern(this.commonService.numericOnly)]],
  });
  @Input() placeholder = 'Email Address';
  @Input() reactivate = '';
  @Input() emptyError = 'Enter Email Address';

  constructor(
    private fb: UntypedFormBuilder, 
    private router: Router,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef) {
    }

  navToLogin() {
    this.router.navigate(['/auth/login']);
  }

  errorHandler(field:string, val:string) {
    return this.forgotPasswordForm.controls[field].hasError(val);
  }

  errorHandler2(field:string, val:string) {
    return this.forgotPasswordForm2.controls[field].hasError(val);
  }

  openSuccessDialog() {
    window.dataLayer.push({
      "event": "reset_password_send_email",
      "event_category": "SendParcel Pro - Login",
      "event_action": "Reset Password Send Email",
      "event_label": "Reset Password - Success"
      });
    this.dialog.open(DialogComponent,  {
      data: {
        descriptions: `Reset password has been sent to your Email Address. 
        Check in your spam folder if no email is received.`,
        icon: 'success',
        width: 400,
        confirmEvent: true,
        actionText: 'Return to Login',
        actionUrl: 'auth/login'
      },
    });
  }

  openSuccessActivationDialog(email:string) {
    this.dialog.open(DialogComponent,  {
      data: {
        descriptions: `Activation email has been sent to your Email Address ${email}`,
        icon: 'success',
        width: 400,
        confirmEvent: true,
        actionText: 'Return to Login',
        actionUrl: 'auth/login'
      },
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['mat-toolbar']
    });
  }
  openCustomSnackBar(message: string, action: string)   
  {
     this._snackBar.openFromComponent<CustomSnackbarComponent>(CustomSnackbarComponent, {
       data: { message, action},
       duration: 5000,
       panelClass: ['mat-toolbar']
     });
   }
  reactivateEmail(f:any) {
    this.isSubmitting = true;
    const accEmail = f.value.email
    this.commonService.submitData('account','sendactivationemail',{email: accEmail})
    .pipe(
      takeUntil(this._onDestroy)
    )
    .subscribe({
      next: (data) => {
        this.openSuccessActivationDialog(data?.data?.email);
        this.isSubmitting = false;
        this.cdr.detectChanges();
        const successEvent = {
          "event": "submit_resend_activation_email",
          "event_category": "SendParcel Pro - Login",
          "event_action": "Submit Resend Activation Email",
          "event_label": "Resend Activation Email"
        }
        window.dataLayer.push(successEvent);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
         const failureEvent = {
          "event": "resend_activation_email_failure",
          "event_category": "SendParcel Pro - Login",
          "event_action": "Resend Activation Email Failure",
          "event_label": "Resend Activation Email Failure - Account Blocked"
          };
          window.dataLayer.push(failureEvent);
        if(err.error.status === 400) {
          if(err.error.error.code === 'E1003'){
            this.openSnackBar(
              'Email must be a valid Email Address.',
              'close'
            )
          } 
          else if(err.error.error.code === 'E1004'){
            this.openCustomSnackBar(
              'Oops. This account is already activated.', 
              'close'
            );
          } 
          else if(err.error.error.code === 'E2007'){
            this.openCustomSnackBar(              
              `Oops. This account is already activated. Please click  <a href="/auth/forgot-password">here</a> to reset your password.`, 
              'close'
            )
          }
          else if(err.error.error.code === 'E2008'){
            this.openSnackBar(              
              `Email address is invalid. Please use your registered email address.`, 
              'close'
            )
          }
          else if(err.error.error.code === 'E2002'){
            this.openSnackBar(              
              `Account invalid or blocked. Please contact customer support.`, 
              'close'
            )
          }
        } else if(err.error.status === 403){
          this.openSnackBar(
            'Oops. Account is blocked. PLease contact your account manager for assistance.',
            'close'
          )
        } else if(err.error.status === 500){
          this.openSnackBar(
            'Error getting account information.',
            'close'
          )
        }
        this.errMsg = err.error?.error?.message;
      }
    })
  }

  onSubmit(f: any) {
    this.isSubmitting = true;
    const emailTrim = (f.value.email)?.replace(/\s/g, '');
    const email = (emailTrim)?.toLowerCase();
    this.commonService.submitData('password', 'reset',{ email: email})
    .pipe(
      takeUntil(this._onDestroy)
    )
    .subscribe({
      next: () => {
        this.openSuccessDialog();
        this.isSubmitting = false;
        this.cdr.detectChanges();
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        const successEvent = {
          "event": "submit_resend_activation_email",
          "event_category": "SendParcel Pro - Login",
          "event_action": "Submit Resend Activation Email",
          "event_label": "Resend Activation Email - Forgot Password"
        }
        window.dataLayer.push(successEvent);
      },
      error: (err) => {
        const failureEvent = {
          "event": "reset_password_send_email",
          "event_category": "SendParcel Pro - Login",
          "event_action": "Reset Password Send Email",
          "event_label": "Reset Password - Failure "
        };
        window.dataLayer.push(failureEvent);
        this.isSubmitting = false;
        this.cdr.detectChanges();
        this.openSnackBar(
          'If that mail address exists in our system, then we will send password reset link.',
          'close'
        );
        this.errMsg = err.error?.error?.message;
      }
    })
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
