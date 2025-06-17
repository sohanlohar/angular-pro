import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LauncherComponent } from './launcher.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, MatCardModule, MatButtonModule],
  declarations: [LauncherComponent],
  exports: [LauncherComponent],
})
export class LauncherCardViewModule {}
