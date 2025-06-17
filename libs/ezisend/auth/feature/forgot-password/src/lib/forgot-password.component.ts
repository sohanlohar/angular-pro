import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'pos-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  footerLink = false;
  title = 'Forgot Your Password?';
  pro='';
  description = `Please verify your email by clicking on the link that will be sent to your email. 
                Please check your <b>spam folder</b> if you did not receive the email.`;
}
