import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactMainComponent } from './contact-main.component';
import { ContactTableModule } from '@pos/ezisend/contact/ui/contact-table';
import { ActionTileModule } from '@pos/ezisend/dashboard/ui/action-tile';
import { RouterModule } from '@angular/router';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';

@NgModule({
  imports: [
    CommonModule,
    PageLayoutModule,
    ContactTableModule,
    ActionTileModule,
    RouterModule.forChild([{ path: '', component: ContactMainComponent }]),
  ],
  declarations: [ContactMainComponent],
  exports: [ContactMainComponent],
})
export class ContactMainModule {}
