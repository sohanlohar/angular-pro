import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pos-downtime-feature',
  templateUrl: './downtime-feature.component.html',
  styleUrls: ['./downtime-feature.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DowntimeFeatureComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    // this.router.navigate(['/auth/login']);
  }
}
