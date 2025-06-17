import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PluginsCardComponent } from './plugins-card.component';

@NgModule({
  imports: [CommonModule],
  declarations: [PluginsCardComponent],
  exports: [PluginsCardComponent],
})
export class EzisendSharedUiPluginsCardModule {}
