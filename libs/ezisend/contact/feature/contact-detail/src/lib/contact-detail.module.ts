import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactDetailsComponent } from './contact-details.component';
import { ContactFormModule } from '@pos/ezisend/contact/ui/contact-form';
import { RouterModule } from '@angular/router';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,
    ContactFormModule,
    RouterModule,
    PageLayoutModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: ContactDetailsComponent }]),
  ],
  declarations: [ContactDetailsComponent],
  exports: [ContactDetailsComponent],
})
export class ContactDetailModule {}
