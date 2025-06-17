import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivateEmailComponent } from './activate-email.component';
import { ForgotPasswordUIModule } from '@pos/ezisend/auth/ui/forgot-password';
import { RouterModule } from '@angular/router';
import { AuthPageModule } from '@pos/ezisend/auth/ui/auth-page';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [ActivateEmailComponent],
  imports: [
    CommonModule,
    ForgotPasswordUIModule,
    AuthPageModule,
    MatFormFieldModule,

    RouterModule.forChild([
      {path: '', pathMatch: 'full', component: ActivateEmailComponent}
    ]),
  ],
  exports: [ActivateEmailComponent]
})
export class ActivateEmailModule {}
