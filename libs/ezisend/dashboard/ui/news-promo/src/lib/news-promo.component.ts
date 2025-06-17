import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NewsPromo } from '@pos/ezisend/dashboard/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { en } from 'libs/ezisend/assets/en';
import { bm } from 'libs/ezisend/assets/my';
import { TranslationService } from 'libs/ezisend/shared-services/translate.service';

@Component({
  selector: 'pos-news-promo',
  templateUrl: './news-promo.component.html',
  styleUrls: ['./news-promo.component.scss'],
})
export class NewsPromoComponent implements OnDestroy, OnInit {

  data: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
    (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
      en.data;
  
  isLoading = false;
  @Input()
  newspromoList: any[] = [];
  protected _onDestroy = new Subject<void>();

  private subscription: Subscription | undefined;

  constructor(
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private translate: TranslationService
  ) {
  }

ngOnInit(): void {
  this.fetchPromo();
  this.translate.buttonClick$.subscribe(() => {
    if (localStorage.getItem("language") == "en") {
      this.data = en.data;
    }
    else if (localStorage.getItem("language") == "my") {
      this.data = bm.data;
    }
  })
}

  fetchPromo() {
    this.isLoading = true;
    this.subscription = this.commonService.fetchList('dashboard', 'promo')
    .pipe(
      takeUntil(this._onDestroy)
    )
    .subscribe({
      next:(data) => {
        this.newspromoList = data.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err)=> {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.commonService.openErrorDialog('Uh-oh', err?.error?.error?.message);
      }
    });
  }

  actionUrl(newspromo: any, index: number) {
    if (newspromo?.target) {
      // Trigger the event with the promo and index
      this.newsPromotionEvent(newspromo, index);
  
      // Open the URL in a new tab
      window.open(newspromo.target, "_blank");
    }
  }
  
  newsPromotionEvent(newspromo: any, index: number) {
    const eventDetails = {
      event: 'select_promotion',
      event_category: 'SendParcel Pro - Dashboard',
      event_action: 'Select Promotion',
      event_label: 'promotion_banner',
      promotion_id: `promotion_banner_${(index + 1).toString().padStart(2, '0')}`,
      promotion_name: this.data?.dashboard?.news_promo || newspromo?.target || 'Unknown Promotion',
    };
    // Push event using the common service
    this.commonService.googleEventPush(eventDetails);
  }
  /** WE REQUIRED SOME OPTIMIZATION IN UNSUBSCRIBE */
  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
