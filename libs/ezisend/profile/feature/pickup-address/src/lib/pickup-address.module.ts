import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PickupAddressComponent } from './pickup-address.component';
import { EzisendSharedUiPickupCardListModule } from '@pos/ezisend/shared/ui/pickup-card-list';
import { ProfileFormModule } from '@pos/ezisend/profile/ui/profile-form';
import { MatDialogModule } from '@angular/material/dialog';
import { GeneralFormDialogModule } from '@pos/ezisend/shared/ui/dialogs/general-form-dialog';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EzisendSharedUiPickupCardListModule,
    ProfileFormModule,
    MatDialogModule,
    GeneralFormDialogModule,
  ],
  declarations: [PickupAddressComponent],
  exports: [PickupAddressComponent],
})
export class PickupAddressModule {}
