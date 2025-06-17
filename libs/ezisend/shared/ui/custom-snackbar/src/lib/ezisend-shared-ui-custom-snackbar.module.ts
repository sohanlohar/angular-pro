import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { CustomSnackbarComponent } from './custom-snackbar.component';

export const ezisendSharedUiCustomSnackbarRoutes: Route[] = [];

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [CustomSnackbarComponent],
  exports: [CustomSnackbarComponent],
})
export class EzisendSharedUiCustomSnackbarModule {}
