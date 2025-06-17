import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaunchPadComponent } from './launch-pad.component';
import { RouterModule } from '@angular/router';
import { LauncherCardViewModule } from '@pos/web/launch-pad/ui/launcher-card-view';

@NgModule({
  imports: [
    CommonModule,
    LauncherCardViewModule,
    RouterModule.forChild([{ path: '', component: LaunchPadComponent }]),
  ],
  declarations: [LaunchPadComponent],
  exports: [LaunchPadComponent],
})
export class WebLaunchPadFeatureModule {}
