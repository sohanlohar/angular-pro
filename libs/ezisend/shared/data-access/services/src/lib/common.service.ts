import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, delay, Observable, of, Subject, interval } from 'rxjs';
import { environment } from '@pos/shared/environments';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginFacade } from '@pos/ezisend/auth/data-access/store';
import { IPickupAddress } from '@pos/ezisend/profile/data-access/models';
import { map, share, take, takeUntil } from 'rxjs/operators';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';
import { DOCUMENT } from '@angular/common';
declare const window: any;

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private clock: Observable<any> | undefined;
  private _loading = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this._loading.asObservable();
  private ItemsPageViewSizeSubject = new BehaviorSubject<number>(100);
  pageSize$ = this.ItemsPageViewSizeSubject.asObservable();
    // Initialize the global search parameters with an empty object
  private globalSearchParamsSubject = new BehaviorSubject<any>(null);
  globalSearchParams$ = this.globalSearchParamsSubject.asObservable();
  notifier = new Subject();
  /* Default Country */
  defaultCountry = 'Malaysia';
  defaultCountryCode = 'MY';
  defaultDialingCode = '+60';
  isLocalCountryMY = this.defaultCountry?.toLowerCase() === 'malaysia';

  private getCountry: BehaviorSubject<any> = new BehaviorSubject({
    data: this.defaultCountry,
    isParcel: undefined,
  });

  //DOWNTIME CONFIG

  public time:any;
  mDate:any = '2/25/2023';
  fromDate:any = '2/25/2023, 6:00:00 AM';
  toDate:any = '2/25/2023, 9:00:00 AM';
  actualSchedule = '25 February 2023, 6am - 9am';

  // DOWNTIME CONFIG ENDS

  private getSenderAddress: BehaviorSubject<any> = new BehaviorSubject(null);
  private getRecipientData: BehaviorSubject<any> = new BehaviorSubject('');
  private isCountryMY: BehaviorSubject<any> = new BehaviorSubject(false);
  private getPickupID: BehaviorSubject<any> = new BehaviorSubject('');
  private getPickupDetails: BehaviorSubject<any> = new BehaviorSubject('');
  private getShipmentData: BehaviorSubject<any> = new BehaviorSubject(null);
  private recipientDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private parcelDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private customDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  isCOD:BehaviorSubject<boolean> = new BehaviorSubject(false);
  isCODUbat:BehaviorSubject<boolean> = new BehaviorSubject(false);
  isMelPlus:BehaviorSubject<boolean> = new BehaviorSubject(false);
  isMelPlusCOD:BehaviorSubject<boolean> = new BehaviorSubject(false);
  isMPS:BehaviorSubject<boolean> = new BehaviorSubject(false);
  isMelPlusSelected:BehaviorSubject<boolean> = new BehaviorSubject(false);
  isMPSSelected:BehaviorSubject<boolean> = new BehaviorSubject(false);
  masterAccount:BehaviorSubject<boolean> = new BehaviorSubject(false);
  $totalRequestPickUp:BehaviorSubject<any> = new BehaviorSubject(0);
  contactOptionSelected = new Subject<any>();
  recipientForm: Subject<boolean> = new Subject();
  selectedPlugin:BehaviorSubject<any> = new BehaviorSubject<any>(localStorage['selectedPlugin']);
  _selectedTab = {
    index: 0
  };
  
  getCurrentRecipientData$ = this.getRecipientData.asObservable();
  getHSC$!: Observable<any>;
  countryList$!: Observable<any>;
  getCurrentCountry$ = this.getCountry.asObservable();
  getSenderAddress$ = this.getSenderAddress.asObservable();
  getCurrentIsCountryMY$ = this.isCountryMY.asObservable();
  getSelectedPickUp$ = this.getPickupID.asObservable();
  getSelectedPickUpDetails$ = this.getPickupDetails.asObservable();
  getShipmentData$ = this.getShipmentData.asObservable();
  getRecipientDetail$ = this.recipientDetail.asObservable();
  getParcelDetail$ = this.parcelDetail.asObservable();
  getCustomDetail$ = this.customDetail.asObservable();
  getIsCod$ = this.isCOD.asObservable();
  getIsMelplus$ = this.isMelPlus.asObservable();
  getIsMelplusCod$ = this.isMelPlusCOD.asObservable();
  getIsCodUbat$ = this.isCODUbat.asObservable();

  private onTableLoad = new BehaviorSubject<boolean>(false);
  $onTableLoad = this.onTableLoad.asObservable();

  private currentSelectedPickupAddress: BehaviorSubject<IPickupAddress | null> = new BehaviorSubject<IPickupAddress | null>(null);
  getCurrentSelectedPickupAddress$ = this.currentSelectedPickupAddress.asObservable();

  /* REGEX  start*/
  numericWithDecimalOnly = /^(?!0*(\.0+)?$)(\d+|\d*\.\d{1,2})?$/;
  numericOnly = /^[0-9]\d*$/;
  alphaOnly = /^[a-zA-Z0-9]+$/;
  emailOnly = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  numericWithSpecialCharacters = /^[0-9+\-() ]*$/;
  /* REGEX  end*/

  header = {
    headers: new HttpHeaders().set(
      'Authorization',
      'Basic ZnVHdXQwZ0IycUE2aDJKeUpxVTpJakliRUQ2Z08xbTZpSFZlaWhsbWI4cTdWeVV2TDU='
    ),
  };

  /* URLs */
  flagAPI = environment.flagAPI;
  MDMAPI = environment.MDMAPI;
  SPPAPI = environment.sppUatUrl;
  invoiceApi = environment.invoiceUrl.invoiceApi;
  clientId = environment.invoiceUrl.clientId;
  clientSecret = environment.invoiceUrl.clientSecret;

  /* Language */
  public languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.dialog_box_data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.dialog_box_data :
    en.data.dialog_box_data;

  reportApi = environment.reportUrl.reportApi;
  reportAuthApi = environment.reportUrl.reportAuthApi;
  reportClientId = environment.reportUrl.clientId;
  reportClientSecret = environment.reportUrl.clientSecret;
  
  constructor(
    private http: HttpClient,
    private router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private loginFacade: LoginFacade,
    private translate: TranslationService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.clock = interval(1000).pipe(map(() => 
    {
      const getDt = new Date(new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kuala_Lumpur"
      }));
      const getLocal = getDt.toLocaleString("en-US", {
        timeZone: "Asia/Kuala_Lumpur"
      });
      return getLocal;
    }
    
    ));

    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.dialog_box_data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.dialog_box_data
      }
    })
  }
  isMobile: any = false;
 
  public checkIfMobile() {
    this.isMobile = window.innerWidth < 768; 
    return this.isMobile;
  }

  getCurrentTime() {
    return this.clock;
  }


  fetchLinkedAccountUser(endpoint: string, query: string,accessToken: any){
    const headers = new HttpHeaders({
      Authorization: accessToken,
      'Content-Type': 'application/octet-stream', 
    });
    return this.http
    .get(`${this.SPPAPI}${endpoint}/v1/${query}`, { 
      headers
    })
    .pipe(share());

  }
  resendEmail(endpoint:string, query:string, accessToken : string, userId : any) {
    const headers = new HttpHeaders({
      Authorization: accessToken
    });
    const body = {
      user_id:userId
    };
    return this.http.post<any>(
      `${this.SPPAPI}${endpoint}/v1/${query}`,
      body,
      { headers }
    );
  }
  accountPermissionUser(endpoint: string, query: string,accessToken: any, userId:any){
    const headers = new HttpHeaders({
      Authorization: accessToken,
      'Content-Type': 'application/octet-stream', 
    });
    return this.http
    .get(`${this.SPPAPI}${endpoint}/v1/${query}?user_id=${userId}`, { 
      headers
    })
  }
  accountSwitch(endpoint:string, query:string, accessToken : string, accountNumber : any) {
    const headers = new HttpHeaders({
      Authorization: accessToken
    });
    const body = {
      account_no: accountNumber,
    };
    return this.http.post<any>(
      `${this.SPPAPI}${endpoint}/v1/${query}`,
      body,
      { headers }
    );
  }
  updateDefaultAccount(endpoint:string, query:string, accessToken : string, accountNumber : any) {
    const headers = new HttpHeaders({
      Authorization: accessToken
    });
    const body = {
      account_no: accountNumber,
    };
    return this.http.post<any>(
      `${this.SPPAPI}${endpoint}/v1/${query}`,
      body,
      { headers }
    );
  }
  createAccountUser(endpoint:string, query:string, accessToken : string, accountNumber : any, userName: string, email: string) {
    const headers = new HttpHeaders({
      Authorization: accessToken
    });
    const body = {
      name:userName,
      email:email,
      account_nos: accountNumber,
    };
    return this.http.post<any>(
      `${this.SPPAPI}${endpoint}/v1/${query}`,
      body,
      { headers }
    );
  }
  updateAccountUser(endpoint:string, query:string, accessToken : string, userId : any, userName:any, accountNumber:any) {
    const headers = new HttpHeaders({
      Authorization: accessToken
    });
    const body = {
      user_id:userId,
      name:userName,
      account_nos:accountNumber,
    };
    return this.http.post<any>(
      `${this.SPPAPI}${endpoint}/v1/${query}`,
      body,
      { headers }
    );
  }
  updateAccountStatus(endpoint:string, query:string, accessToken : string,userId:any,userStatus:any ) {
    const headers = new HttpHeaders({
      Authorization: accessToken
    });
    const body = {
      user_id:userId,
      status:userStatus,
    };
    return this.http.post<any>(
      `${this.SPPAPI}${endpoint}/v1/${query}`,
      body,
      { headers }
    );
  }
 deleteUser(endpoint:string, query:string, accessToken : string,userId:any) {
    const headers = new HttpHeaders({
      Authorization: accessToken
    });
    const body = {
      user_id:userId,
    };
    return this.http.post<any>(
      `${this.SPPAPI}${endpoint}/v1/${query}`,
      body,
      { headers }
    );
  }
  activateUser(endpoint:string, query:string, accessToken : string,userEmail:any,userAccount:any ) {
    const headers = new HttpHeaders({
      Authorization: accessToken
    });
    const body = {
      email:userEmail,
      account:userAccount,
    };
    return this.http.post<any>(
      `${this.SPPAPI}${endpoint}/v1/${query}`,
      body,
      { headers }
    );
  }

  downTimeChkIn(mDate?:any, fromDt?:any, toDt?:any) {
    if(new Date(mDate).toLocaleDateString() === new Date().toLocaleDateString()) {
      this.time = this.getCurrentTime();
      this.time
      .pipe(
        take(1),
        takeUntil(this.notifier)
      )
      .subscribe((data:any) => {
        if(!((new Date(data).toLocaleString() > (new Date(fromDt).toLocaleString())) && (new Date(data).toLocaleString() < (new Date(toDt).toLocaleString())))) {
          this.router.navigate(['/auth/login']);
        } else {
          this.router.navigate(['/downtime']);
        }
      });
    }
    else {
      this.router.navigate(['/auth/login']);
    }
  }


  downTimeChkOut(mDate?:any, fromDt?:any, toDt?:any) {
    if(new Date(mDate).toLocaleDateString() === new Date().toLocaleDateString()) {
      this.time = this.getCurrentTime();
      this.time
      .pipe(
        take(1),
        takeUntil(this.notifier)
      )
      .subscribe((data:any) => {
        if(((new Date(data).toLocaleString() > (new Date(fromDt).toLocaleString())) && (new Date(data).toLocaleString() < (new Date(toDt).toLocaleString())))) {
          this.logout();
          this.router.navigate(['/downtime']);
        }
      });
    }
  }

   fetchBillingData(accessToken : string, accountNumber : string) {
    const headers = new HttpHeaders({
      Authorization: accessToken
    });
    const body = {
      accountNumber: accountNumber,
    };
    return this.http.post<any>(
      `${this.invoiceApi}`,
      body,
      { headers }
    );
  }

  tabChanged(value:any) {
    this._selectedTab = value;
  }

  downloadReceipt (accessToken: string, id: string) {
    const headers = new HttpHeaders({
      Authorization: accessToken,
      'Content-Type': 'application/octet-stream', 
    });

    return this.http.get<any>(
      `${this.invoiceApi}/${id}`,
      { 
        headers, responseType: 'blob' as 'json', observe: 'response' // Set the responseType to 'blob' to handle binary data
      }
    );
  }

  getInvoiceAccessToken() {
    const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
    });
    return this.http.post<any>(
      `https://datapos.auth.ap-southeast-1.amazoncognito.com/oauth2/token`,
      `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`,
      { headers }
    );
  }

  getReportAccessToken() {
    const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
    });
    return this.http.post<any>(
      `${this.reportAuthApi}`,
      `grant_type=client_credentials&client_id=${this.reportClientId}&client_secret=${this.reportClientSecret}`,
      { headers }
    );
  }

  fetchReportsData(accessToken : any, accountNumber : any) {
    const headers = new HttpHeaders({
      Authorization: accessToken,
    });
    return this.http.get<any>(
      `${this.reportApi}${accountNumber}/report`,
      { headers }
    );
  }

  downloadReport(accessToken: string, filename: string, accountNumber: string){
    const headers = new HttpHeaders({
      Authorization: accessToken,
      filename: filename
      // 'Content-Type': 'application/octet-stream', 
    });

    return this.http.get<any>(
      `${this.reportApi}${accountNumber}/report/download`,
      { 
        headers, responseType: 'blob' as 'json', observe: 'response' // Set the responseType to 'blob' to handle binary data
      }
    );
  }
  
  getAPI(endpoint: string, query: string, withDelay = 0) {
    /* BASE URL HAVE TO MOVE TO ENVIRONMENT */
    return this.http
      .get(`${this.MDMAPI}${endpoint}/v1/${query}`)
      // .pipe(delay(withDelay));
      .pipe(share());
  }

  getProofOfDelivery = (trackingId: any): Observable<any> => {
    return this.http.get<any>(`${this.SPPAPI}shipments/pod/v1/query/${trackingId}`).pipe(catchError((x) => of(x)));
  }

  fetchList = (endpoint: any, query: any): Observable<any> => {
    return this.http.get<any>(`${this.SPPAPI}${endpoint}/v1/${query}`).pipe(catchError((x) => of(x)));
  };

  fetchListv2 = (endpoint: any, query: any): Observable<any> => {
    return this.http.get<any>(`${this.SPPAPI}${endpoint}/v2/${query}`).pipe(catchError((x) => of(x)));
  };

  submitData = (endpoint: any, query: any, data_body: any): Observable<any> => {
    return this.http.post<any>(
      `${this.SPPAPI}${endpoint}/v1/${query}`,
      data_body
    );
  };

  submitDataV2 = (endpoint: any, query: any, data_body: any): Observable<any> => {
    return this.http.post<any>(
      `${this.SPPAPI}${endpoint}/v2/${query}`,
      data_body
    );
  };

  submitDataV3 = (endpoint: any, query: any, data_body: any): Observable<any> => {
    return this.http.post<any>(
      `${this.SPPAPI}${endpoint}/v3/${query}`,
      data_body
    );
  };

  changePwd = (
    endpoint: any,
    query: any,
    data_body: any,
    header: any
  ): Observable<any> => {
    return this.http.post<any>(
      `${this.SPPAPI}${endpoint}/v1/${query}`,
      data_body,
      header
    );
  };

  getCountryValue(val: any) {
    this.getCountry.next(val);
  }

  isLoading(val: any) {
    this._loading.next(val);
  }

  setRecipientValue(val: any) {
    this.getRecipientData.next(val);
  }

  getRecipientValue() {
    return this.getRecipientData.getValue();
  }

  getCountryIsMY(val = false) {
    this.isCountryMY.next(val);
  }

  setSelectedPickUpID(val: any) {
    this.getPickupID.next(val);
  }

  setSelectedPickUpDetails(val: any) {
    this.getPickupDetails.next(val);
  }

  getSelectedPickUpDetails() {
    return this.getPickupDetails.getValue();
  }

  setSelectedShipmentData(val: any) {
    this.getShipmentData.next(val);
  }

  setCurrentSelectedPickupAddress(val?: IPickupAddress) {
    this.currentSelectedPickupAddress.next(val??null);
  }

  setSenderAddress(val: any) {
    this.getSenderAddress.next(val);
  }

  getSelectedPickupID() {
    return this.getPickupID.getValue();
  }

  getSelectedShipmentData() {
    return this.getShipmentData.getValue();
  }

  setRecipientDetail(val: any) {
    this.recipientDetail.next(val);
  }

  setParcelDetail(val: any) {
    this.parcelDetail.next(val);
  }

  setCustomDetail(val: any) {
    this.customDetail.next(val);
  }

  formErrorHandler(form: FormGroup, field: string, val: string) {
    return form.controls[field].hasError(val);
  }

  redirectTo(uri: string, query?: any) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([uri], { queryParams: query }));
  }

  /** NOTE: below function is not used anywhere in this appliaction */
  // private get currentCountry(): string {
  //   return new Date().toString().split('(')[1].split(' ')[0];
  // }

  openErrorDialog(title?:string, desc?: string, action?:string, code?:any) {
    const dialogConfigErr = new MatDialogConfig();
    dialogConfigErr.disableClose = true;
    dialogConfigErr.autoFocus = true;
    dialogConfigErr.height = '400px'
    dialogConfigErr.maxWidth='680px';
    dialogConfigErr.data = {
      descriptions: desc ? desc : this.languageData.error_msg,
      title: title ? title : this.languageData.error_title,
      icon: 'warning',
      confirmEvent: true,
      actionText: action
    }
    const dialogRef = this.dialog.open(DialogComponent, dialogConfigErr);
    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe(() => {
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
  }

  openCustomErrorDialog(err: any) {
    const errorMessage = err?.error?.error?.data?.message
      ? err?.error?.error?.data?.message
      : err?.error?.error?.code === 'E1001'
      ? this.languageData.error_message1
      : err?.error?.error?.code === 'E1005'
      ? this.languageData.error_message2
      : err?.error?.status === 403 && err?.error?.error?.code === 'E2002'
      ? this.languageData.error_message3
      : err?.error?.status === 403 && err?.error?.error?.code === 'E1004'
      ? this.languageData.error_message4
      : err?.error?.status === 403 && err?.error?.error?.code === 'E2005'
      ? this.languageData.error_message7
      : err?.error?.status === 403 && err?.error?.error?.code === 'E2004'
      ? this.languageData.error_message6
      : this.languageData.error_message5

    if (err?.error?.status === 403 && ['E2002', 'E2004', 'E2005'].includes(err?.error?.error?.code)) {
      this.openSnackBar(this.languageData.uh_oh +'! '+ errorMessage, this.languageData.close);
    }
    else{
      const dialogRef = this.dialog.open(DialogComponent, {
          data: {
            title: 'Uh-oh',
            descriptions: errorMessage,
            icon: 'warning',
            confirmEvent: true,
            closeEvent: true,
            actionText: 'OK'
          },
        });

      const backdropClickSubscription = dialogRef.backdropClick().subscribe(() => {
        if (err?.error?.status === 403 && err?.error?.error?.code === 'E2002') { 
          this.logout();
        }
        backdropClickSubscription.unsubscribe();
      })

      const afterClosedSubscription = dialogRef.afterClosed().subscribe(() => {
        if (err?.error?.status === 403 && err?.error?.error?.code === 'E2002') { 
          this.logout();
        }
        afterClosedSubscription.unsubscribe();
      })

      const dialogSubmitSubscription = dialogRef.componentInstance.confirmEvent.subscribe(() => {
        if (err?.error?.status === 403 && err?.error?.error?.code === 'E2002') { 
          this.logout();
        }
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
      
    }
  }

  setTableLoad(event: boolean) {
    this.onTableLoad.next(event);
  }

  openSnackBar(message: string, action: string) {
    
    this._snackBar.open(message, action, {
      duration: 2000,
      panelClass: 'custom-snackbar'
    });
  }

  logout() {
    return this.http.post<any>(`${this.SPPAPI}user/v1/logout`,null);
  }
  
  errorMessageTranslate(errorResp: string) {
    const translations: any = {
      // Map error messages to their translations
      "no record to download": this.languageData.no_record_to_download,
      "duration is more than 90 days": this.languageData.duration_of_days,
      "need at least 1 connote id to add item into request pickup": this.languageData.need_at_least_one_connote,
    };
    return translations[errorResp.toLowerCase()] || errorResp;
  };

  googleEventPush(data: any) {
    window.dataLayer.push(data);
  }
 /**
 * Method Name: hideSenderAddress
 * 
 * Input Parameters:
 *   - payload ({ hide: boolean }): An object containing a boolean value that determines whether the sender's address should be hidden.
 * 
 * Output Parameters:
 *   - Observable<any>: Returns an observable that emits the result of the HTTP POST request.
 * 
 * Purpose:
 *   - To update the user's address settings on the server, specifically whether the sender's address should be hidden.
 * 
 * Author:
 *   - Ilyas Ahmed
 * 
 * Description:
 *   - This method sends a POST request to update the address setting on the server. 
 *   - The request body is created using the `hide` property from the input payload, and the request is sent with `Content-Type: application/json` in the headers.
 *   - The method handles potential errors using `catchError`, which logs the error to the console and returns the error as an observable.
 */

  hideSenderAddress(payload: { hide: boolean }): Observable<any> {
    // Create the request body with the `hide` property from the payload
    const body = { hide: payload.hide };
    return this.http.post<any>(
      `${this.SPPAPI}profile/addresssetting/v1/update`,
      body,
    ).pipe(
      catchError(error => {
        return of(error);
      })
    );
  }

  refreshToken(endpoint: string) {
    const authToken = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const headers = new HttpHeaders({
      'Access-Token':  `${authToken}`,
      'Authorization': `Bearer ${refreshToken}`
    });

    return this.http
      .get(`${this.SPPAPI}${endpoint}/v1/refreshtoken`, { headers: headers })
      .pipe(share());
    }
    
  /**
   * Method Name: copyToClipboard
   *
   * Input Parameters:
   *   - text (string): The text to copy to the clipboard.
   *
   * Output Parameters:-
   *
   * Purpose:
   *   - Copies the provided text to the user's clipboard.
   *
   * Author: Clayton
   *
   * Description:
   *   This method creates a hidden textarea element, sets its value to the
   *   provided text, selects the text, and copies it to the clipboard using
   *   the `document.execCommand('copy')` method. Finally, it removes the
   *   temporary textarea element.
   */
  copyToClipboard(text: string) {
    const textarea = this.document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    textarea.value = text;
    this.document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    this.document.body.removeChild(textarea);
  }
  resetPageSize() {
    this.ItemsPageViewSizeSubject.next(100);
    }
  // Method to update global search parameters
  updateGlobalSearchParams(params: any) {
    this.globalSearchParamsSubject.next(params);
} 
// to convert email and phone number to hash string
convertToHashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);

  return window.crypto.subtle.digest("SHA-256", data).then((hashBuffer: ArrayBuffer) => {
    // Convert the ArrayBuffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  });
}}
