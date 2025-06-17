import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BreadcrumbItem } from '@pos/ezisend/shared/data-access/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import * as moment from 'moment';
import { LoginService } from '@pos/ezisend/auth/data-access/services';
import { MeResponse } from '@pos/ezisend/auth/data-access/store';
import { TranslationService } from '../../../../shared-services/translate.service';
import { bm } from 'libs/ezisend/assets/my';
import { en } from 'libs/ezisend/assets/en';
const ELEMENT_DATA = [
  { date: new Date(), status: 'In Progress', action: 'Download Report' },
  { date: new Date(), status: 'Complete', action: '' },
];
@Component({
  selector: 'pos-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  displayedColumns: string[] = ['date', 'status', 'action'];
  dataSource = ELEMENT_DATA;
  userData$!: Observable<MeResponse>;
  accountNumber: any = '';
  accessToken: any = '';
  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private snackBar: MatSnackBar,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private translate: TranslationService
  ) {
    this.assignLanguageLabel();
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem('language') == 'en') {
        this.languageData = en.data.report;
      } else if (localStorage.getItem('language') == 'my') {
        this.languageData = bm.data.report;
      }
      this.assignLanguageLabel();
      this.cdr.detectChanges();
    });
  }
  matChipArray: any = [];
  maxDate = new Date();
  minDate = new Date(
    this.maxDate.getFullYear(),
    this.maxDate.getMonth(),
    this.maxDate.getDate() - 90
  );
  start_date = '';
  end_date = '';
  reportList = [];
  breadcrumbItems: BreadcrumbItem[] = [];
  dateRangePickerForm: FormGroup = this.fb.group({
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    status: ['', Validators.required],
  });
  loading = true;
  displayReportData = false;
  protected _onDestroy = new Subject<void>();
  dropdownOptions: any = [];
  allSelected = false;
  languageData: any =
    localStorage.getItem('language') &&
    localStorage.getItem('language') === 'en'
      ? en.data.report
      : localStorage.getItem('language') &&
        localStorage.getItem('language') === 'my'
      ? bm.data.report
      : en.data.report;
  assignLanguageLabel() {
    // // bread-crumb
    this.breadcrumbItems = [
      {
        title: this.languageData?.home,
        routerLink: [''],
        external: false,
        current: false,
      },
      {
        title: this.languageData.reports,
        external: false,
        current: true,
      },
    ];
    // // drop-down items
    this.dropdownOptions = [
      { value: 'all', viewValue: this.languageData.all },
      { value: 'cancelled', viewValue: this.languageData.cancelled },
      { value: 'pickup-requested', viewValue: this.languageData.pickup_requested },
      { value: 'out-for-delivery', viewValue: this.languageData.out_for_delivery },
      { value: 'picked-up', viewValue: this.languageData.picked_up },
      { value: 'droppedoff', viewValue: this.languageData.droppedoff },
      { value: 'in-transit', viewValue: this.languageData.in_transit },
      { value: 'delivered', viewValue: this.languageData.delivered },
      { value: 'failed', viewValue: this.languageData.failed },
      { value: 'cod', viewValue: this.languageData.cod },
      { value: 'non_cod', viewValue: this.languageData.non_cod },
      { value: 'order-created', viewValue: this.languageData.order_created },
      { value: 'pickup-failed', viewValue: this.languageData.pickup_failed },
      { value: 'to-collect', viewValue: this.languageData.to_collect },
      { value: 'collected', viewValue: this.languageData.collected },
      { value: 'return_success', viewValue: this.languageData.returned },
      { value: 'return_failed', viewValue: this.languageData.return_failed },
    ];
    // // selected dropdown option translation
    if (this.matChipArray.length > 0) {
      const valueMap = new Map(
        this.dropdownOptions.map((option: any) => [
          option.value,
          option.viewValue,
        ])
      );
      for (let i = 0; i < this.matChipArray.length; i++) {
        const viewValue = valueMap.get(this.matChipArray[i].value);
        if (viewValue) {
          this.matChipArray[i].viewValue = viewValue;
        }
      }
    }
  }

  ngOnInit() {
    this.end_date = moment().format('YYYY-MM-DDT00:00:00[Z]');
    this.start_date = moment().subtract(30, 'days').format('YYYY-MM-DDT00:00:00[Z]');
    this.dateRangePickerForm= this.fb.group({
      start_date: [this.start_date],
      end_date: [this.end_date],
      status: ['', Validators.required],
    });
    this.userData$ = this.loginService.me();
    this.getReportList();
  }

