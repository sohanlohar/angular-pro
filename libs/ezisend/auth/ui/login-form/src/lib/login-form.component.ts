import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { LoginFacade } from '@pos/ezisend/auth/data-access/store';
import { Subscription } from 'rxjs';
declare const window: any;
@Component({
  selector: 'pos-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent implements OnInit, OnDestroy {
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  loginLoadingSubscription?: Subscription;
  isSubmitting = false;

  constructor(
    private fb: UntypedFormBuilder,
    private loginFacade: LoginFacade,
    private cdr: ChangeDetectorRef
  ) {}

  @Output()
  loginSubmit = new EventEmitter();
  pwdToggle = false;

  errorHandler(field: string, val: string) {
    return this.loginForm.controls[field].hasError(val);
  }

  handleSubmit() {
    if (this.loginForm.valid) this.loginSubmit.emit(this.loginForm.value);
  }

  ngOnInit(): void {
    this.loginLoadingSubscription = this.loginFacade.loginLoading$.subscribe(
      (loadingState) => {
        this.isSubmitting = loadingState;
        this.cdr.detectChanges();
      }
    );
    window.dataLayer.push({
      event: 'begin_login',
      event_category: 'SendParcel Pro - Login',
      event_action: 'Begin Login',
      event_label: 'Login',
    });
  }

  trackingEmail() {
    window.dataLayer.push({
      event: 'begin_resend_activation_email',
      event_category: 'SendParcel Pro - Login',
      event_action: 'Begin Resend Activation Email',
      event_label: 'Resend Activation Email',
    });
  }
  tracking() {
    window.dataLayer.push({
      event: 'forgot_password',
      event_category: 'SendParcel Pro - Login',
      event_action: 'Click Forgot Password',
      event_label: 'Forgot Password',
    });
  }

  ngOnDestroy(): void {
    if (this.loginLoadingSubscription) {
      this.loginLoadingSubscription.unsubscribe();
    }
  }
}
