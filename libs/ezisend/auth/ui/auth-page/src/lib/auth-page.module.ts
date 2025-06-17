import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundModule } from '@pos/ezisend/auth/ui/background';
import { LoginCardModule } from '@pos/ezisend/auth/ui/login-card';
import { AuthPageComponent } from './auth-page.component';
import { BannerModule } from '@pos/ezisend/shared/ui/banner';

@NgModule({
  imports: [CommonModule, BackgroundModule, LoginCardModule, BannerModule],
  declarations: [AuthPageComponent],
  exports: [AuthPageComponent],
})
export class AuthPageModule {}
