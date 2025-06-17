import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ButtonInfo } from '@pos/ezisend/auth/data-access/models';

declare const window: any;
@Component({
  selector: 'pos-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginCardComponent {
  @Input() title: string | undefined;
  @Input() pro: string | undefined;
  @Input() description: string | undefined;
  @Input() footerLink: boolean | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() buttonList: ButtonInfo[] = [];


  trackingEvent(){
    const signUpEvent = {
    "event": "go_to_page",
    "event_category": "SendParcel Pro - Login",
    "event_action": "Go To Page",
    "event_label": "Sign Up"
    };
    window.dataLayer.push(signUpEvent)
  }
}
