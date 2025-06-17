import {
  Component,
  ChangeDetectionStrategy,
  Input,
  HostBinding,
} from '@angular/core';
import { DashboardTileAction } from '@pos/ezisend/dashboard/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';

@Component({
  selector: 'pos-action-tile',
  templateUrl: './action-tile.component.html',
  styleUrls: ['./action-tile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionTileComponent {
  @Input() action: DashboardTileAction | undefined;
  @HostBinding('class.size-m') get className() {
    return this.action?.size === 'm';
  }
  @HostBinding('class.size-l') get classNameL() {
    return this.action?.size === 'l';
  }

  constructor(private commonService: CommonService){}

  onActionButton(action: any){
    if(action?.title === "Create New Contact"){
      this.commonService.googleEventPush({
        "event": "create_new_contact",
        "event_category": "SendParcel Pro - Contact",
        "event_action": "Create New Contact",
        "event_label": "New Contact"
      });
    }
  }
}
