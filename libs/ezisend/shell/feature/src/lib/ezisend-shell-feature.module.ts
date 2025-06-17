import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { shellRoutes } from './shell.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {
  MinimalRouterStateSerializer,
  StoreRouterConnectingModule,
} from '@ngrx/router-store';
import { DataPersistence } from '@nrwl/angular';

import {
  LoginFeature,
  LoginEffects,
} from '@pos/ezisend/auth/data-access/store';
import { Overlay } from '@angular/cdk/overlay';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { EzisendInterceptor } from '@pos/ezisend/shared/data-access/services';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';

const rootReducers = {
  [LoginFeature.LOGIN_FEATURE_KEY]: LoginFeature.reducer,
};

@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    StoreModule.forRoot(rootReducers),
    EffectsModule.forRoot([LoginEffects]),
    StoreDevtoolsModule.instrument(),
    StoreRouterConnectingModule.forRoot({
      serializer: MinimalRouterStateSerializer,
    }),
    RouterModule.forRoot(shellRoutes, { scrollPositionRestoration: 'top' }),
    MatMenuModule,
    ReactiveFormsModule
  ],
  exports: [RouterModule],
  providers: [
    DataPersistence,
    Overlay,
    { provide: HTTP_INTERCEPTORS, useClass: EzisendInterceptor, multi: true },
  ],
})
export class EzisendShellFeatureModule {}
