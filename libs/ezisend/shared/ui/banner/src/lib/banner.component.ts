import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '@pos/ezisend/shared/data-access/services';


@Component({
  selector: 'pos-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class BannerComponent {

  @Input("bannerObj") bannerObj:any;

  onBannerClick(){
    window.open(this.bannerObj?.target, "_blank");
  }

}
