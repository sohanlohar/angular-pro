import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Launcher } from '@pos/web/launch-pad/data-access';

@Component({
  selector: 'pos-launch-pad',
  templateUrl: './launch-pad.component.html',
  styleUrls: ['./launch-pad.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LaunchPadComponent {
  launchers: Launcher[] = [
    {
      id: 1,
      name: 'YTL Broadband',
      category: 'Telco',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis',
      image_url:
        'https://images.unsplash.com/photo-1548668486-b554d9d443d4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3132&q=80',
    },
    {
      id: 2,
      name: 'Air Selangor',
      category: 'Utility',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis',
      image_url:
        'https://images.unsplash.com/photo-1532157277712-8771574c33b5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3024&q=80',
    },
  ];
}
