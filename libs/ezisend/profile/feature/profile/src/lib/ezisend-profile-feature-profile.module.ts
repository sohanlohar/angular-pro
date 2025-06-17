import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { GeneralFormModule } from '@pos/ezisend/shared/ui/forms/general-form';

@NgModule({
  imports: [CommonModule, GeneralFormModule],
  declarations: [ProfileComponent],
  exports: [ProfileComponent],
})
export class EzisendProfileFeatureProfileModule {}
