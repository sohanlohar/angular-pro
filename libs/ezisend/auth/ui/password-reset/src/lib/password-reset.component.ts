import { HttpHeaders } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { Subject, takeUntil } from 'rxjs';
declare const window: any;
@Component({
  selector: 'pos-password-reset-form',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordResetComponent implements OnDestroy {
  passwordsMatching = false;
  pwdShowIcon = false;
  cPwdShowIcon = false;
  isSubmitting = false;
  protected _onDestroy = new Subject<void>();
  @Input() isFTUser = false;
  @Input() token = '';
  @Input() isActive = '';
  isConfirmPasswordDirty = false;
  newPassword = new FormControl(null, [
    (c: AbstractControl) => Validators.required(c),
    Validators.pattern(
      /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/
    ),
  ]);
  confirmPassword = new FormControl(null, [
    (c: AbstractControl) => Validators.required(c),
    Validators.pattern(
      /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/
    ),
  ]);
  
  passwordResetForm = this.fb.group({
    password: this.newPassword,
    confirmPassword: this.confirmPassword,
  },
  {
    validator: this.confirmedValidator('password', 'confirmPassword'),
  });

  rules = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  };

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private commonService: CommonService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  confirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors?.['confirmedValidator']
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  openDialog(title:string, des:string, status:string, action:string) {
    this.dialog.open(DialogComponent,  {
      data: {
        title: title,
        descriptions: des,
        icon: status,
        width: 400,
        confirmEvent: true,
        actionText: action,
        actionUrl: 'auth/login'
      },
    });
  }

  onSubmit() {
    this.isSubmitting = true;
    if (this.passwordResetForm?.valid) {
      window.dataLayer.push({
        "event": "confirm_new_password",
        "event_category": "SendParcel Pro - Login - Change Password",
        "event_action": "Confirm New Password",
        "event_label": "New Password"
        });
      this.commonService.changePwd('password','save', {
        password: this.newPassword.value,
        password_confirm: this.confirmPassword.value
      }, {
        headers: new HttpHeaders().set(
          'Authorization',
          'EmailToken '+this.token
        ),
      })
      .pipe(
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next: () => {
          this.openDialog(
            this.isActive === 'true' ?  `Your password was successfully created!`: '', 
            this.isActive === 'true' ? 
            `Please login to your SendParcel PRO account now to start managing your shipments.` : 
            `Your password has been updated.`,
            'success',
            this.isActive === 'true' ? 'Login' : 'Return to Login');
            this.isSubmitting = false;
            this.cdr.detectChanges();
            window.dataLayer.push({
              "event": "confirm_password_success",
              "event_category": "SendParcel Pro - Login - Change Password",
              "event_action": "Confirm Password Success",
              "event_label": "Success"
              });
        },
        error: () => {
          this.openDialog(
            "Uh-oh", 
            this.isActive === 'true' ? 
            `Your password is not created as this account has been activated.<br>Please go to <b>Forgot Password</b> to reset password` : 
            `Your password cannot be updated<br>due to some error.<br>Go to <b>Forgot Password</b> to reset your password.`,
            'warning',
            'Return to Login');
            this.isSubmitting = false;
            this.cdr.detectChanges();
        }
      })
    }
  }

  navToLogin() {
    window.dataLayer.push({
      "event": "go_to_login",
      "event_category": "SendParcel Pro - Login - Change Password",
      "event_action": "Go To Login",
      "event_label": "Login"
      });
      
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Method Name: validatePassword
   *
   * Input Parameters:
   * - None explicitly, but it uses `this.passwordResetForm.get('password')?.value` to retrieve the password.
   *
   * Output Parameters:
   * - None explicitly, but updates the `this.rules` object with boolean values representing password validation 
   *   criteria.
   *
   * Purpose:
   * - To validate the strength of a password based on multiple criteria, including length, uppercase, lowercase, 
   *   numbers, and special characters.
   *
   * Author:
   * - Clayton
   *
   * Description:
   * - This method checks if a password meets several strength rules such as length (at least 8 characters), 
   *   inclusion of uppercase letters, lowercase letters, digits, and special characters from a specific set. 
   *   It updates the `this.rules` object with the validation results.
   */
  validatePassword() {
    let password:any = this.passwordResetForm.get('password')?.value;
    this.rules.length = password && password.length >= 8 && password.length <= 15;;
    this.rules.uppercase = /[A-Z]/.test(password);
    this.rules.lowercase = /[a-z]/.test(password);
    this.rules.number = /\d/.test(password);
    this.rules.symbol = /[!@#$&]/.test(password);
  }
}
