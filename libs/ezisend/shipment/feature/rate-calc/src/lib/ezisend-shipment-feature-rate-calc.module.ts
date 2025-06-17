import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RateCalcFeatureComponent } from './rate-calc-feature.component';
import { EzisendShipmentUiRateCalcModule } from '@pos/ezisend/shipment/ui/rate-calc';
import {MatExpansionModule} from '@angular/material/expansion';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';


@NgModule({
  imports: [
    PageLayoutModule,
    CommonModule,
    EzisendShipmentUiRateCalcModule,
    MatExpansionModule,
    RouterModule.forChild([{ path: '', pathMatch: 'full', component: RateCalcFeatureComponent }]),
  ],
  declarations: [RateCalcFeatureComponent],
})
export class EzisendShipmentFeatureRateCalcModule {}
