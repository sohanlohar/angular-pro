import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { IPluginList } from '@pos/ezisend/profile/data-access/models';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { MyShipmentHelper } from '@pos/ezisend/shipment/data-access/helper/my-shipment-helper';
import { IDataShipment } from '@pos/ezisend/shipment/data-access/models';
import { environment } from '@pos/shared/environments';
import { Observable, Subject, catchError, finalize, of, takeUntil, tap } from 'rxjs';

@Component({
    selector: 'pos-my-store',
    templateUrl: 'my-store.component.html',
    styleUrls:['my-store.component.scss']
})

export class MyStoreComponent implements OnInit {

    SPPAPI = environment.sppUatUrl;
    @ViewChild('shipmentTable') shipmentTable: any
    constructor(
        public commonService: CommonService,
        private _snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef,
        public dialog: MatDialog,
        private router: Router,
        private http: HttpClient
    ) { }

    protected _onDestroy = new Subject<void>();
    breadcrumbItems: BreadcrumbItem[] = [
        {
            title: 'Home',
            routerLink: [''],
            external: false,
            current: false,
        },
        {
            title: 'My Store',
            external: false,
            current: true,
        },
    ];
    columns = ['channel','pluginStatus','action'];
    actions = [ 'remove_red_eye','deleteStore'];
    currentPage = 1;
    pageSize = 100;
    start_date = '';
    end_date = '';
    keyword = '';
    total = 120;
    totalStoresRecord = 0;
    currentBatchPageRequest = 0;
    myStore$: Observable<any> | undefined;

    ngOnInit() {
        this.getPluginList()
        // this.myStore$ = this.getPluginList()
    }

    private get buildParams(): any {
        return {
          start_date: this.start_date,
          end_date: this.end_date,
          keyword: this.keyword,
          page: +this.currentPage,
          limit: +this.pageSize,
        };
      }

    getPluginList(): Observable<any> {
        return this.myStore$ = this.http.get<any>(`${this.SPPAPI}store/v1/list?${MyShipmentHelper.contructFilterObject(
            this.buildParams
          )}`);
    }

    private calculateBatchProcessing(event: string, isMultiple?: boolean) {
        /* limit request per batch is 100 */
        const perRequest = this.totalStoresRecord / 200;
        this.totalStoresRecord = perRequest < 1 ? 1 : Math.ceil(perRequest);
    
        this.currentBatchPageRequest = 1;
        const query = `list?uitab=request-pickup&page=${this.currentBatchPageRequest}&limit=${this.totalStoresRecord}`;
        this.fetchBatchShipments(event, query, isMultiple)
      }

    onPageEvent(event: { currentPage: number; pageSize: number }) {
        this.currentPage = event.currentPage;
        this.pageSize = event.pageSize;
        this.getPluginList();
    }

    fetchBatchShipments(event: string, query: string, isMultiple?: any) {
        this.commonService.fetchList('shipments', query)
          .pipe(
            takeUntil(this._onDestroy)
          )
          .subscribe({
            next:(res)=> { this.commonService.isLoading(false); },
            error:(err)=>{
              this.cdr.detectChanges();
              this.commonService.isLoading(false);
              // this._commonService.openErrorDialog();
              this.commonService.openCustomErrorDialog(err);
            },
            complete:()=> {
              this.cdr.detectChanges();
              this.commonService.isLoading(false);
            }
          });
      }

    changeStatus(plugin:any) {
        let status = '';
        plugin.status === "INACTIVE" ? status = 'activate' : status = 'deactivate';
        this.commonService.submitData('store',status,{store_id:parseInt(plugin.id)})
        .pipe(
            takeUntil(this._onDestroy),
        )
        .subscribe({
            next: (data) => {
                this.cdr.detectChanges();  
                this.openSuccessDialog(
                    data.message,
                    status
                );
                this.getPluginList()
            },
            error: (err) => {
              this.cdr.detectChanges();
              this.commonService.openErrorDialog();
            }
          })
    }

    onActionIconEvent(event: { data: any; actionType: string }) {
        switch (event.actionType) {
            case 'deleteStore':
              this.onActionButtonIcon('deleteStore', parseInt(event.data.id));
              return;
            case 'remove_red_eye':
              this.onActionButtonIcon('goToMyShipment', parseInt(event.data.id));
              return;
            default:
              return;
          }
    }

    navigateToMyShipment(): void {
        this.router.navigate(['/my-shipment'], { queryParams: { t: 'all' } });
    }

    onActionButtonIcon(event: string, data: any) {

        if (event === 'goToMyShipment') {
             this.navigateToMyShipment()
            return;
          }
      

        const storeState = 'store(s)'
        /* description label action */
        const typeAction =
          event === 'deleteStore'
            ? 'Would you like to delete the store?'
            : '';
    
        /* dialog config */
        const dialogRef = this.dialog.open(DialogComponent, {
          data: {
            descriptions:
              event !== 'deleteStore'
                ? `Are you sure you want to ${typeAction} for this ${storeState}?`
                : typeAction,
            icon: 'warning',
            confirmEvent: true,
          },
        });
    
        const dialogSubmitSubscription =
          dialogRef.componentInstance.confirmEvent.subscribe((result) => {
            // if (result && event === 'gen-connote') this.onGenerateConnote(event, isMultiple);
            if (result && event === 'deleteStore') {
                this.onDelete(data);
            };
            dialogSubmitSubscription.unsubscribe();
            dialogRef.close();
          });
    }

    onDelete(event: string) {
        this.commonService.isLoading(true);
        this.commonService
          .submitData('store', 'delete', {
            store_id: event,
          })
          .pipe(
            tap((response: any) => {
              if (response.code === 'S0000') {
                  this.getPluginList();
              }
              this.commonService.isLoading(false);
            }),
            takeUntil(this._onDestroy)
          )
          .subscribe({
            next: () => {
              this.cdr.detectChanges();
              this.commonService.isLoading(false);
              // this._commonService.redirectTo('/my-shipment', { t: 'request-pickup' });
              this.shipmentTable.assignShipment()
            },
            error:() => {
              this.cdr.detectChanges();
              this.commonService.isLoading(false);
              this.commonService.openErrorDialog();
            },
            complete:()=> {
              this.cdr.detectChanges();
              this.commonService.isLoading(false);
            }
          });
      }

    openSuccessDialog(message:string,status:string) {
      let _status = status === 'activate' ? 'activated' : 'deactivated'
      let _message = status === 'activate' ? ' ' : 'You will no longer receive imported orders from this store in My Shipments page. Reactivate your store to view your imported orders.'
      let _info = status === 'activate' ? '' : 'Reactivate your store to view your imported orders.'
        const dialogRef = this.dialog.open(DialogComponent, {
            data: {
              title: `Your store is successfully ${_status}.`,
              descriptions: _status === 'activate' ? '' : _message,
              // information: _info,
              icon: 'success',
              closeEvent: true,
            },
          });

          const afterClosedSubscription = dialogRef.afterClosed().subscribe(() => { 
            // this.shipmentTable.assignShipment();
            afterClosedSubscription.unsubscribe();
          })
    }
}