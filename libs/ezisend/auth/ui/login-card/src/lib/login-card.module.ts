import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginCardComponent } from './login-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core'; 
import { MatIconModule } from '@angular/material/icon';
import {RouterModule} from '@angular/router';
@NgModule({
  imports: [CommonModule,MatButtonModule,MatRippleModule,MatIconModule,RouterModule],
  declarations: [
    LoginCardComponent
  ],
  exports: [
    LoginCardComponent
  ],
})
export class LoginCardModule {}
