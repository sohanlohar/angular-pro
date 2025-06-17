import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotFoundComponent } from './not-found.component';
import { EzisendNotFoundUiBackgroundModule } from '@pos/ezisend/not-found/ui/background';

@NgModule({
  imports: [
    CommonModule,
    EzisendNotFoundUiBackgroundModule,
    RouterModule.forChild([
      {path: '', pathMatch: 'full', component: NotFoundComponent}
    ]),
  ],
  declarations: [
    NotFoundComponent,
  ],
})
export class EzisendNotFoundFeatureNotFoundModule {}
