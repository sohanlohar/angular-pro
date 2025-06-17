import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Launcher } from '@pos/web/launch-pad/data-access';

@Component({
  selector: 'pos-launcher',
  templateUrl: './launcher.component.html',
  styleUrls: ['./launcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LauncherComponent {
  @Input() launcher: Launcher | undefined;
}
