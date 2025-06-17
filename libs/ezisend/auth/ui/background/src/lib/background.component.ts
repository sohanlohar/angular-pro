import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'pos-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundComponent {
  @Input()
  logoUrl = '/assets/pos-malaysia-logo.png';
}
