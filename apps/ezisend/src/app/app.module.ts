import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { EzisendShellFeatureModule } from '@pos/ezisend/shell/feature';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, EzisendShellFeatureModule, NgxDaterangepickerMd.forRoot()],
  bootstrap: [AppComponent],
})
export class AppModule {}
