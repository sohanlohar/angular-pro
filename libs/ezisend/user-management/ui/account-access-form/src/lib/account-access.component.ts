import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginActions } from '@pos/ezisend/auth/data-access/store';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import {TranslationService} from '../../../../../shared-services/translate.service';
import { bm } from '../../../../../../../libs/ezisend/assets/my';
import { en } from '../../../../../../../libs/ezisend/assets/en';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'pos-account-access',
  templateUrl: './account-access.component.html',
  styleUrls: ['./account-access.component.scss'],
})
export class AccountAccessComponent implements OnInit {

  public languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.menu :
    (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.menu :
      en.data.menu;

  selectedLanguage :any;

  showViewAccountButton: any;
  isMasterAccount: any;
  authToken: any;

  isViewSubmitted: any = {index:0, status: false};
  isSetDefaultSubmitted: any = {index:0, status: false};

  loggedInAccountNumber = localStorage.getItem('loggedInAccountNumber');

  constructor(public dialogRefs: MatDialogRef<AccountAccessComponent>,private translate : TranslationService,@Inject(MAT_DIALOG_DATA) public data: any,private domSanitizer: DomSanitizer,private matIconRegistry: MatIconRegistry, private cdr: ChangeDetectorRef,private _snackBar: MatSnackBar,public router: Router, public commonService: CommonService,public dialogRef: MatDialogRef<any>) {
    this.dialogRef.addPanelClass('dialog-container-custom');
    this.matIconRegistry.addSvgIcon(
      `close_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/close-x.svg`)
    );
    this.matIconRegistry.addSvgIcon(
      `person_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/person.svg`)
    );

    this.selectedLanguage = localStorage.getItem("language") ?? 'en';

    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.menu;
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.menu;
      }
      this.selectedLanguage = localStorage.getItem("language") ?? 'en';
    })
  }

  displayedColumns: string[] = ['logo', 'name','account_no','type','permissions'];
  ngOnInit(): void {
    this.showViewAccountButton = this.data.showViewAccountButton || false;
      this.isMasterAccount= localStorage.getItem("isMasterAccount");
    this.displayedColumns = this.showViewAccountButton && this.isMasterAccount ?
    ['logo', 'name', 'account_no', 'type', 'permissions'] :
    ['logo', 'name', 'account_no', 'type'];
  }
  handleViewAccount(account:any){
    const authToken:any= 'Bearer ' + localStorage.getItem('authToken');
    this.isViewSubmitted.status = true;
  this.commonService.accountSwitch('account', 'switch',authToken, account.account_no).subscribe({
    next:(res: any)=>{
      this.isViewSubmitted.status = false;
      if (res.data?.token) {
        localStorage.setItem('authToken', res.data.token);
        LoginActions.loginSuccess({ login: res, redirect: true });
        if(this.router.url == '/'){
          window.location.reload();
        }
        else{
          this.dialogRefs.close();
          window.location.replace('/');
        }
        this.cdr.detectChanges();
      }
    },error:(err)=> {
      this.isViewSubmitted.status = false;
      if(err?.error?.code){
        this._snackBar.open(err.error.message,this.languageData.ok);
      }else{
        this._snackBar.open(this.languageData.switch_account_failed,this.languageData.ok);
      }
    },
  })
  }

  ispermissionDisabled(account:any){
    let loggedInAccountNumber = (account?.account_no == this.loggedInAccountNumber)
    return account?.is_account_blocked || loggedInAccountNumber
  }
  closeDialog(): void {
    this.dialogRef.close();
  }

  handleDefaultAccount(account: any) {
    
    this.isSetDefaultSubmitted.status = true;
    this.authToken = 'Bearer ' + localStorage.getItem('authToken');
    this.commonService.updateDefaultAccount('user', 'default/account', this.authToken, account?.account_no).subscribe({
      complete: () => {
        // console.log('Update default account request completed');
        this.commonService.fetchLinkedAccountUser('account', 'list',this.authToken).subscribe({
          next:(res: any)=>{
            this.isSetDefaultSubmitted.status = false;
            this.data = res?.data
            this.cdr.detectChanges();
          }, complete : () => {
            this.isSetDefaultSubmitted.status = false;
            this.cdr.detectChanges();
          }
        })
      }
    });
    this.cdr.detectChanges();
  }
}
