import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EzisendSharedUiPluginsCardModule } from 'libs/ezisend/shared/ui/plugins-card/src';
import { AddStore } from './add-store.component';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { ActionTileModule } from '@pos/ezisend/dashboard/ui/action-tile';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControlWrapperModule } from '@pos/ezisend/shared/ui/forms/form-control-wrapper';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    EzisendSharedUiPluginsCardModule,
    PageLayoutModule,
    ActionTileModule,
    MatFormFieldModule,
    FormControlWrapperModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,

    RouterModule.forChild([
        {path: '', pathMatch: 'full', redirectTo: 'integration'},
        {path: 'add-store', pathMatch: 'full', component: AddStore},
    ]),
  ],
  declarations:[AddStore]
})
export class EzisendIntegrationFeatureAddStoreAddStoreModule {}
