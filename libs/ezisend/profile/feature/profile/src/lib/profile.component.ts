import { Component, OnDestroy, OnInit } from '@angular/core';
import { IProfile } from '@pos/ezisend/profile/data-access/models';
import { IResponse } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { catchError, EMPTY, finalize, Observable, Subject, takeUntil, tap } from 'rxjs';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  data!: any;
  protected _onDestroy = new Subject<void>();
  
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.profile :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.profile :
    en.data.profile;

  constructor(
    private commonService: CommonService,
    private translate: TranslationService
  ) {
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.profile;
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.profile
      }
    })
  }

  ngOnInit(): void {
    this.fetchFormData();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  fetchFormData() {
    this.commonService
      .fetchList('profile', 'query')
      .pipe(
        takeUntil(this._onDestroy),
        tap((res: IResponse<any>) => {
          const { company_name: nick_name, ...data } = res.data;
          this.data = {
            nick_name,
            ...data,
          };
        }),
        catchError(() => {
          this.commonService.openErrorDialog();
          return EMPTY;
        }),
        finalize(() => this.commonService.isLoading(false))
      )
      .subscribe();
  }
}
