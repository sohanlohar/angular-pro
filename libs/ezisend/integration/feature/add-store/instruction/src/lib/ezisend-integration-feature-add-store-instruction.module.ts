import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InstructionComponent } from './instruction.component';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';


@NgModule({
  imports: [
    CommonModule,
    PageLayoutModule,


    RouterModule.forChild([
       {path: '', pathMatch: 'full', component: InstructionComponent}
    ]),
  ],
  declarations:[InstructionComponent]
})
export class EzisendIntegrationFeatureAddStoreInstructionModule {}
