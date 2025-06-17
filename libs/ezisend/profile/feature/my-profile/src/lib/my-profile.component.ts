import { Component, ChangeDetectionStrategy, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import { LoginService } from "@pos/ezisend/auth/data-access/services";
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
selector: 'pos-my-profile',
templateUrl: './my-profile.component.html',
styleUrls: ['./my-profile.component.scss'],
changeDetection: ChangeDetectionStrategy.Default
})
export class MyProfileComponent implements OnInit{
@ViewChild('stepper') stepper!: MatStepper;
languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.profile :
(localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.profile :
en.data.profile;
selectedIndex = 0;
panelOpenState = false;
hideSenderAddress = false;
breadcrumbItems: BreadcrumbItem[] = [];
onSubmitButton: boolean = false; 

constructor(public activatedRoute: ActivatedRoute, public commonService: CommonService,
private translate: TranslationService, private snackBar: MatSnackBar,private loginService: LoginService,
private cdr: ChangeDetectorRef) {
this.assignLangLabel();

this.translate.buttonClick$.subscribe(() => {
  if (localStorage.getItem("language") == "en") {
    this.languageData = en.data.profile
  } else if (localStorage.getItem("language") == "my") {
    this.languageData = bm.data.profile
  }
  this.assignLangLabel();
})
}

ngOnInit(): void {
  this.tabSelection();
  this.fetchConfig();
  // Trigger Google Event for the default active tab
  const defaultTabDetails = {
    index: this.selectedIndex,
    textLabel: this.selectedIndex === 0 ? this.languageData.my_profile : `${this.languageData.pickup} ${this.languageData.address}`,
  };
  this.onTabChange({ index: defaultTabDetails.index, tab: { textLabel: defaultTabDetails.textLabel } } as MatTabChangeEvent);

}
showSuccess(message: string): void {
  this.snackBar.open(message, 'Close', {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
    panelClass: ['snack-bar-success']
  });
}

showError(message: string): void {
  this.snackBar.open(message, 'Close', {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
    panelClass: ['snack-bar-error']
  });
}
assignLangLabel() {
  this.breadcrumbItems = [{
      title: this.languageData.home,
      routerLink: [''],
      external: false,
      current: false,
    },
    {
      title: this.languageData.my_profile,
      external: false,
      current: true,
    },
  ];
}

tabSelection() {

  this.activatedRoute.queryParams.subscribe((data) => {
    if (data['tab']) {
      this.selectedIndex = data['tab'] === '1' ? 1 : 0;
    }
  })
}
/**
 * Toggles the visibility of the sender's address.
 *
 * This method inverts the current state of the `hideSenderAddress` property.
 * If the address is currently visible, it will be hidden, and vice versa.
 */
hideSenderAddressVisibility(): void {
  this.hideSenderAddress = !this.hideSenderAddress;
}
/**
* Method Name: hideAddress
*
* Input Parameters:
* - None (This method does not take any input parameters directly, but uses the `hideSenderAddress` property from the
class instance).
*
* Output Parameters:
* - void: This method does not return any value.
*
* Purpose:
* - To update the user's address preference by hiding or showing the sender's address based on the user's choice.
*
* Author:
* - Ilyas Ahmed
*
* Description:
* - This method calls the `hideSenderAddress` method from the `commonService`, passing an object with the user's
preference (`hideSenderAddress` property).
* - It subscribes to the observable returned by the service, handling the success, error, and completion states:
* - On success: Displays a success message to the user indicating that the address preference has been updated.
* - On error: Displays an error message with details if the update fails.
* - On completion: Logs a message indicating the process is complete.
*/

hideAddress(): void {
  this.onSubmitButton = true;
  this.commonService.hideSenderAddress({
    hide: this.hideSenderAddress
  }).pipe(take(1)).subscribe({
    next: () => {
      this.onSubmitButton = false;
      this.cdr.detectChanges();
      this.showSuccess(this.languageData.address_update_toaster)
    },
    error: (error) => {
      this.onSubmitButton = false;
      this.cdr.detectChanges();
      this.showError(this.languageData.address_update_toaster_error(error.message))
    },
  });
}
fetchConfig() {
  // Fetching configuration from the login service
  this.loginService.config().pipe(take(1)).subscribe({
    next: (response: any) => {
      // Update the hideSenderAddress property based on the response
      this.hideSenderAddress = response.data.account_config.hide_sender_address;
    },
    error: (error: {
      message: any;
    }) => {
      // Show an error message if the configuration fetch fails
      this.showError(this.languageData.fetch_config_error(error.message));

    }
  });
}

// onScrollTopClick() {
//   window.scrollTo({ top: 0, behavior: 'smooth' });
// }
onTabChange(event: MatTabChangeEvent): void {
  const tabIndex = event.index;
  const tabLabel = tabIndex === 0 ? 'My Profile' : 'Pick Up Address';

  // Log Google event with tab details
  const eventDetails = {
    event: 'tab_to_section',
    event_category: 'SendParcel Pro - My Profile',
    event_action: `Tab To Section`,
    event_label: tabLabel,
  };
  this.commonService.googleEventPush(eventDetails)
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

}
