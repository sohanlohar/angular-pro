import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { LoginFacade } from '@pos/ezisend/auth/data-access/store';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { BreakpointService } from '@pos/ezisend/shell/data-access/models';
import { environment } from '@pos/shared/environments';

@Component({
  selector: 'pos-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  sidebarActive = false;
  widthScreen = window.innerWidth;
  showTopButton = false;
  showBottomButton = true;
  version: string = environment.version;

  @ViewChild('navSidebar') navSidebarELement!: ElementRef;
  @HostListener('window:resize', []) updateMode() {
    this.listenWidthScreen();
  }

  constructor(
    public breakpointService: BreakpointService,
    public commonService: CommonService,
    private authStore: LoginFacade
  ) {
    this.authStore.init();
    this.listenWidthScreen();
    this.sidebarActive = this.getLocalStorage() === 'true';
  }

  navItemClick(menu: string) {
    if (this.widthScreen <= 768) this.sidebarActive = false;
    this.trackingMenu(menu);
  }
  trackingMenu(menu: string) {
    const trackingMenuEvent = {
      event: 'side_menu',
      event_category: 'SendParcel Pro - Menu',
      event_action: 'Click Side Menu',
      event_label: menu,
    };
    this.commonService.googleEventPush(trackingMenuEvent);
  }

  private listenWidthScreen() {
    this.widthScreen = window.innerWidth;
    if (this.widthScreen < 768) {
      this.sidebarActive = false;
      this.setLocalStorage();
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    this.showTopButton = window.scrollY > 0;
    this.showBottomButton = !(
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 5
    );
  }

  onScrollTopClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onScrollBottomClick() {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  }

  expandMenu() {
    this.sidebarActive = !this.sidebarActive;
    this.setLocalStorage();
  }

  collapseSidebar(event: boolean) {
    if (event && !this.sidebarActive) {
      this.sidebarActive = true;
      this.setLocalStorage();
    }
  }

  private setLocalStorage() {
    localStorage.setItem('sidebarActive', this.sidebarActive.toString());
  }

  private getLocalStorage() {
    return localStorage.getItem('sidebarActive');
  }
}
