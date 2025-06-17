import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import {  interval } from 'rxjs';

@Component({
  selector: 'pos-downtime-background',
  templateUrl: './downtime-background.component.html',
  styleUrls: ['./downtime-background.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DowntimeBackgroundComponent implements OnInit {
  errorCode = 'Scheduled Maintenance';
  errorTitle = this.commonService.actualSchedule;
  errorDescription = 'We apologize for the inconvenience caused. We\'ll be online shortly.';

  constructor(
    public commonService: CommonService,
    private router: Router, private route: ActivatedRoute) {
      this.extractRouteData();
    }

  private extractRouteData() {
    this.route.data.subscribe((data: Data) => {
      if (
        Object.keys(data).length !== 0 &&
        data['errorCode'] &&
        data['errorTitle'] &&
        data['errorDescription']
      ) {
        for (const key in data) {
          this[key as keyof DowntimeBackgroundComponent] = data[key];
        }
      }
    });
  }

  ngOnInit(): void {
    this.commonService.downTimeChkIn(this.commonService.mDate, this.commonService.fromDate, this.commonService.toDate);
  }

}
