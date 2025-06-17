import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { PickupCardListComponent } from './pickup-card-list.component';

@NgModule({
  imports: [
    CommonModule, 
    MatInputModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatIconModule,
    FormsModule,
  ],
  declarations: [PickupCardListComponent],
  exports: [PickupCardListComponent],
})
export class EzisendSharedUiPickupCardListModule {}
