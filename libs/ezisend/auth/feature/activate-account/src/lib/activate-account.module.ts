import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivateAccountModule as ActivateAccountFormModule } from '@pos/ezisend/auth/ui/activate-account';
import { ActivateAccountComponent } from './activate-account.component';
import { AuthPageModule } from '@pos/ezisend/auth/ui/auth-page';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    AuthPageModule,
    ActivateAccountFormModule,
    RouterModule.forChild([{ path: '', component: ActivateAccountComponent }]),
  ],
  declarations: [ActivateAccountComponent],
})
export class ActivateAccountModule {}
