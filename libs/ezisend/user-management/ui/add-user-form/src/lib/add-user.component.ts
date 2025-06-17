import { ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {ViewChild, Inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ReplaySubject, Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';

import { CommonService } from "@pos/ezisend/shared/data-access/services";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {TranslationService} from '../../../../../shared-services/translate.service';
import { bm } from '../../../../../../../libs/ezisend/assets/my';
import { en } from '../../../../../../../libs/ezisend/assets/en';
@Component({
  selector: 'pos-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit  {
  public languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.user_management :
    (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.user_management :
      en.data.user_management;

  accountsList: any[] = [];
  form: FormGroup;
  /** control for the selected bank for multi-selection */
  accountMultiList: any = new FormControl<any[]>([]);

  /** control for the MatSelect filter keyword multi-selection */
  accountFilterCtrl: any = new FormControl<string>('');

  public filterAccount:any = new ReplaySubject<any[]>(1);

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  displayedColumns: string[] = ['date', 'invoiceNumber', 'period', 'amount','action'];

  customErrorMessages = {
    required: 'Email is required.',
    pattern: 'Invalid email format.'
  };

 // Assuming accountNumber is an array of selected account numbers
selectedAccountNumber: any=[]; // To display the selected account number in input field
  username: any='';
  email: any='';
  accountNumber: any;
  @Input() mode: 'add' | 'update' | undefined;
  loggedInAccountNumber: any;
  accountAccess: any;
  isLoggedInAccount: any;
  authToken: any;
  isPresentAccountNumber: any;
  selectedValues: any=[];
  accountValue: any;

  getLabel(): string {
    return this.mode === 'add' ? 'Add User' : 'Update User';
  }

  isSubmitting: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,  private fb: FormBuilder,     public dialogRefs: MatDialogRef<AddUserComponent>,  private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry, private _snackBar: MatSnackBar,public dialogRef: MatDialogRef<DialogComponent>, public commonService: CommonService, private cdr: ChangeDetectorRef, public dialog: MatDialog,
  private translate : TranslationService,) {
    this.dialogRefs.addPanelClass('dialog-container-custom');
    this.matIconRegistry.addSvgIcon(
      `close_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/close-x.svg`)
    );
    this.matIconRegistry.addSvgIcon(
      'person_icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/person.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'remove_user_icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/delete-icon.svg')
    );

    this.form = this.fb.group({
      accountNo: ['', Validators.required],
      name: ['', Validators.required],
      email:['', [Validators.required, Validators.email, Validators.pattern("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")]],
    });

    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.user_management;
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.user_management;
      }
      this.cdr.detectChanges();
    })
  }


  ngOnInit(): void {
    this.authToken= 'Bearer ' + localStorage.getItem('authToken');
    this.email=this.data?.elementData?.email
    this.username= this.data?.elementData?.name
     // Conditionally disabling the email field
    if (this.data.getButtonLabel === 'Edit User') {
      this.form.controls['email'].disable();
    }
    this.fetchLinkedAccountUser();
    }

fetchLinkedAccountUser(){
  let id;
  if(this.data.getButtonLabel=='Add User'){
    id = 0;
  }
  else {
    id = this.data?.elementData?.id
  }
  this.commonService.accountPermissionUser('user','permission',this.authToken, id ).subscribe(
    {
    next:(res:any)=>{
      this.accountsList = res?.data?.accounts

      this.accountAccess= res?.data?.accounts.filter((account:any) => account.user_has_access);
       this.accountNumber=this.accountAccess.map((access: any) => access.account_no);
       this.isLoggedInAccount = this.accountNumber.some((account:any) => account.account_no == this.data.loggedInAccountNumber);
       this.isPresentAccountNumber = this.accountNumber.includes(this.data.loggedInAccountNumber);
       for(let i =0 ; i<this.accountNumber.length; i++){
       this.selectedValues.push(this.accountNumber[i]);

       }
    }, complete: () => {
    this.accountMultiList.setValue(this.accountsList);
    // load the initial bank list
    this.filterAccount.next(this.accountsList.slice());

    // listen for search field value changes
    this.accountFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterAccountList(); // Corrected method name.
      });
    }
  }
  )
}


