import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordResetComponent } from './password-reset.component';
import { PasswordResetModule as PasswordResetFormModule } from '@pos/ezisend/auth/ui/password-reset';
import { AuthPageModule } from '@pos/ezisend/auth/ui/auth-page';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    PasswordResetFormModule,
    AuthPageModule,
    RouterModule.forChild([{ path: '', component: PasswordResetComponent }]),
  ],
  declarations: [PasswordResetComponent],
})
export class PasswordResetModule {}
