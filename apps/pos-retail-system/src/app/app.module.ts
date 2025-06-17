import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { WebShellFeatureModule } from '@pos/web/shell/feature';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, WebShellFeatureModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
