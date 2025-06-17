import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { Subject, catchError, finalize, takeUntil, tap } from 'rxjs';

@Component({
    selector: 'selector-name',
    templateUrl: 'add-store.component.html',
    styleUrls:['add-store.component.scss']
})

export class AddStore implements OnInit {

  protected _onDestroy = new Subject<void>();
  @Output() dataEmitter: EventEmitter<any> = new EventEmitter<any>();
  selectedPlugin = this.commonService.selectedPlugin.getValue();
  isSubmitting = false;
  isSelected = false;
  pluginList = [
    {
      name: 'woocommerce',
      isSelected: false
    },
    {
      name: 'shopify',
      isSelected: false
    }
  ]


  pluginForm = this.fb.group({
    store_name: ['', Validators.required],
    store_url: ['', Validators.required]
  })


    constructor(
      private fb: UntypedFormBuilder, 
      public commonService: CommonService,
      public dialog: MatDialog,
      private route: ActivatedRoute,
      private router: Router
      ) { }

    ngOnInit() { }

    breadcrumbItems: BreadcrumbItem[] = [
        {
          title: 'Home',
          routerLink: [''],
          external: false,
          current: false,
        },
        {
          title: 'Add Store',
          external: false,
          current: true,
        },
      ];
    
    isSubmitDisabled(formValidity: boolean) {
      let invalid = !formValidity || this.isSubmitting;
      return invalid;
    }

    submit_plugin() {
      const storeName = this.pluginForm.controls['store_name'].getRawValue();
      const storeUrl = this.pluginForm.controls['store_url'].getRawValue();
      this.isSubmitting = true;
      this.commonService.submitData('store','create',{platform:this.selectedPlugin, name: storeName, url: storeUrl})
      .pipe(
        takeUntil(this._onDestroy),
        tap((response: any) => {
          this.commonService.isLoading(false);
          if(response.code === 'S0000'){
            this.goMyStores();
          }
        }),
        catchError((err)=> {
          if(err.error.error.code === 'E1003'){
            this.ErrorDialog('Oops, Store URL is invalid or already exist.');
          } else {
            this.ErrorDialog('Integration failed. Account has not been authorised');
          }
          return err;
        }),
        finalize(()=>{
          this.commonService.isLoading(false);
          this.isSubmitting = false;
        })
      )
      .subscribe();
    }

    selectPlugin(index:number) {
      this.selectedPlugin = this.commonService.selectedPlugin.getValue()
      // this.isSelected = true;
      this.pluginList.forEach((plugin, i) => {
        if (i === index) {
          plugin.isSelected = true;
        } else {
          plugin.isSelected = false;
        }
      })
    }
    
    viewSteps() {
      this.router.navigate(['/integration/add-store/instruction']);
    }

    private goMyStores() {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          descriptions: `Integration was successful!`,
          icon: 'success',
          confirmEvent: true,
          closeEvent: true,
          actionText: 'Ok, got it'
        },
      });

      const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe(() => {
        this.router.navigate(['../my-store'], {
          relativeTo: this.route,
          // queryParams:  { t: 'pending-pickup' },
        });
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
    }

    private ErrorDialog(err: string) {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          descriptions: err,
          icon: 'warning',
          CloseEvent: true,
          confirmEvent: true,
          actionText: 'Okay'
        }
      });

      const dialogSubmitSubscription =
      dialogRef.componentInstance.confirmEvent.subscribe(() => {
        dialogSubmitSubscription.unsubscribe();
        dialogRef.close();
      });
    }
}