import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsightsComponent } from './insights.component';
import { ChartsModule } from 'ng2-charts';
import {MatTableModule} from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
@NgModule({
  imports: [CommonModule, ChartsModule, MatTableModule, MatProgressBarModule,NgxChartsModule,FlexLayoutModule,FormsModule],
  declarations: [InsightsComponent],
  exports: [InsightsComponent]
})
export class EzisendDashboardUiInsightsModule {}