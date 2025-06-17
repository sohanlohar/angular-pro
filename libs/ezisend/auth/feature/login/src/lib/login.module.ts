import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFormModule } from '@pos/ezisend/auth/ui/login-form';
import { AuthPageModule } from '@pos/ezisend/auth/ui/auth-page';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  imports: [
    CommonModule,
    AuthPageModule,
    LoginFormModule,
    MatSnackBarModule,
    RouterModule.forChild([{ path: '', component: LoginComponent }]),
  ],
  declarations: [LoginComponent],
})
export class LoginModule {}
