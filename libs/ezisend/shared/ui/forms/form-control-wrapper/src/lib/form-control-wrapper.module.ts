import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlWrapperComponent } from './form-control-wrapper.component';
import { ErrorMessageBuilderPipe } from './error-message-build.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [CommonModule, MatFormFieldModule, ],
  declarations: [
    FormControlWrapperComponent,
    ErrorMessageBuilderPipe,
  ],
  exports: [FormControlWrapperComponent]
})
export class FormControlWrapperModule {}
