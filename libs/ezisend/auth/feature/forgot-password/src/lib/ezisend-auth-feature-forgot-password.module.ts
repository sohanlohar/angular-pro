import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthPageModule } from '@pos/ezisend/auth/ui/auth-page';
import { ForgotPasswordUIModule } from '@pos/ezisend/auth/ui/forgot-password';

@NgModule({
  imports: [
    CommonModule,
    AuthPageModule,
    ForgotPasswordUIModule,
    RouterModule.forChild([
      {path: '', pathMatch: 'full', component: ForgotPasswordComponent}
    ]),
  ],
  declarations: [ForgotPasswordComponent],
})
export class EzisendAuthFeatureForgotPasswordModule {}
