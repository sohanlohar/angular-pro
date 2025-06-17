import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'activate-email',
  templateUrl: './activate-email.component.html',
  styleUrls: ['./activate-email.component.scss'],
})
export class ActivateEmailComponent implements OnInit {
  constructor() {}

  isLoading = false;
  isFTUser = false;
  emailToken = '';
  isActive = '';
  pro = '';
  title = 'Resend Activation Email';
  description = `We will send an activation email to the email address registered under your account.`;
  footerLink = false;

  ngOnInit(): void {}
}
