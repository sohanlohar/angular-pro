import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContactsComponent } from './contacts.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ContactsComponent }]),
  ],
  declarations: [ContactsComponent],
})
export class ContactsModule {}
