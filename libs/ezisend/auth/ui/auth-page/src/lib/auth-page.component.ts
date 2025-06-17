import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'pos-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPageComponent implements OnInit, OnDestroy {
  @Input() title = `Welcome to SendParcel`;
  @Input() pro = `PRO`;
  @Input() footerLink = true;
  @Input() description =
    'Log in to your account now to start managing your shipments';

  @Input() buttonList = [
    {
      buttonName: 'Back',
      isPrimary: false,
      buttonIcon: 'keyboard_backspace',
      routerLink: ['/'],
    },
    {
      buttonName: 'Login',
      isPrimary: true,
      routerLink: [],
    },
  ];

  bannerObj:any;

  protected _onDestroy = new Subject<void>();

  constructor(
    public commonService: CommonService,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.getBanner();
  }

  getBanner() {
    this.commonService.fetchList('promo', 'login/banner')
    .pipe(
      takeUntil(this._onDestroy)
    )
    .subscribe(res=>{
      if(res?.data){
        this.bannerObj = {
          src: res?.data?.src,
          target: res?.data?.target,
          height:'200'
        }
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
