import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'pos-activate-account-form',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivateAccountComponent {
  activateAccountForm = this.fb.group({
    accountNo: ['', Validators.required],
    email: ['', Validators.required],
  });
  constructor(private fb: UntypedFormBuilder) {}
}
