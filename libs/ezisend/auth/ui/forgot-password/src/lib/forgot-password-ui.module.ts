import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgotPasswordUIComponent } from './forgot-password-ui.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  declarations: [
    ForgotPasswordUIComponent
  ],
  exports: [
    ForgotPasswordUIComponent
  ],
})
export class ForgotPasswordUIModule {}