/**
 * Method Name: onSelectChange
 *
 * Input Parameters:
 *   - event (any): The event object containing the selected values from the dropdown.
 *
 * Output Parameters:
 *   - void: This method does not return any value.
 *
 * Purpose:
 *   - Handles the change event for a dropdown selection. Updates the form control based on whether the "all" option is selected or not.
 *
 * Author:
 *   - [Ilyah Ahmad, Saepul Latif]
 *
 * Description:
 *   - This method processes the dropdown selection change event. It checks if the "all" option is selected. If it is, it determines whether to select all options or just the ones that are not "all", and updates the form control accordingly. If "all" is not selected, it updates the form control with the selected values while ensuring the "allSelected" flag is appropriately managed.
 *   - Calls `handleAllOptionSelected` if the "all" option is included in the selection, or `handleOtherOptionsSelected` otherwise.
 *   - Finally, it calls `updateChipArray` to reflect the changes in the UI or other related components.
 */
  onSelectChange(event: any) {
    const allOptionIsSelected = event.value.includes('all');
    const otherValuesSelected = event.value.filter((v: string) => v !== 'all');
    const allValues = this.dropdownOptions.map((option: { value: any }) => option.value);

    if (allOptionIsSelected) {
      this.handleAllOptionSelected(otherValuesSelected, allValues);
    } else {
      this.handleOtherOptionsSelected(otherValuesSelected);
    }

    this.updateChipArray();
  }

 /**
 * Method Name: handleAllOptionSelected
 *
 * Input Parameters:
 *   - otherValuesSelected (string[]): An array of selected values excluding "all".
 *   - allValues (any[]): An array of all possible values in the dropdown.
 *
 * Output Parameters:
 *   - void: This method does not return any value.
 *
 * Purpose:
 *   - Updates the form control based on whether all options should be selected or just the specific ones.
 *
 * Author:
 *   - [Ilyah Ahmad, Saepul Latif]
 *
 * Description:
 *   - This method handles the case when the "all" option is selected in the dropdown. It determines whether to set the form control's value to all possible options or just the other selected values based on the state of `allSelected` and the number of options selected.
 *   - If `allSelected` is true and the number of selected options is less than the total number of dropdown options minus one, it updates the form control with either all values or the selected values. It then sets `allSelected` to false.
 *   - If `allSelected` is false or if the number of selected options is not less than the total, it sets the form control to all values and updates `allSelected` to true.
 */
  private handleAllOptionSelected(otherValuesSelected: string[], allValues: any[]) {
    if (this.allSelected && otherValuesSelected.length < this.dropdownOptions.length - 1) {
      this.dateRangePickerForm.controls['status'].patchValue(
        otherValuesSelected.length === 0 ? allValues : otherValuesSelected
      );
      this.allSelected = false;
    } else {
      this.dateRangePickerForm.controls['status'].patchValue(allValues);
      this.allSelected = true;
    }
  }

