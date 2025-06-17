import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { ProfileFormModule } from '@pos/ezisend/profile/ui/profile-form';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { PickupAddressModule } from '@pos/ezisend/profile/feature/pickup-address';
import { GeneralFormModule } from '@pos/ezisend/shared/ui/forms/general-form';
import { MatExpansionModule } from '@angular/material/expansion';
import { UserManagementComponent } from './user-management.component';
import {EzisendUserManagementUiAddUserFormModule} from '@pos/ezisend/user-management/ui/add-user-form';
import {MatButtonModule} from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {EzisendUserManagementUiAccountAccessFormModule} from '@pos/ezisend/user-management/ui/account-access-form';
@NgModule({
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    PageLayoutModule,
    ProfileFormModule,
    PickupAddressModule,
    MatTabsModule,
    MatButtonModule,
    GeneralFormModule,
    MatExpansionModule,
    MatTableModule,
    MatIconModule,
    EzisendUserManagementUiAccountAccessFormModule,
    EzisendUserManagementUiAddUserFormModule,
    RouterModule.forChild([{ path: '', component: UserManagementComponent }]),
  ],
  declarations: [UserManagementComponent],
})
export class EzisendUserManagementFeatureAddUserModule {}