onSelectionChange(event: any) {
  this.accountValue= event.value
  this.selectedValues = [];

    // Iterate through selected values and push them into selectedValues array
    for (const value of event.value) {
      this.selectedValues.push(value);
    }
  // If multiple selection is allowed, you may want to handle the logic differently
  // Here, I assume you only want to display the first selected account number
  if (event.value && event.value.length > 0) {
    this.selectedAccountNumber = event.value;
  } else {
    this.selectedAccountNumber = []; // Clear the input if no account is selected
  }

}
get nameControl() {
  return this.form.controls['name'];
}
get accountControl() {
  return this.form.controls['accountNo'];
}
get emailControl(){
  return this.form.controls['email'];
}
handleSubmit(){
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  if(this.data.getButtonLabel=='Add User'){

  this.isSubmitting = true;
  this.commonService.createAccountUser('user', 'create',this.authToken,this.selectedAccountNumber,this.username, this.email ).subscribe({
    next:(res: any) => {
      this.isSubmitting = false;
      if(res.code == "S0000"){
        this.openDialog(`${this.languageData.send_email1} `+' '+` <strong>${this.email}</strong>.<br /> ${this.languageData.send_email2}`,true, this.languageData.ok_got_it,'checkmark')
      }
    },error: (error) => {
      this.isSubmitting = false;
      if(error.error.code == 'E1003'){
        this._snackBar.open(`${this.languageData.email_msg1} `+' '+` ${this.email} `+' '+`${this.languageData.email_msg2}`,'ok');
      }
      if(error.status == 500){
        this._snackBar.open(`${this.languageData.user_creation_failed}`,'ok');
      }
      },
    complete : () => {
      this.dialogRef.close();
      this.data.fetchLinkedAccountUser();
      this.fetchLinkedAccountUser();
    },
  })
}

if(this.data.getButtonLabel=='Edit User'){
  this.isSubmitting = true;
  this.commonService.updateAccountUser('user','permission/update', this.authToken,this.data?.elementData?.id,this.username, this.accountNumber ).subscribe({next:(res:any)=>{

    this.isSubmitting = false;
    if(res.code=="S0000"){
      this._snackBar.open(this.languageData.error_msg2,'ok');
    }

    },
    error: (error) => {
      this.isSubmitting = false;
      if(error?.error?.code === 'E1003'){
        this._snackBar.open(this.languageData.error_msg3, 'ok');
      }
      else{
        this._snackBar.open(this.languageData.error_msg4, 'ok');
      }
    },
    complete : () => {
      this.isSubmitting = false;
      this.dialogRef.close()
      this.commonService.fetchLinkedAccountUser('user', 'list',this.authToken).subscribe({
      })
      window.location.reload()
    }})
}

this.cdr.detectChanges();

}


  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  openDialog(descriptions:any,  confirmEvent:any, actionText:any, icon:any): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        icon:icon,
        descriptions: descriptions,
        confirmEvent: confirmEvent,
        actionText: actionText,
        actionUrl:'user',
      },
    });
    const dialogSubmitSubscription =
    dialogRef.componentInstance.confirmEvent.subscribe((result:any) => {
      dialogSubmitSubscription.unsubscribe();
      dialogRef.close();
    });
    dialogRef.afterClosed().subscribe((result:any) => {
      window.location.reload();
    });
  }




  protected filterAccountList() {
    if (!this.accountsList) {
        return;
    }
    // get the search keyword from the form control
    let search = this.accountFilterCtrl.value;
    if (!search || typeof search !== 'string') {
        this.filterAccount.next(this.accountsList.slice());
        return;
    } else {
        search = search.toLowerCase();
    }
    this.filterAccount.next(
        this.accountsList.filter(account => account.account_no.includes(search))
    );
}

  removeUser(){
    const removeUser = {removed: true}
    this.dialogRef.close(removeUser);
  }

}