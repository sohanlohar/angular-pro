import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { RouterModule } from '@angular/router';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { ActionTileModule } from '@pos/ezisend/dashboard/ui/action-tile';
import { NewsPromoModule } from '@pos/ezisend/dashboard/ui/news-promo';
import { ShipmentSummaryModule } from '@pos/ezisend/dashboard/ui/shipment-summary';
import { EzisendDashboardUiDashboardMainTileModule } from '@pos/ezisend/dashboard/ui/dashboard-main-tile';
import { EzisendDashboardUiInsightsModule } from '@pos/ezisend/dashboard/ui/insights';
import { BannerModule } from '@pos/ezisend/shared/ui/banner';

@NgModule({
  imports: [
    CommonModule,
    PageLayoutModule,
    ActionTileModule,
    EzisendDashboardUiDashboardMainTileModule,
    NewsPromoModule,
    ShipmentSummaryModule,
    EzisendDashboardUiInsightsModule,
    RouterModule.forChild([{ path: '', component: DashboardComponent }]),
    BannerModule
  ],
  declarations: [DashboardComponent],
})
export class DashboardFeatureModule {}
