import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

import { NavSidebarComponent } from './nav-sidebar.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';

import {MatMenuModule} from '@angular/material/menu';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatMenuModule,
    MatSidenavModule
  ],

  declarations: [NavSidebarComponent],
  exports: [NavSidebarComponent],
})
export class NavSidebarModule {}