/**
 * Method Name: handleOtherOptionsSelected
 *
 * Input Parameters:
 *   - otherValuesSelected (string[]): An array of selected values excluding "all".
 *
 * Output Parameters:
 *   - void: This method does not return any value.
 *
 * Purpose:
 *   - Updates the form control with the selected values when "all" is not selected.
 *
 * Author:
 *   - [Ilyah Ahmad, Saepul Latif]
 *
 * Description:
 *   - This method handles the case when only specific options are selected, and not the "all" option. It updates the form control to either the selected values or an empty array based on the state of `allSelected`.
 *   - If `allSelected` is true, indicating that "all" was previously selected, it clears the form control by setting it to an empty array. Otherwise, it sets the form control to the currently selected values and ensures that `allSelected` is set to false.
 */
  private handleOtherOptionsSelected(otherValuesSelected: string[]) {
    console.log(this.dateRangePickerForm.controls,"this.dateRangePickerForm.controls")
    this.dateRangePickerForm.controls['status'].patchValue(
      this.allSelected ? [] : otherValuesSelected
    );
    this.allSelected = false;
  }

  updateChipArray() {
    const selectedValues = this.dateRangePickerForm.controls['status'].value;
    this.matChipArray = this.dropdownOptions
      .filter((option: any) => selectedValues.includes(option.value))
      .filter((option: { value: string }) => option.value !== 'all');
  }
  onDateRangePickerFormChange(event: any) {
    if (event) {
      // this.dateRangePickerForm.get('start_date')?.setValue(event.start_date)
      // this.dateRangePickerForm.get('end_date')?.setValue(event.end_date)
      // this.dateRangePickerForm.setValue({
      //   start_date: event.start_date,
      //   end_date: event.end_date,
      // });
    } else {
      this.dateRangePickerForm.reset();
      this.matChipArray = [];
    }
  }

  getReportList() {
    this.loading = true;
    const authToken: any = localStorage.getItem('authToken');
    this.userData$.subscribe({
      next: (data: any) => {
        this.accountNumber = data?.data?.user?.account_no;
      },
      complete: () => {
        localStorage.removeItem('authToken');
        this.commonService.getReportAccessToken().subscribe({
          next: (res: any) => {
            this.accessToken = res.access_token;
          },
          complete: () => {
            this.cdr.detectChanges();
            this.commonService
              .fetchReportsData(this.accessToken, this.accountNumber)
              .subscribe({
                next: (res: any) => {
                  this.cdr.detectChanges();
                  this.reportList = (res.reports || []).sort(
                    (a: any, b: any) => {
                      let dateA = new Date(a.reportDate);
                      let dateB = new Date(b.reportDate);
                      return dateB.getTime() - dateA.getTime();
                    }
                  );
                  let reportLocalData = JSON.parse(
                    JSON.stringify(localStorage.getItem('reports'))
                  );
                  reportLocalData = JSON.parse(reportLocalData);
                  if (
                    Array.isArray(reportLocalData) &&
                    this.reportList.length
                  ) {
                    let mergedArray = reportLocalData.map((item: any) => {
                      item.reports = res.reports.map((reportItem: any) => {
                        let matchingItem = item.reports.find(
                          (secItem: any) =>
                            secItem.filename === reportItem.fileName
                        );
                        if (matchingItem) {
                          return { ...reportItem, ...matchingItem };
                        } else {
                          return reportItem;
                        }
                      });
                      return item;
                    });
                    this.reportList = mergedArray[0].reports;
                    this.cdr.detectChanges();
                  }
                  this.cdr.detectChanges();
                  this.loading = false;
                },
                complete: () => {
                  this.cdr.detectChanges();
                  localStorage.setItem('authToken', authToken);
                  // this.loading = false;
                },
              });
          },
        });
      },
    });
  }
  removeChip(index: number) {
    this.matChipArray.splice(index, 1);
    const filteredOptions = this.dropdownOptions.filter((option: any) =>
      this.matChipArray.some((filter: any) => filter.value === option.value)
    );
    this.dateRangePickerForm.controls['status'].patchValue(
      filteredOptions.map((x: any) => x.value)
    );
  }
  generateReport() {
    const authToken: any = localStorage.getItem('authToken');
    if (
      this.reportList.filter(
        (element: any) => element.fileName == '' || element.filename == ''
      ).length >= 5
    ) {
      this.snackBar.open(
        this.languageData.report_error_note,
        this.languageData.close,
        { duration: 2000 }
      );
      return;
    }
    if (this.dateRangePickerForm.valid && this.matChipArray.length) {
      this.loading = true;
      let request = {
        date_start: moment(
          this.dateRangePickerForm.getRawValue()?.start_date
        ).format('YYYY-MM-DD'),
        date_end: moment(
          this.dateRangePickerForm.getRawValue()?.end_date
        ).format('YYYY-MM-DD'),
        status: this.dateRangePickerForm
          .getRawValue()
          ?.status.filter(
            (x: string) => x !== 'cod' && x !== 'non_cod' && x !== 'all'
          )
          .toString(),
        order_type: this.dateRangePickerForm
          .getRawValue()
          ?.status.filter((x: string) => x === 'cod' || x === 'non_cod')
          .toString(),
      };
      this.commonService
        .submitData('report', `shipments/generate`, request)
        .subscribe({
          next: (response: any) => {
            this.cdr.detectChanges();
            let reportLocalData: any = JSON.parse(
              JSON.stringify(localStorage.getItem('reports'))
            );
            reportLocalData = JSON.parse(reportLocalData);
            if (Array.isArray(reportLocalData)) {
              let filterCurrentUserData = reportLocalData.filter(
                (x: any) => x.phone === this.accountNumber
              );
              response.data.date =
                moment(
                  this.dateRangePickerForm.getRawValue()?.start_date
                ).format('DD MMM YY') +
                ' - ' +
                moment(this.dateRangePickerForm.getRawValue()?.end_date).format(
                  'DD MMM YY'
                );
              if (filterCurrentUserData.length > 0) {
                filterCurrentUserData[0].reports.push(response.data);
                reportLocalData = [
                  ...reportLocalData.filter(
                    (x: any) => x.phone !== this.accountNumber
                  ),
                  ...filterCurrentUserData,
                ];
                localStorage.setItem(
                  'reports',
                  JSON.stringify(reportLocalData)
                );
              } else {
                reportLocalData.push({
                  phone: this.accountNumber,
                  reports: [response.data],
                });
                localStorage.setItem(
                  'reports',
                  JSON.stringify(reportLocalData)
                );
              }
              this.cdr.detectChanges();
            } else {
              localStorage.setItem(
                'reports',
                JSON.stringify([
                  {
                    phone: this.accountNumber,
                    reports: [response.data],
                  },
                ])
              );
            }
            this.cdr.detectChanges();
            // this.loading = false;
            this.snackBar.open(this.languageData.report_generated_successfully, this.languageData.close, {
              duration: 2000,
            });
            this.dateRangePickerForm.reset();
            this.matChipArray = [];
            this.allSelected = false;
            this.getReportList();
          },
          error: (error: any) => {
            localStorage.setItem('authToken', authToken);
            this.dateRangePickerForm.reset();
            this.matChipArray = [];
            this.loading = false;
            let errorMessage = this.commonService.errorMessageTranslate(
              error?.error?.error?.message
            );
            this.commonService.openErrorDialog(' ', errorMessage);
            this.cdr.detectChanges();
          },
        });
    } else {
      console.log('please fill the form');
    }
  }

  downloadReport(data: any) {
    this.loading = true;
    this.cdr.detectChanges();
    const authToken: any = localStorage.getItem('authToken');
    localStorage.removeItem('authToken');
    this.commonService
      .downloadReport(
        this.accessToken,
        data.filename ? data.filename : data.fileName,
        this.accountNumber
      )
      .subscribe({
        next: (res: any) => {
          const blob = new Blob([res.body], {
            type: 'application/json',
          });
          this.cdr.detectChanges();
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = data.filename ? data.filename : data.fileName;
          downloadLink.click();
          this.loading = false;
        },
        error: (error: any) => {
          localStorage.setItem('authToken', authToken);
          this.dateRangePickerForm.reset();
          this.matChipArray = [];
          this.loading = false;
          this.commonService.openErrorDialog(
            '',
            this.languageData.file_not_available
          );
          this.cdr.detectChanges();
        },
        complete: () => {
          this.loading = false;
          localStorage.setItem('authToken', authToken);
          this.cdr.detectChanges();
        },
      });
  }
}
