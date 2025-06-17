import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BackgroundModule } from '@pos/ezisend/auth/ui/background';
import { LoginCardModule } from '@pos/ezisend/auth/ui/login-card';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    LoginCardModule,
    BackgroundModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
