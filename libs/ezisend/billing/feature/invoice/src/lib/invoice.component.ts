import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { LoginService } from '@pos/ezisend/auth/data-access/services';
import { MeResponse } from '@pos/ezisend/auth/data-access/store';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { MatCheckboxChange } from '@angular/material/checkbox';
import {
  BreadcrumbItem,
  IResponse,
} from '@pos/ezisend/shared/data-access/models';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import {
  EMPTY,
  Observable,
  Subject,
  catchError,
  finalize,
  takeUntil,
  tap,
} from 'rxjs';
import { environment } from '@pos/shared/environments';
import * as moment from 'moment';
import { IStatusInvoices } from './invoices.model';

@Component({
  selector: 'pos-billing-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})
export class BillingInvoiceComponent {
  public languageData: any =
    localStorage.getItem('language') &&
    localStorage.getItem('language') === 'en'
      ? en.data.billing
      : localStorage.getItem('language') &&
        localStorage.getItem('language') === 'my'
      ? bm.data.billing
      : en.data.billing;
  constructor(
    public commonService: CommonService,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private translate: TranslationService,
    private renderer: Renderer2
  ) {
    this.assignLanguageLabel();

    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem('language') == 'en') {
        this.languageData = en.data.billing;
      } else if (localStorage.getItem('language') == 'my') {
        this.languageData = bm.data.billing;
      }

      this.assignLanguageLabel();
    });
  }
  breadcrumbItems: BreadcrumbItem[] = [];

  @Input() downloadSvg = './assets/download.svg';
  @Input() currentPage = 1;
  @Input() pageSize = 20;
  pageSizeOptions = [20, 50, 100];

  tooltipMessage = 'Download';
  backData = {
    path: '/my-shipment',
    query: {},
    label: 'Back to Pick Up',
  };
  dataSource = new MatTableDataSource<any>([]);
  total = 0;
  totalAmount = 0;
  isSelectAllOrder = false;
  selectedRows: any[] = [];
  selectedData: any[] = [];
  selection = new SelectionModel<number>(true, []);
  private isToggled = false;
  protected _onDestroy = new Subject<void>();
  @Output() pageEvent = new EventEmitter<{
    currentPage: number;
    pageSize: number;
  }>();
  displayedColumns: string[] = [
    'select',
    'date',
    'invoiceNumber',
    'status',
    'timestamp',
    'period',
    'amount',
    'action',
  ];
  userData$!: Observable<MeResponse>;
  accountNumber = '';
  email = '';
  accessToken = '';
  invoiceDate = '';
  invoiceList: any[] = [];
  id: string | undefined;
  loading = true;
  displayInvoiceData = false;
  disablePayment = false;
  data!: any;
  latestOrder: IStatusInvoices[] = [];

  ngOnInit() {
    this.fetchInvoiceData();
    this.fetchUserData();
  }

  /**
   * Method Name: fetchUserData
   *
   * Input Parameters:
   *   - None
   *
   * Output Parameters:
   *   - None
   *
   * Purpose:
   *   - To fetch the user profile data from the server and handle the response.
   *
   * Author:
   *   - [Fiaruz Samad]
   *
   * Description:
   *   - This method initiates a request to fetch user profile data by calling `fetchList` on `commonService` with 'profile' and 'query' as parameters.
   *     It subscribes to the observable and processes the response by updating the `data` property with the fetched data.
   *     In case of an error during the fetch operation, it triggers an error dialog and ensures the observable completes with an `EMPTY` observable to avoid further processing.
   *     Finally, it signals the loading state as false using `commonService.isLoading(false)` in the `finalize` operator.
   *     The method also handles component teardown by using `takeUntil` with `_onDestroy` to manage subscription lifecycles.
   */
  fetchUserData() {
    this.commonService
      .fetchList('profile', 'query')
      .pipe(
        takeUntil(this._onDestroy),
        tap((res: IResponse<any>) => {
          this.data = res.data;
        }),
        catchError(() => {
          this.commonService.openErrorDialog();
          return EMPTY;
        }),
        finalize(() => this.commonService.isLoading(false))
      )
      .subscribe();
  }

  /**
   * Method Name: fetchInvoiceData
   *
   * Input Parameters:
   *   - None
   *
   * Output Parameters:
   *   - None
   *
   * Purpose:
   *   - To fetch and process invoice data for the current user.
   *
   * Author:
   *   - [Fairuz Samad]
   *   - [Jyoti Garg]
   *
   * Description:
   *   - This method performs several sequential operations to fetch invoice data for the current user.
   *
   *     1. Retrieves the authentication token from local storage.
   *     2. Fetches user data from the `loginService` to obtain the user's account number and email.
   *     3. After receiving the user data, the authentication token is removed from local storage.
   *     4. Requests a new access token from `commonService` using the removed token.
   *     5. Fetches billing data using the newly acquired access token and the user's account number.
   *     6. Processes the billing data by sorting it based on the invoice date in descending order.
   *     7. Updates the `dataSource` with the sorted billing data and manages the display of invoice data based on whether there are any invoices.
   *     8. Restores the original authentication token to local storage.
   *     9. Triggers change detection and calls `getStatus` with the list of invoice numbers.
   *
   *     The method uses RxJS operators and manages asynchronous operations by handling subscription completions and ensuring that the authentication token is properly restored.
   */
  fetchInvoiceData() {
    this.userData$ = this.loginService.me();
    const authToken = localStorage.getItem('authToken');
    this.userData$.subscribe({
      next: (data) => {
        this.accountNumber = data?.data?.user?.account_no ?? '';
        this.email = data?.data?.user?.email ?? '';
      },
      complete: () => {
        localStorage.removeItem('authToken');
        this.commonService.getInvoiceAccessToken().subscribe({
          next: (res) => {
            this.accessToken = res.access_token;
          },
          complete: () => {
            this.commonService
              .fetchBillingData(this.accessToken, this.accountNumber)
              .subscribe({
                next: (res) => {
                  if (res && res.length > 0) {
                    // Sort the invoices by date
                    res = res.slice().sort((a: any, b: any) => {
                      let dateA = new Date(
                        a.invoice_date.split('/').reverse().join('/')
                      );
                      let dateB = new Date(
                        b.invoice_date.split('/').reverse().join('/')
                      );
                      return dateB.getTime() - dateA.getTime();
                    });
                  }

                  this.dataSource.data = res;
                  if (this.dataSource.data.length !== 0) {
                    this.displayInvoiceData = true;
                    this.dataSource.data.map((invoice: any) => {
                      this.invoiceList.push(invoice.invoice_number.toString());
                    });
                  } else {
                    this.displayInvoiceData = false;
                  }
                  this.loading = false;
                },

                complete: () => {
                  localStorage.setItem('authToken', authToken ?? '');
                  this.cdr.detectChanges();
                  this.getStatus(this.invoiceList);
                },
              });
          },
        });
      },
    });
  }

  /**
   * Method Name: downloadInvoice
   *
   * Input Parameters:
   *   - id (string): The unique identifier of the invoice to be downloaded.
   *
   * Output Parameters:
   *   - None
   *
   * Purpose:
   *   - To download the invoice as a PDF file by generating it using an authentication token and invoice ID.
   *
   * Author:
   *   - [Fairuz Samad]
   *   - [Jyoti Garg]
   *   - [Saepul Latif]
   *
   * Description:
   *   - This method handles the process of downloading an invoice as a PDF file.
   *
   *     1. Retrieves the authentication token from local storage and temporarily removes it.
   *     2. Calls `downloadReceipt` on `commonService` to fetch the invoice using the provided `id` and `accessToken`.
   *     3. The response is expected to be a Blob containing the PDF data.
   *     4. Creates a new Blob object with the response data and sets its MIME type to 'application/pdf'.
   *     5. Generates a download link element, sets its `href` attribute to the Blob URL, and triggers a click event to start the download.
   *     6. After the download is initiated, restores the original authentication token to local storage.
   *     7. The method uses `takeUntil` to ensure that the subscription is managed and cleaned up when the component is destroyed.
   */
  downloadInvoice(id: string) {
    const authToken: any = localStorage.getItem('authToken');
    localStorage.removeItem('authToken');
    this.commonService
      .downloadReceipt(this.accessToken, id)
      .pipe(takeUntil(this._onDestroy))
      .subscribe({
        next: (res: any) => {
          const blob = new Blob([res.body], {
            type: 'application/pdf',
          });

          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = 'Invoice.pdf';
          downloadLink.click();
        },
        complete: () => {
          localStorage.setItem('authToken', authToken);
        },
      });
  }

  /**
   * Method Name: parseDate
   *
   * Input Parameters:
   *   - dateString (string): A date string in the format 'DD/MM/YYYY' to be parsed.
   *
   * Output Parameters:
   *   - Date: A JavaScript `Date` object representing the parsed date.
   *
   * Purpose:
   *   - To convert a date string in 'DD/MM/YYYY' format into a JavaScript `Date` object.
   *
   * Author:
   *   - [Saepul Latif]
   *
   * Description:
   *   - This method uses the `moment` library to parse a date string formatted as 'DD/MM/YYYY'.
   *   - It converts the parsed date string into a JavaScript `Date` object using `moment.toDate()`.
   *   - This is useful for transforming date strings into a format that can be easily manipulated or displayed using standard JavaScript date functions.
   */
  private parseDate(dateString: string): Date {
    return moment(dateString, 'DD/MM/YYYY').toDate();
  }

  /**
   * Method Name: formatInvoiceDate
   *
   * Input Parameters:
   *   - originalDate (string): A date string in 'DD/MM/YYYY' format to be formatted.
   *
   * Output Parameters:
   *   - any: The formatted date string in 'dd MMM yyyy' format.
   *
   * Purpose:
   *   - To format a date string into a more readable format using Angular's `DatePipe`.
   *
   * Author:
   *   - [Jyoti Garg]
   *
   * Description:
   *   - This method first converts the `originalDate` string, which is in 'DD/MM/YYYY' format, into a JavaScript `Date` object using the `parseDate` method.
   *   - It then uses Angular's `DatePipe` to transform the `Date` object into a string formatted as 'dd MMM yyyy', where 'dd' is the day of the month, 'MMM' is the abbreviated month name, and 'yyyy' is the year.
   *   - This formatting makes the date more readable and suitable for display in the user interface.
   *
   * Note:
   *   - Ensure that `DatePipe` is properly injected into the component or service where this method is used.
   */
  formatInvoiceDate(originalDate: string): any {
    const date = this.parseDate(originalDate);
    return this.datePipe.transform(date, 'dd MMM yyyy');
  }

  /**
   * Method Name: formatInvoicePeriod
   *
   * Input Parameters:
   *   - invoicePeriod (string): A string representing a period in the format 'DD/MM/YYYY - DD/MM/YYYY'.
   *
   * Output Parameters:
   *   - string: A formatted string representing the period with start and end dates in 'dd MMM yyyy' format.
   *
   * Purpose:
   *   - To format a period string into a more readable format using Angular's `DatePipe`.
   *
   * Author:
   *   - [Jyoti Garg]
   *
   * Description:
   *   - This method processes an `invoicePeriod` string that represents a period with start and end dates separated by " - ".
   *   - It splits the `invoicePeriod` into two parts, representing the start and end dates.
   *   - The split date strings are then parsed into `Date` objects using the `parseDate` method.
   *   - These `Date` objects are formatted into strings with 'dd MMM yyyy' format using Angular's `DatePipe`.
   *   - The method returns a formatted string combining the formatted start and end dates, separated by " - ".
   *
   * Note:
   *   - Ensure that `DatePipe` is properly injected into the component or service where this method is used.
   */

  formatInvoicePeriod(invoicePeriod: string): string {
    const dates = invoicePeriod.split(' - ');
    const startDate = this.parseDate(dates[0]);
    const endDate = this.parseDate(dates[1]);
    const formattedStartDate = this.datePipe.transform(
      startDate,
      'dd MMM yyyy'
    );
    const formattedEndDate = this.datePipe.transform(endDate, 'dd MMM yyyy');

    return `${formattedStartDate} - ${formattedEndDate}`;
  }

  /**
   * Method Name: masterToggle
   *
   * Input Parameters:
   *   - event (any): The event object from the UI checkbox indicating whether the toggle is checked or unchecked.
   *
   * Output Parameters:
   *   - None
   *
   * Purpose:
   *   - To toggle the selection of all rows in the data table based on the current state of the master checkbox.
   *
   * Author:
   *   - [Fairuz Samad]
   *   - [Saepul Latif]
   *
   * Description:
   *   - This method manages the selection state of all rows in the data table when the master toggle checkbox is used.
   *
   *     1. It first retrieves the IDs of rows that are neither 'success' nor 'pending' statuses.
   *     2. Resets the toggle states in the UI by setting `isSelectAllOrder` to false and `isToggled` to true.
   *     3. If all rows are currently selected (`isAllSelected()` returns true), it deselects all rows and updates `selectedRows` and `totalAmount` accordingly.
   *     4. If the checkbox is checked (`event.checked`), it handles selecting all rows by calling `handleCheckAllRows` with the entire data set.
   *     5. If the checkbox is unchecked, it clears the selection and resets `selectedRows` to an empty array.
   *     6. Updates the selection by selecting all rows with IDs that are not 'success' or 'pending'.
   *
   * Note:
   *   - Ensure that `handleCheckAllRows`, `isAllSelected`, and other methods or properties used are properly defined and working as expected.
   */
  masterToggle(event: any) {
    const dataTableIds = this.dataSource.data
      .filter((el) => el.status !== 'success' && el.status !== 'pending')
      .map((data: any) => data.id);

    this.isSelectAllOrder = false;
    this.isToggled = true;

    if (this.isAllSelected()) {
      this.selection.deselect(...dataTableIds);
      dataTableIds.forEach((id: number) => {
        this.selectedRows = this.selectedRows.filter((row) => row.id !== id);
      });
      this.totalAmount = 0;
      return;
    }

    if (event.checked) {
      this.handleCheckAllRows(this.dataSource.data);
    } else {
      this.selection.clear();
      this.selectedRows = [];
    }

    this.selection.select(...dataTableIds);
  }

  /**
   * Method Name: handleCheckAllRows
   *
   * Input Parameters:
   *   - dataTable (any): The complete dataset of rows in the table to be processed.
   *
   * Output Parameters:
   *   - None
   *
   * Purpose:
   *   - To handle the selection of all rows that meet certain criteria and update the total amount of selected items.
   *
   * Author:
   *   - [Fairuz Samad]
   *   - [Saepul Latif]
   *
   * Description:
   *   - This method manages the selection of rows in the data table when the master checkbox is checked.
   *
   *     1. Resets the `total` and clears the selection by calling `this.selection.clear()` and resetting `this.selectedRows`.
   *     2. Creates a list of objects containing the `id` and `status` of each row from the `dataTable`, filtering out rows with statuses 'success' or 'pending'.
   *     3. Iterates over the filtered rows, and if a row is not already included in `selectedRows`, it adds the row to `selectedRows`.
   *     4. Computes the total amount of the selected rows by summing up the amounts after cleaning non-numeric characters from the `amount` field.
   *     5. Updates `totalAmount` with the computed sum.
   *
   * Note:
   *   - Ensure that `this.selection`, `this.selectedRows`, and other properties or methods used are correctly initialized and defined.
   *   - The `amount` field should be a string that can be parsed into a number for the computation to be accurate.
   */
  private handleCheckAllRows(dataTable: any) {
    this.total = 0;
    this.selection.clear();
    this.selectedRows = [];

    let dataTableIds = dataTable
      .map((data: any) => ({ id: data.id, status: data.status }))
      .filter((el: any) => el.status !== 'success' && el.status !== 'pending');

    dataTableIds.forEach((list: any) => {
      const selectedRowsId = this.selectedRows.map((row) => ({
        id: row.id,
        status: row.status,
      }));
      if (!selectedRowsId.includes(list.id)) {
        this.selectedRows.push(
          dataTable.find((data: any) => data.id === list.id)
        );
      }
    });

    this.totalAmount = this.selectedRows.reduce(
      (prev: number, row) =>
        prev + +parseFloat(row.amount.replace(/[^\d.-]/g, '')),
      0
    );
  }

  /**
   * Method Name: isAllSelected
   *
   * Input Parameters:
   *   - None
   *
   * Output Parameters:
   *   - boolean: Returns true if all applicable checkboxes are selected, otherwise false.
   *
   * Purpose:
   *   - To determine if all checkboxes for rows that meet the selection criteria are selected.
   *
   * Author:
   *   - [Saepul Latif]
   *
   * Description:
   *   - This method checks whether all rows in the data table that meet the specified criteria are selected.
   *
   *     1. Filters the `dataSource.data` to include only rows where the status is neither 'success' nor 'pending'.
   *     2. Maps the filtered rows to their IDs.
   *     3. Compares the number of selected rows (`this.selectedRows.length`) to the number of applicable data table IDs.
   *     4. Returns true if the count of selected rows matches the count of applicable IDs, indicating that all checkboxes for these rows are selected.
   *     5. Returns false if the counts do not match, indicating that not all checkboxes are selected.
   *
   * Note:
   *   - Ensure that `this.selectedRows` and `this.dataSource.data` are properly managed and updated elsewhere in the component.
   */
  isAllSelected(): boolean {
    const dataTableIds = this.dataSource.data
      .filter((el) => el.status !== 'success' && el.status !== 'pending')
      .map((data: any) => data.id);

    return this.selectedRows.length === dataTableIds.length;
  }

  /**
   * Method Name: onSelectRow
   *
   * Input Parameters:
   *   - event (MatCheckboxChange): The event object from the checkbox indicating the change in selection state.
   *   - row (any): The data object representing the row that is being selected or deselected.
   *
   * Output Parameters:
   *   - None
   *
   * Purpose:
   *   - To handle the selection or deselection of a single row and update related properties.
   *
   * Author:
   *   - [Fariz Samad]
   *   - [Saepul Latif]
   *
   * Description:
   *   - This method is triggered when a user interacts with a checkbox for a single row in the data table.
   *
   *     1. Resets `total` to 0 to clear any previous totals.
   *     2. If the event object is falsy, the method exits early.
   *     3. Toggles the selection state of the specified row using `this.selection.toggle(row)`.
   *     4. Calls `getSelectedDataShipments(row)` to handle additional processing related to the selected or deselected row.
   *
   * Note:
   *   - Ensure that `this.selection` and `getSelectedDataShipments` are properly defined and implemented.
   */
  onSelectRow(event: MatCheckboxChange, row: any) {

    this.total = 0;
    if (!event) return;

    this.selection.toggle(row);
    this.getSelectedDataShipments(row);
  }

  /**
   * Method Name: getSelectedDataShipments
   *
   * Input Parameters:
   *   - row (any): The data object representing the row whose selection state needs to be updated.
   *
   * Output Parameters:
   *   - None
   *
   * Purpose:
   *   - To update the `selectedRows` list and calculate the total amount based on the selection state of the rows.
   *
   * Author:
   *   - [Fairuz Samad]
   *
   * Description:
   *   - This method updates the `selectedRows` array and calculates the `totalAmount` based on the current selection state of the rows.
   *
   *     1. Checks if the specified `row` is already in the `selectedRows` list.
   *        - If the row is found, it is removed from `selectedRows`.
   *        - If the row is not found, it is added to `selectedRows`.
   *     2. Updates `totalAmount` based on the number of selected rows:
   *        - If more than one row is selected, it sums the amounts of all selected rows after cleaning non-numeric characters from the `amount` field.
   *        - If only one row is selected, it sets `totalAmount` to the amount of the selected row.
   *        - If no rows are selected, it sets `totalAmount` to 0.
   *
   * Note:
   *   - Ensure that `this.selection` and `this.selectedRows` are properly defined and managed in the component.
   *   - The `amount` field should be formatted as a string that can be parsed into a number for accurate total calculation.
   */
  private getSelectedDataShipments(row: any) {
    this.selectedRows = this.selectedRows.find(
      (selected) => row.id === selected.id
    )
      ? this.selectedRows.filter((selected) => selected.id !== row.id)
      : [...this.selectedRows, row];

    if (this.selection.selected.length > 1) {
      this.totalAmount = this.selectedRows.reduce(
        (prev: number, row) =>
          prev + +parseFloat(row.amount.replace(/[^\d.-]/g, '')),
        0
      );
    } else if (this.selection.selected.length === 1) {
      this.totalAmount = parseFloat(row.amount.replace(/[^\d.-]/g, ''));
    } else {
      this.totalAmount = 0;
    }
  }

  /**
   * Method Name: showDatetime
   *
   * Input Parameters:
   *   - value (number): The ID of the row for which to determine if the date/time should be shown.
   *
   * Output Parameters:
   *   - boolean: Returns true if the row with the given ID is selected, otherwise false.
   *
   * Purpose:
   *   - To determine whether the date/time should be displayed for a specific row based on its selection state.
   *
   * Author:
   *   - [Saepul Latif]
   *
   * Description:
   *   - This method checks if a specific row, identified by its `id`, is included in the `selectedRows` array.
   *
   *     1. Uses the `Array.prototype.some` method to check if any row in `selectedRows` has an `id` that matches the provided `value`.
   *     2. Returns true if the row is found in `selectedRows`, indicating that the date/time should be shown for that row.
   *     3. Returns false if the row is not found, indicating that the date/time should not be displayed.
   *
   * Note:
   *   - Ensure that `this.selectedRows` is properly managed and updated in the component to reflect the current selection state.
   */
  showDatetime(value: number): boolean {
    return this.selectedRows.some((el) => el.id === value);
  }

  /**
   * Method Name: getStatus
   *
   * Input Parameters:
   *   - invoiceList (any): A list of invoice numbers for which the status needs to be retrieved.
   *
   * Output Parameters:
   *   - None
   *
   * Purpose:
   *   - To fetch and update the payment status for a list of invoices and reflect the changes in the data source.
   *
   * Author:
   *   - [Fairuz Samad]
   *
   * Description:
   *   - This method submits a request to fetch the payment status of the invoices provided in `invoiceList`.
   *
   *     1. Sends a request to the `commonService.submitData` method with the endpoint 'payment', action 'status', and the `invoiceList` as the payload.
   *     2. Processes the response to obtain the latest statuses for the invoices.
   *     3. Calls `getLatestOrders` to extract the latest order statuses from the response data.
   *     4. Iterates over the `latestOrder` array to update the status of each invoice in the `dataSource`:
   *        - Finds the corresponding invoice in `dataSource` by matching the `invoice_number`.
   *        - Updates the `status` of the invoice if found.
   *        - If an invoice is not found, sets its status to an empty string.
   *     5. Updates the `dataSource.data` array and triggers change detection with `this.cdr.detectChanges()` to reflect the updated statuses in the UI.
   *
   * Note:
   *   - Ensure that `this.commonService`, `this.getLatestOrders`, and `this.dataSource` are properly defined and initialized.
   *   - The `dataSource` should be an array of objects where each object represents an invoice with an `invoice_number` and `status`.
   */
  getStatus(invoiceList: any) {
    this.commonService
      .submitData('payment', 'status', { invoice_no_list: invoiceList })
      .pipe(takeUntil(this._onDestroy))
      .subscribe((data: any) => {
        const currentTime = new Date();
        this.latestOrder = this.getLatestOrders(data.data);
        this.latestOrder.forEach((invoice: any) => {
          const orderStatus = this.dataSource.data?.find(
            (status: any) =>
              invoice.invoice_no === status.invoice_number.toString()
          );

          if (orderStatus) {
            const updatedData = this.dataSource.data;
            orderStatus.status = invoice.order_status;
            // Parse the modified date from the invoice data to convert pending status to failed after 2 hours
            const modifiedDate = new Date(invoice.modified_date); // Using invoice's modified_date
            const timeDifferenceInMs = currentTime.getTime() - modifiedDate.getTime();
            const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
            // Checking if the status is 'pending' or 'abort' and time difference exceeds 2 hours (2 * 60 * 60 * 1000 ms)
          if ((orderStatus.status === 'pending' || orderStatus.status === 'abort') && timeDifferenceInMs > twoHoursInMs) {
            orderStatus.status = 'fail';
          } else {
              orderStatus.status = invoice.order_status; // Update with latest order status if not pending
            }
            orderStatus.modified_date = invoice.modified_date;
            this.dataSource.data = updatedData;
            this.cdr.detectChanges();
          } else {
            invoice.status = '';
          }
        });
      });
  }

  /**
   * Method Name: getLatestOrders
   *
   * Input Parameters:
   *   - data (any[]): An array of order objects, each containing an `invoice_no` and `modified_date`.
   *
   * Output Parameters:
   *   - any[]: An array of the most recent version of each order based on the invoice number and its modification date.
   *
   * Purpose:
   *   - To filter and return the most recent version of each order by invoice number, considering the modification date.
   *
   * Author:
   *   - [Fairuz Samad]
   *
   * Description:
   *   - This method processes an array of order objects to identify the latest version of each order based on its invoice number and modification date.
   *
   *     1. Uses the `Array.prototype.reduce` method to create a `Map` where each key is an invoice number and the value is the most recent order for that invoice number.
   *        - For each order in the `data` array, it checks if an order with the same `invoice_no` already exists in the map.
   *        - If no existing order is found or the current order has a newer `modified_date`, it updates the map with the current order.
   *     2. Converts the values of the `Map` to an array using `Array.from(latestOrdersMap.values())` and returns this array.
   *
   * Note:
   *   - Ensure that `data` is an array of objects with `invoice_no` and `modified_date` fields formatted correctly.
   *   - The `modified_date` should be in a format that can be compared using JavaScript's `Date` object.
   */

  private getLatestOrders(data: any[]): any[] {
    const latestOrdersMap = data.reduce((map, order) => {
      const existingOrder = map.get(order.invoice_no);

      if (
        !existingOrder ||
        new Date(order.modified_date) > new Date(existingOrder.modified_date)
      ) {
        map.set(order.invoice_no, order);
      }
      return map;
    }, new Map<string, any>());

    return Array.from(latestOrdersMap.values());
  }

  /**
   * Method Name: pay
   *
   * Input Parameters:
   *   - None
   *
   * Output Parameters:
   *   - None
   *
   * Purpose:
   *   - To prepare and send payment data to the payment gateway for processing and handle the response.
   *
   * Author:
   *   - [Fairuz Samad]
   *
   * Description:
   *   - This method processes selected invoices for payment, constructs a request body for the payment gateway, and handles the response.
   *
   *     1. Prepares the `invoices` array by mapping over `this.selectedRows` to convert invoice numbers to strings and clean the amount strings by removing currency symbols and commas.
   *     2. Constructs the `requestBody` object with payment details, including:
   *        - `payment_gateway`, `application_name`, and URLs for redirection upon success, failure, and abortion of the payment.
   *        - `order_total_amount`, `order_account_no`, and other order details such as `order_gst_amount`, `order_ship_name`, and contact information.
   *        - `generate_html_form` set to 'true' and a dynamic callback URL for processing payment.
   *        - The `invoices` array prepared earlier.
   *     3. Sends the `requestBody` to the `commonService.submitData` method with the endpoint 'payment' and action 'init' to initialize the payment process.
   *     4. Uses RxJS operators to handle the observable:
   *        - `tap` to process the response and call `handlePaymentGateway` with the response data.
   *        - `catchError` to handle errors by showing an error dialog and returning the error.
   *     5. Subscribes to the observable to execute the request.
   *
   * Note:
   *   - Ensure that `this.selectedRows`, `this.totalAmount`, `this.accountNumber`, `this.data`, and `this.email` are correctly set and managed in the component.
   *   - The `requestBody` should match the expected format of the payment gateway API.
   *   - Handle `handlePaymentGateway` method to process the response appropriately.
   */
  pay() {
    const invoices = this.selectedRows.map((data: any) => ({
      invoice_no: data.invoice_number.toString(),
      amount: data.amount.replace(/^RM\s*/, '').replace(/,/g, ''),
    }));

    const requestBody = {
      payment_gateway: 'kiplepay',
      application_name: 'spp',
      return_url: `${environment.paymentRedirect.pgw_url}process_payment`,
      redirect_success_url: `${environment.paymentRedirect.url}billing/invoice`,
      redirect_failure_url: `${environment.paymentRedirect.url}billing/invoice`,
      redirect_abort_url: `${environment.paymentRedirect.url}billing/invoice`,
      order_total_amount: this.totalAmount.toString(),
      order_account_no: this.accountNumber.toString(),
      order_gst_amount: '0',
      order_ship_name: this.data.name,
      order_ship_country: 'Malaysia',
      order_telephone: this.data.phone_no,
      order_email: this.email,
      order_delivery_charges: '0',
      order_service_charges: '0',
      generate_html_form: 'true',
      dynamic_callback_url: `${environment.paymentRedirect.pgw_url}process_payment`,
      invoices: invoices,
    };

    this.commonService
      .submitData('payment', 'init', requestBody)
      .pipe(
        takeUntil(this._onDestroy),
        tap((response: any) => {
          this.handlePaymentGateway(response);
        }),
        catchError((err) => {
          this.commonService.openErrorDialog(
            '',
            this.languageData.already_paid_error
          );
          return err;
        })
      )
      .subscribe();
  }
  /**
   * Method Name: handlePaymentGateway
   *
   * Input Parameters:
   *   - data (any): The response data containing the payment gateway form HTML.
   *
   * Output Parameters:
   *   - None
   *
   * Purpose:
   *   - To handle the response from the payment gateway initialization request by creating and submitting the payment form.
   *
   * Author:
   *   - [Fairuz Samad]
   *
   * Description:
   *   - This method processes the response from the payment gateway to dynamically create and submit a payment form.
   *
   *     1. Creates a new `div` element using Angular's `Renderer2` to hold the payment gateway form.
   *     2. Sets the `innerHTML` of the `div` to the payment gateway form HTML provided in the `data` response.
   *     3. Appends the newly created `div` to the `document.body` to make the form available in the DOM.
   *     4. Selects the submit button within the form by querying for an `input` element with the name `submit`.
   *     5. Sets the `id` attribute of the submit button to `submit_btn` and programmatically triggers a click event to submit the form.
   *
   * Note:
   *   - Ensure that `data.data.payment_gateway_form` contains valid HTML for the payment form.
   *   - The `Renderer2` service is used to handle DOM manipulation in an Angular-friendly way.
   *   - Ensure that the form submission is handled correctly by the payment gateway and that any necessary validations are in place.
   */
  private handlePaymentGateway(data: any) {
    const paymentForm = this.renderer.createElement('div');
    paymentForm.innerHTML = data.data.payment_gateway_form;
    this.renderer.appendChild(document.body, paymentForm);
    const submitBtn = document.querySelector('input[name="submit"]');
    submitBtn?.setAttribute('id', 'submit_btn');
    document.getElementById('submit_btn')?.click();
  }

  /**
   * Method Name: onPageEvent
   *
   * Input Parameters:
   *   - event (PageEvent): The event object containing information about the current page and page size.
   *
   * Output Parameters:
   *   - None
   *
   * Purpose:
   *   - To handle pagination events and emit an event with the updated page information.
   *
   * Author:
   *   - [Fairuz Samad]
   *
   * Description:
   *   - This method processes a pagination event from a table component, updates the current page and page size, and emits an event with this information.
   *
   *     1. Updates the `currentPage` property based on the `pageIndex` from the `event`, adjusting for zero-based indexing by adding 1.
   *     2. Updates the `pageSize` property based on the `pageSize` from the `event`.
   *     3. Emits a `pageEvent` with an object containing the updated `currentPage` and `pageSize`.
   *
   * Note:
   *   - Ensure that `this.pageEvent` is an `EventEmitter` instance that is properly initialized and subscribed to in the parent component or service.
   *   - `PageEvent` should be imported from the Angular Material library or the relevant source that defines it.
   */
  onPageEvent(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;

    this.pageEvent.emit({
      currentPage: this.currentPage,
      pageSize: this.pageSize,
    });
  }

  /**
   * Method Name: assignLanguageLabel
   *
   * Input Parameters:
   *   - None
   *
   * Output Parameters:
   *   - None
   *
   * Purpose:
   *   - To assign translated labels and text from the language data to various UI elements.
   *
   * Author:
   *   - [Fairuz Samad]
   *
   * Description:
   *   - This method updates UI elements with labels and text based on the provided language data.
   *
   *     1. Assigns the `tooltipMessage` property with the translated text for the download action from `this.languageData`.
   *     2. Updates the `backData.label` property with the translated text for the back navigation from `this.languageData`.
   *     3. Sets the `breadcrumbItems` property with an array containing breadcrumb data:
   *        - `title` is set to the translated home text from `this.languageData`.
   *        - `routerLink` is set to an empty array, indicating the home route.
   *        - `external` is set to `false`, indicating that this link is internal.
   *        - `current` is set to `false`, indicating that this breadcrumb item is not the current page.
   *
   * Note:
   *   - Ensure that `this.languageData` is properly initialized and contains the required translations.
   *   - `this.backData` and `this.breadcrumbItems` should be correctly defined and used in the component's template.
   */
  assignLanguageLabel() {
    this.tooltipMessage = this.languageData.download;
    this.backData.label = this.languageData.back_data;

    this.breadcrumbItems = [
      {
        title: this.languageData?.home,
        routerLink: [''],
        external: false,
        current: false,
      },
      {
        title: this.languageData.invoices,
        external: false,
        current: true,
      },
    ];
  }

  /**
   * Method Name: formatTimestamp
   *
   * Input Parameters:
   *   - value (number): The Unix timestamp to be formatted.
   *
   * Output Parameters:
   *   - { date: string, time: string }: An object containing the formatted date and time.
   *
   * Purpose:
   *   - To convert a Unix timestamp into local date and time strings.
   *
   * Author:
   *   - [Fairuz Samad]
   *
   * Description:
   *   - This method takes a Unix timestamp as input, converts it to a local date and time format, and returns the formatted values.
   *
   *     1. Converts the UTC date-time string to a JavaScript `Date` object.
   *     2. Formats the local time from the `Date` object using `moment().local().format('hh:mmA')` to obtain a time string in 12-hour format with AM/PM.
   *     3. Formats the local date from the `Date` object using `moment().local().format('DD MMM YY')` to obtain a date string in the format `DD MMM YY`.
   *     4. Returns an object containing the formatted `date` and `time`.
   *
   * Note:
   *   - Ensure that `moment` is properly imported and configured in the project.
   *   - This method assumes that the `value` parameter is a valid Unix timestamp and will handle it correctly.
   *   - The formatting functions may be adjusted depending on the specific date and time format requirements.
   */
  formatTimestamp(modifiedDate: string): {
    date: string;
    time: string;
  } {
    const dt = moment(modifiedDate).format('YYYY-MM-DD HH:mm:ss');
    const stillUtc = moment(dt).toDate();

    const time = moment(stillUtc).local().format('hh:mmA');

    return {
      date: moment(stillUtc).local().format('DD MMM YY'),
      time: time,
    };
  }
}
