import { Injectable } from '@angular/core';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BreakpointService {
  isSmallScreen: Observable<boolean>;
  private toggleState = new BehaviorSubject(true);
  public toggleState$ = this.toggleState.asObservable();
  private toggleVal = true;

  constructor(breakpointObserver: BreakpointObserver) {
    this.isSmallScreen = breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
      .pipe(map((result) => !result.matches));
    this.triggerToggle();
  }

  emitData(val?:string) {
    this.toggleVal = !this.toggleVal;
    this.triggerToggle();
    if(val === 'expand') {
      this.toggleVal = true;
    }
    this.toggleState.next(this.toggleVal);
 }

 triggerToggle() {
  this.isSmallScreen.subscribe(data => {
    this.toggleState.next(data === true ? true : false);
  });
 }
}
