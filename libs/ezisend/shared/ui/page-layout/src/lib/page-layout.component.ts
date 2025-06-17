import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';
import { en } from 'libs/ezisend/assets/en';
import { bm } from 'libs/ezisend/assets/my';
import { TranslationService } from 'libs/ezisend/shared-services/translate.service';

@Component({
  selector: 'pos-page-layout',
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLayoutComponent implements OnInit{

  data: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data :
    (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data :
      en.data;

  @Input() pageTitle = 'Welcome back, Wai';
  @Input() pageCopy = 'What can we do for you today?';
  @Input() breadcrumbItems: BreadcrumbItem[] = [
    {
      title: this.data?.home,
      external: false,
      current: true,
    },
    // {
    //   title: 'Send',
    //   routerLink: [''],
    //   external: false,
    //   current: false,
    // },
    // {
    //   title: 'SendParcel PRO',
    //   routerLink: [''],
    //   external: false,
    //   current: false,
    // },
    // {
    //   title: 'Dashboard',
    //   routerLink: [''],
    //   external: false,
    //   current: true,
    // },
  ];
  @Input() backData?: any

  constructor(private translate: TranslationService){}

  ngOnInit(): void {
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.data = en.data;
      }
      else if (localStorage.getItem("language") == "my") {
        this.data = bm.data;
      }
    })
  }
}
