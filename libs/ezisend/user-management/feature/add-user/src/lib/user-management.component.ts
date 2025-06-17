import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginService } from '@pos/ezisend/auth/data-access/services';
import { BreadcrumbItem, IResponse } from "@pos/ezisend/shared/data-access/models";
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { AccountAccessComponent } from '@pos/ezisend/user-management/ui/account-access-form';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AddUserComponent } from 'libs/ezisend/user-management/ui/add-user-form/src/lib/add-user.component';
import {TranslationService} from '../../../../../shared-services/translate.service';
import { bm } from '../../../../../../../libs/ezisend/assets/my';
import { en } from '../../../../../../../libs/ezisend/assets/en';

@Component({
  selector: 'pos-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  public languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.user_management :
    (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.user_management :
      en.data.user_management;

  isMasterAccount: any;
  cardList: any;
  name: any;
  animal: any;
  userData$: any;
  authToken: any;
  constructor(
    private _snackBar: MatSnackBar,
    public loginService: LoginService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    public commonService: CommonService,
    private translate : TranslationService,
  ) {

    this.assignLangLabels();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.user_management;
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.user_management;
      }
      this.assignLangLabels();
    })
  }

  dataSource:any;
  isEditMode: boolean = false;
  clickedRows = new Set<any>();
  loggedInAccountNumber:any;
  @Output() eventAddEditPickup = new EventEmitter<{isNew: boolean, item: any}>();
  displayedColumns: string[] = ['userName', 'accountAccess','emailAddress', 'status','action'];
  breadcrumbItems: BreadcrumbItem[] = [];
  isActive: any = localStorage.getItem('isActive') === 'true';
  // Initialize statusAccount based on the value stored in localStorage or default to 'ACTIVE'
  statusAccount: any = localStorage.getItem('statusAccount') || 'ACTIVE';
  fetchAccountNo:any;
  loading = true;
  addEditPickupAddress(isNew = false, item?: any) {
    if (isNew) {
      this.eventAddEditPickup.emit();
    } else if (!isNew && item) {
      this.eventAddEditPickup.emit({isNew, item});
    }
  }
  ngOnInit(): void {
    this.fetchLinkedAccountUser();
   this.loginServiceApi();
    this.loggedInAccountNumber=localStorage.getItem('loggedInAccountNumber');
    this.cdr.detectChanges();
  }

  assignLangLabels(){
    this.breadcrumbItems = [
      {
        title: this.languageData.home, // 'Home',
        routerLink: [''],
        external: false,
        current: false,
      },
      {
        title: this.languageData.my_profile, // 'My Profile',
        routerLink: ['/profile'],
        external: false,
        current: false,
      },
      {
        title: this.languageData.user_management, // 'User Management',
        routerLink: ['/user'],
        external: false,
        current: true,
      },
    ];
  }

  fetchLinkedAccountUser() {
    this.authToken = 'Bearer ' + localStorage.getItem('authToken');

    this.commonService.fetchLinkedAccountUser('user', 'list', this.authToken).subscribe({
      next: (res: any) => {

        // Remove only master accounts from account_accesses
        const filteredUsers = (res?.data?.users || []).map((user: any) => {
          return {
            ...user,
            account_accesses: user.account_accesses?.filter((acc: any) => acc.is_master !== true)
          };
        }).filter((user: { account_accesses: string | any[]; }) => user.account_accesses?.length > 0);

        this.dataSource = filteredUsers;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loginServiceApi(){
    this.loginService.config().subscribe({
      next : (response:IResponse<any>) => {
        this.isMasterAccount =  response?.data?.account_config?.is_master;
        this.cdr.detectChanges();
      }
    })
  }
  toggleChanged(event: MatSlideToggleChange, element:any) {
    if (event.checked) {
      this.isActive=!this.isActive;
      this.statusAccount='ACTIVE'
    } else {
      this.isActive=false;
      this.statusAccount='INACTIVE'
    }

    localStorage.setItem('isActive', this.isActive);
    this.commonService.updateAccountStatus('user', 'update-status',this.authToken, parseInt(element.id),this.statusAccount).subscribe({
      complete : () => {
        this.fetchLinkedAccountUser();
    }
  })
  }

  deleteUser(element:any){
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        descriptions: this.languageData.are_you_confirmed_to_remove_this_user,
        information: this.languageData.are_you_confirmed_to_remove_this_user_note,
        confirmEvent: true,
        icon:'warning',
        deleteUserText: true,
      },
    });

    const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe((result:any) => {
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
        this.commonService.deleteUser('user', 'delete',this.authToken, element.id).subscribe({
          next: (res:any) => {
            this.loading = true
            this._snackBar.open(this.languageData.user_has_been_deleted_successfully, this.languageData.ok);
            this.fetchLinkedAccountUser();
          }
      })
    });
  }

  editUser(element:any) {
    this.isEditMode = true;
    const dialogRef = this.dialog.open(AddUserComponent, {
      minWidth: '50%',
      height:'381.53px',
      data:{
          getButtonLabel:this.getButtonLabel(),
          fetchLinkedAccountUser:this.fetchLinkedAccountUser(),
          elementData:element,
          loggedInAccountNumber:this.loggedInAccountNumber,
          isMasterAccount: this.isMasterAccount
      }
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      if(result?.removed){
        this.deleteUser(element);
      }
    })
  }

  resendEmail(element:any){
this.commonService.resendEmail('user', 'resend/email/activation',this.authToken, element.id).subscribe({
  next: (res:any) => {
  if(res.code == 'S0000'){
    this._snackBar.open(this.languageData.email_has_been_sent_successfully,'ok');
  }
},error: (error) => {
if(error){
  this._snackBar.open(this.languageData.resend_email_has_been_failed,'ok');
}
}
})
  }
  getButtonLabel(): string {
    return this.isEditMode ? 'Edit User' : 'Add User';
  }
  openDialog(): void {
    this.isEditMode = false;
    const dialogRef = this.dialog.open(AddUserComponent, {
        minWidth: '50%',
        height:'381.53px',
        data:{getButtonLabel:this.getButtonLabel()} // adjust the width as per your requirement
    });
}
  handleAccountAccess(element:any){
    const dialogRef = this.dialog.open(AccountAccessComponent, {
      minWidth: '50%',
      data: { accounts: element.account_accesses, name: element.name }
  });
  }
  }
