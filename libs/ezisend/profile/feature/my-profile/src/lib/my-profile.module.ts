import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MyProfileComponent } from './my-profile.component';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { ProfileFormModule } from '@pos/ezisend/profile/ui/profile-form';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { PickupAddressModule } from '@pos/ezisend/profile/feature/pickup-address';
import { GeneralFormModule } from '@pos/ezisend/shared/ui/forms/general-form';
import { EzisendProfileFeatureProfileModule } from '../../../profile/src/lib/ezisend-profile-feature-profile.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    PageLayoutModule,
    ProfileFormModule,
    PickupAddressModule,
    MatButtonModule,
    MatTabsModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTooltipModule,
    GeneralFormModule,
    EzisendProfileFeatureProfileModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([{ path: '', component: MyProfileComponent }]),
  ],
  declarations: [MyProfileComponent],
})
export class MyProfileModule {}
