import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactCreateComponent } from './contact-create.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactFormModule } from '@pos/ezisend/contact/ui/contact-form';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { MatDialogModule } from '@angular/material/dialog';
import { GeneralFormModule } from '@pos/ezisend/shared/ui/forms/general-form';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    ContactFormModule,
    PageLayoutModule,
    GeneralFormModule,
    RouterModule.forChild([{ path: '', component: ContactCreateComponent }]),
  ],
  declarations: [ContactCreateComponent],
  exports: [ContactCreateComponent],
})
export class ContactCreateModule {}
