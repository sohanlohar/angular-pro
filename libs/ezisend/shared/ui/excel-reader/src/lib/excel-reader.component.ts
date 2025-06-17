/* eslint-disable no-control-regex */
import {
  ChangeDetectionStrategy,
  Component,
  ChangeDetectorRef,
  OnDestroy,
  ViewEncapsulation,
  Input
} from '@angular/core';
import { DialogComponent } from '@pos/ezisend/shared/ui/dialogs/dialog';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import * as XLSX from 'xlsx-js-style';
import { CommonService, ExcelReaderService } from '@pos/ezisend/shared/data-access/services';
import { ModalDialogComponent } from '@pos/ezisend/shared/ui/dialogs/modal-dialog';
import { BehaviorSubject, Subject, Subscription, take, takeUntil } from 'rxjs';
import { ContactService } from '@pos/ezisend/contact/data-access/services';
import { bm } from '../../../../../assets/my';
import { en } from '../../../../../assets/en';
import { TranslationService } from '../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-excel-reader',
  templateUrl: './excel-reader.component.html',
  styleUrls: ['./excel-reader.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
})
export class ExcelReaderComponent implements OnDestroy {
  @Input() BU_type: any;
  data!: any;
  // isASCIIArr:any = [];
  bool_arr:boolean[] = [];
  customs_arr:any = [];
  shipmentDOM:any = {
    shipments:[]
  };

  shipmentDOMCOD:any = {
    shipments:[]
  };

  shipmentINTL:any = {
    shipments:[]
  };

  bulkContact:any = {
    contacts : []
  }
  isHovering = false;
  isLoading = false;
  getSheet = new BehaviorSubject('');
  private subscription: Subscription | undefined;
  protected _onDestroy = new Subject<void>();
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.bulkShipment :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.bulkShipment :
    en.data.bulkShipment;

  isMelPlusCod:any;
  constructor(
    public dialog: MatDialog,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private excelReaderService: ExcelReaderService,
    private _contactService: ContactService,
    private translate: TranslationService
  ) {
    this.commonService.getIsMelplusCod$.subscribe(res=>{
      this.isMelPlusCod = res;
    })
    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.bulkShipment
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.bulkShipment
      }
    })
  }

  //FIND MATCH
  findMatch = (a: any, b: any) =>
  a.reduce(
    (acc: any, c: any) => {
      acc.total_match = a.filter((x: any) => b.includes(x)).length;
      acc.not_match = a.filter((x: any) => !b.includes(x));
      return acc;
    },
    { total_match: 0 }
  );

  OnUploadClick(){
    let buType = '';
    if(this.BU_type === 'dom'){
      buType = 'Domestic';
    }
    else if(this.BU_type === 'bulk'){
      buType = 'International';
    }
    else if(this.BU_type === 'melplus'){
      buType = 'MelPlus';
    }
    else if(this.BU_type === 'mps'){
      buType = 'MPS';
    }

    this.commonService.googleEventPush({
      "event": "shipment_upload_file",
      "event_category": "SendParcel Pro - Bulk Shipments - "+buType,
      "event_action": "Upload File Success",
      "event_label": "Success"
    });
  }

  CreateShipmentFailure(){
    let buType = '';
    if(this.BU_type === 'dom'){
      buType = 'Domestic';
    }
    else if(this.BU_type === 'bulk'){
      buType = 'International';
    }
    else if(this.BU_type === 'melplus'){
      buType = 'MelPlus';
    }
    else if(this.BU_type === 'mps'){
      buType = 'MPS';
    }

    this.commonService.googleEventPush({
      "event": "shipment_create_failure",
      "event_category": "SendParcel Pro - Bulk Shipments - "+buType,
      "event_action": "Create Shipment Failure",
      "event_label": "Shipment Failure - Upload Error"
    });

  }
  shipmentCreateSuccess(){
    let buType = '';
    if(this.BU_type === 'dom'){
      buType = 'Domestic';
    }
    else if(this.BU_type === 'bulk'){
      buType = 'International';
    }
    else if(this.BU_type === 'melplus'){
      buType = 'MelPlus';
    }
    else if(this.BU_type === 'mps'){
      buType = 'MPS';
    }
    const eventDetails = {
      "event": "shipment_create_success",
      "event_category": "SendParcel Pro - Bulk Shipments - "+buType,
      "event_action": "Upload File Success",
      "event_label": "Success"
    };
    this.commonService.googleEventPush(eventDetails)
  }

  fileUpload(event: any) {
    const bulkShipment = {
          event: 'create_shipment',
          event_category: 'SendParcel Pro - Bulk Shipment',
          event_action: 'Create Shipment Bulk Upload',
          event_label: 'My Shipments',
        };
        this.commonService.googleEventPush(bulkShipment);
    const selectedFile = event.target?.files[0] || event.file;
    if (!selectedFile.name.endsWith('.xls') && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xlsm')) {
      this.CreateShipmentFailure();
      this.dialog.open(DialogComponent, {
        data: {
          title: this.languageData.found_error_in_upload,
          descriptions: this.languageData.require_templete_contact_excel,
          icon: 'warning',
          confirmEvent: false,
        },
      });
      return ;
    }
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    fileReader.onload = (event) => {
      const binaryData = event.target?.result;
      const workbook = XLSX.read(binaryData, { type: 'binary' });
      this.shipmentDOM.shipments = [];
      this.shipmentDOMCOD.shipments = [];
      this.shipmentINTL.shipments = [];
      this.bulkContact.contacts = [];
        workbook.SheetNames.forEach((sheet) => {
          this.getSheet.next(sheet);
          this.data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
            defval: '',
            blankrows: false,
          });

          /** Domestic Non COD COD and Non COD Domestic and COD Ubat */
          if(this.commonService._selectedTab?.index === 0 || this.commonService._selectedTab?.index === 1) {
            /** COD and Non CODUbat */
            if (this.commonService.isCOD.getValue() && !this.commonService.isCODUbat.getValue()) {
              if (workbook.SheetNames[0] === 'COD Domestic' && this.BU_type == 'dom') {
                const keys = Object.keys(this.data[0]);
                if ((
                  this.findMatch(this.excelReaderService.checkCODDOM(), keys)
                    .not_match.length !== 0
                )||(this.BU_type !=="dom")) {
                  this.dialog.open(DialogComponent, {
                    data: {
                      title: this.languageData.Uh_oh,
                      descriptions: this.languageData.templete_outdated,
                      icon: 'warning',
                      confirmEvent: false,
                    },
                  });
                } else {
                  this.data = this.data.map((item: any, index: any) => {
                    let senderName = item['Sender Name'].toString();
                    senderName = senderName.replace(/[\n\r]+/g, ' ');
                    let senderAddress = item['Sender Address'].toString();
                    senderAddress = senderAddress.replace(/[\n\r]+/g, ' ');
                    let receiverName = item['Receiver Name'].toString();
                    receiverName = receiverName.replace(/[\n\r]+/g, ' ');
                    let receiverEmail = item['Receiver Email']?.toString();
                    receiverEmail = receiverEmail?.toLowerCase();
                    let receiverAddress = item['Receiver Address'].toString();
                    receiverAddress = receiverAddress.replace(/[\n\r]+/g, ' ');
                    let itemDescription = item['Item Description'].toString();
                    itemDescription = itemDescription.replace(/[\n\r]+/g, ' ');
                    let parcelNotes = item['Parcel Notes'].toString();
                    parcelNotes = parcelNotes.replace(/[\n\r]+/g, ' ');
                    let senderRefNo = item['Sender Ref No']?.toString();
                    senderRefNo = senderRefNo?.trim();
                    let senderEmail = item['Sender Email']?.toString();
                    senderEmail = senderEmail?.toLowerCase();
                    let senderPostCode = item['Sender Postcode']?.toString();
                    senderPostCode = senderPostCode?.trim();
                    const receiverPostCode = item['Receiver Postcode']?.toString();
                    this.shipmentDOMCOD.shipments.push({
                      id: index + 1,
                      sender: {
                        name: senderName?.trim(),
                        email: senderEmail?.trim(),
                        contact_number: item['Sender Contact No']
                          ?.toString()
                          ?.trim(),
                        address: senderAddress.trim(),
                        postcode: senderPostCode,
                      },
                      recipient: {
                        name: receiverName.trim(),
                        dialing_code: '',
                        contact_number: item['Receiver Contact No']
                          ?.toString()
                          ?.trim(),
                        email: receiverEmail?.trim(),
                        address: receiverAddress.trim(),
                        postcode: receiverPostCode?.trim(),
                      },
                      shipment: {
                        category: item['Category'],
                        description: itemDescription.trim(),
                        width: item['Item Width (cm)']
                          ? parseFloat(
                              parseFloat(item['Item Width (cm)']).toFixed(2)
                            )
                          : 0,
                        length: item['Item Length (cm)']
                          ? parseFloat(
                              parseFloat(item['Item Length (cm)']).toFixed(2)
                            )
                          : 0,
                        height: item['Item Height (cm)']
                          ? parseFloat(
                              parseFloat(item['Item Height (cm)']).toFixed(2)
                            )
                          : 0,
                        weight: item['Item Weight (kg)']
                          ? parseFloat(
                              parseFloat(item['Item Weight (kg)']).toFixed(2)
                            )
                          : 0,
                        cod_amount: item['COD Amount']
                          ? parseFloat(parseFloat(item['COD Amount']).toFixed(2))
                          : 0,
                        notes: parcelNotes?.trim(),
                        sender_ref: senderRefNo?.toString(),
                        sum_insured: item['Insurance (MYR)']
                          ? parseFloat(
                              parseFloat(item['Insurance (MYR)']).toFixed(2)
                            )
                          : 0,
                      },
                    });
                    return {
                      uid: index + 1,
                      'Sender Name': senderName.trim(),
                      'Sender Email': senderEmail?.toLowerCase()?.trim(),
                      'Sender Contact No': item['Sender Contact No']
                        ?.toString()
                        ?.trim(),
                      'Sender Address': senderAddress.trim(),
                      'Sender Postcode': senderPostCode,
                      'Receiver Name': receiverName?.trim(),
                      'Receiver Email': receiverEmail?.toLowerCase()?.trim(),
                      'Receiver Contact No': item['Receiver Contact No']
                        ?.toString()
                        ?.trim(),
                      'Receiver Address': receiverAddress?.trim(),
                      'Receiver Postcode': receiverPostCode?.trim(),
                      'Item Weight (kg)': item['Item Weight (kg)'],
                      'Item Width (cm)': item['Item Width (cm)'],
                      'Item Length (cm)': item['Item Length (cm)'],
                      'Item Height (cm)': item['Item Height (cm)'],
                      Category: item['Category'],
                      'Item Description': itemDescription?.trim(),
                      'Parcel Notes': parcelNotes?.trim(),
                      'COD Amount': item['COD Amount'],
                      'Sender Ref No': senderRefNo,
                      'Insurance (MYR)': item['Insurance (MYR)'],
                    };
                  });
                  this.data.forEach((element: any) => {
                    const parcelNotes = element['Parcel Notes'].replace(
                      /[\n\r]+/g,
                      ' '
                    );
                    const senderRefNo = element['Sender Ref No']
                      ?.toString()
                      ?.trim();
                    element.error = '';
                    for (const key in element) {
                      if (this.validate_dom_item(key)) {
                        if (key !== undefined && element[key] !== undefined) {
                          if (element[key] === '') {
                            element.error =
                              element?.error +
                              `\r\n ERROR - ${key} cannot be empty \r\n`;
                          }

                          if(key === 'Category'){
                            if(this.commonService._selectedTab?.index === 0 &&
                              (element['Category']?.toLowerCase() !== 'parcel' && element['Category']?.toLowerCase() !== 'document'))
                            {
                              element.error =
                                element?.error +
                                `\r\n ERROR - Please select a valid category \r\n`;
                            }
                          }

                        }
                      }
                    }
                    this.excelReaderService._validation_common(element);
                    this.excelReaderService._validation_non_cod(element);
                    if (isNaN(element['COD Amount'])) {
                      element.error =
                        element?.error +
                        `\r\n ERROR - COD Amount must be NUMBER \r\n`;
                    }
                    if (typeof element['Category'] != 'string') {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Please select a valid category \r\n`;
                    }
                    if (!/^.{0,50}$/.test(senderRefNo)) {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Sender Ref No should not exceed more than 50 chars \r\n`;
                    }
                    if (!/^.{0,200}$/.test(parcelNotes?.toString()?.trim())) {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Parcel Notes should not exceed more than 200 chars \r\n`;
                    }
                  });
                  this.data = this.data.map((item: any, index: any) => {
                    return {
                      error: item['ERROR'],
                      ...item,
                    };
                  });
                  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
                  this.excelReaderService.setErrorStyle(ws);
                  if (this.data.filter((data: any) => data?.error).length) {
                    this.errorDialog(ws, 'COD Domestic');
                  } else {
                    this.commonService.isLoading(true);
                    this.subscription = this.commonService
                      .submitData(
                        'shipments',
                        'upload-domesticcod',
                        this.shipmentDOMCOD
                      )
                      .subscribe({
                        next: () => {
                          this.openSuccessDialog();
                          this.commonService.isLoading(false);
                        },
                        error: (data) => {
                          this.commonService.isLoading(false);

                          if (data?.error?.error?.data) {
                            // this.CreateShipmentFailure();
                            this.errorDialog(
                              ws,
                              'COD Domestic',
                              data?.error?.error?.data.message
                                ? data?.error?.error?.data.message
                                : data?.error?.error?.data.errors
                            );
                          } else {
                            this.commonService.openErrorDialog(
                              this.languageData.Uh_oh,
                              this.languageData.error_while_upload,
                              'Ok'
                            );
                          }
                        },
                      });
                  }
                }
              }
            }

            /** NonCOD and NonCODUbat */
            if(!this.commonService.isCOD.getValue() && !this.commonService.isCODUbat.getValue()) {
              if (workbook.SheetNames[0] === 'Domestic' && this.BU_type == 'dom') {
                const keys = Object.keys(this.data[0]);
                if (
                  this.findMatch(this.excelReaderService.checkDOM(), keys).not_match
                    .length !== 0
                ) {
                  this.dialog.open(DialogComponent, {
                    data: {
                      title: this.languageData.Uh_oh,
                      descriptions: this.languageData.templete_outdated,
                      icon: 'warning',
                      confirmEvent: false,
                    },
                  });
                } else {
                  this.data = this.data.map((item: any, index: any) => {
                    let senderName = item['Sender Name'].toString();
                    senderName = senderName.replace(/[\n\r]+/g, ' ');
                    let senderAddress = item['Sender Address'].toString();
                    senderAddress = senderAddress.replace(/[\n\r]+/g, ' ');
                    let receiverName = item['Receiver Name'].toString();
                    receiverName = receiverName.replace(/[\n\r]+/g, ' ');
                    let receiverEmail = item['Receiver Email']?.toString();
                    receiverEmail = receiverEmail?.toLowerCase();
                    let receiverAddress = item['Receiver Address'].toString();
                    receiverAddress = receiverAddress.replace(/[\n\r]+/g, ' ');
                    let itemDescription = item['Item Description'].toString();
                    itemDescription = itemDescription.replace(/[\n\r]+/g, ' ');
                    let parcelNotes = item['Parcel Notes'].toString();
                    parcelNotes = parcelNotes.replace(/[\n\r]+/g, ' ');
                    let senderRefNo = item['Sender Ref No']?.toString();
                    senderRefNo = senderRefNo?.trim();
                    let senderEmail = item['Sender Email']?.toString();
                    senderEmail = senderEmail?.toLowerCase();
                    let senderPostCode = item['Sender Postcode']?.toString();
                    senderPostCode = senderPostCode?.trim();
                    const receiverPostCode = item['Receiver Postcode']?.toString();
                    /** Payload data for Domestic */
                    this.shipmentDOM.shipments.push({
                      id: index + 1,
                      sender: {
                        name: senderName?.trim(),
                        email: senderEmail?.trim(),
                        contact_number: item['Sender Contact No']
                          ?.toString()
                          ?.trim(),
                        address: senderAddress.trim(),
                        postcode: senderPostCode,
                      },
                      recipient: {
                        name: receiverName?.trim(),
                        dialing_code: '',
                        contact_number: item['Receiver Contact No']
                          ?.toString()
                          ?.trim(),
                        email: receiverEmail?.trim(),
                        address: receiverAddress?.trim(),
                        postcode: receiverPostCode?.trim(),
                      },
                      shipment: {
                        category: item['Category'],
                        description: itemDescription?.trim(),
                        width: item['Item Width (cm)']
                          ? parseFloat(
                              parseFloat(item['Item Width (cm)']).toFixed(2)
                            )
                          : 0,
                        length: item['Item Length (cm)']
                          ? parseFloat(
                              parseFloat(item['Item Length (cm)']).toFixed(2)
                            )
                          : 0,
                        height: item['Item Height (cm)']
                          ? parseFloat(
                              parseFloat(item['Item Height (cm)']).toFixed(2)
                            )
                          : 0,
                        weight: item['Item Weight (kg)']
                          ? parseFloat(
                              parseFloat(item['Item Weight (kg)']).toFixed(2)
                            )
                          : 0,
                        notes: parcelNotes?.trim(),
                        sender_ref: senderRefNo?.toString(),
                        sum_insured: item['Insurance (MYR)']
                          ? parseFloat(
                              parseFloat(item['Insurance (MYR)']).toFixed(2)
                            )
                          : 0,
                      },
                    });
                    /** For EXCEL if error occurs */
                    return {
                      uid: index + 1,
                      'Sender Name': senderName.trim(),
                      'Sender Email': senderEmail?.toLowerCase()?.trim(),
                      'Sender Contact No': item['Sender Contact No']
                        ?.toString()
                        ?.trim(),
                      'Sender Address': senderAddress.trim(),
                      'Sender Postcode': senderPostCode,
                      'Receiver Name': receiverName?.trim(),
                      'Receiver Email': receiverEmail?.toLowerCase()?.trim(),
                      'Receiver Contact No': item['Receiver Contact No']
                        ?.toString()
                        ?.trim(),
                      'Receiver Address': receiverAddress?.trim(),
                      'Receiver Postcode': receiverPostCode?.trim(),
                      'Item Weight (kg)': item['Item Weight (kg)'],
                      'Item Width (cm)': item['Item Width (cm)'],
                      'Item Length (cm)': item['Item Length (cm)'],
                      'Item Height (cm)': item['Item Height (cm)'],
                      Category: item['Category'],
                      'Item Description': itemDescription?.trim(),
                      'Parcel Notes': parcelNotes?.trim(),
                      'Sender Ref No': senderRefNo,
                      'Insurance (MYR)': item['Insurance (MYR)'],
                    };
                  });
                  this.data.forEach((element: any) => {
                    let parcelNotes = element['Parcel Notes'].toString();
                    parcelNotes = parcelNotes.replace(/[\n\r]+/g, ' ');

                    let senderRefNo = element['Sender Ref No']?.toString();
                    senderRefNo = senderRefNo.replace(/[\n\r]+/g, ' ');
                    element.error = '';
                    for (const key in element) {
                      if (this.validate_dom_item(key)) {
                        if (key !== undefined && element[key] !== undefined) {
                          if (element[key] === '') {
                            element.error =
                              element?.error +
                              `\r\n ERROR - ${key} cannot be empty \r\n`;
                          }
                        }
                      }

                    }
                    this.excelReaderService._validation_common(element);
                    this.excelReaderService._validation_non_cod(element);
                    if (!/^.[0-9]\d*$/.test(element['Receiver Postcode'])) {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Receiver Postcode must be NUMBER \r\n`;
                    }
                    if (!/^.{0,50}$/.test(senderRefNo?.trim())) {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Sender Ref No should not exceed more than 50 chars \r\n`;
                    }
                    if (!/^.{0,200}$/.test(parcelNotes?.trim())) {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Parcel Notes should not exceed more than 200 chars \r\n`;
                    }
                    if (typeof element['Category'] != 'string') {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Please select a valid category \r\n`;
                    }
                  });
                  this.data = this.data.map((item: any, index: any) => {
                    return {
                      error: item['ERROR'],
                      ...item,
                    };
                  });
                  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
                  this.excelReaderService.setErrorStyle(ws);
                  if (this.data.filter((data: any) => data?.error).length) {
                    this.errorDialog(ws, 'Domestic');
                  } else {
                    this.commonService.isLoading(true);
                    this.subscription = this.commonService
                      .submitData('shipments', 'upload-domestic', this.shipmentDOM)
                      .subscribe({
                        next: () => {
                          this.commonService.isLoading(false);
                          this.openSuccessDialog();
                        },
                        error: (data) => {
                          this.commonService.isLoading(false);
                          if (data?.error?.error?.data) {
                            this.errorDialog(
                              ws,
                              'Domestic',
                              data?.error?.error?.data.message
                                ? data?.error?.error?.data.message
                                : data?.error?.error?.data.errors
                            );
                          } else {
                            this.commonService.openErrorDialog(
                              this.languageData.Uh_oh,
                              this.languageData.error_while_upload,
                              'Ok'
                            );
                          }
                        },
                      });
                  }
                }
              }
            }

            /** CODUbat and NonCOD */
            if(this.commonService.isCODUbat.getValue() && !this.commonService.isCOD.getValue()) {
              if (workbook.SheetNames[0] === 'COD Ubat') {
                const keys = Object.keys(this.data[0]);
                if (
                  this.findMatch(this.excelReaderService.checkUbat(), keys).not_match
                    .length !== 0
                ) {
                  this.dialog.open(DialogComponent, {
                    data: {
                      title: this.languageData.Uh_oh,
                      descriptions: this.languageData.templete_outdated,
                      icon: 'warning',
                      confirmEvent: false,
                    },
                  });
                } else {
                  this.data = this.data.map((item: any, index: any) => {
                    let senderName = item['Sender Name'].toString();
                    senderName = senderName.replace(/[\n\r]+/g, ' ');
                    let senderAddress = item['Sender Address'].toString();
                    senderAddress = senderAddress.replace(/[\n\r]+/g, ' ');
                    let receiverName = item['Receiver Name'].toString();
                    receiverName = receiverName.replace(/[\n\r]+/g, ' ');
                    let receiverEmail = item['Receiver Email']?.toString();
                    receiverEmail = receiverEmail?.toLowerCase();
                    let receiverAddress = item['Receiver Address'].toString();
                    receiverAddress = receiverAddress.replace(/[\n\r]+/g, ' ');
                    let itemDescription = item['Item Description'].toString();
                    itemDescription = itemDescription.replace(/[\n\r]+/g, ' ');
                    let parcelNotes = item['Parcel Notes'].toString();
                    parcelNotes = parcelNotes.replace(/[\n\r]+/g, ' ');
                    let senderRefNo = item['Sender Ref No']?.toString();
                    senderRefNo = senderRefNo?.trim();
                    let senderEmail = item['Sender Email']?.toString();
                    senderEmail = senderEmail?.toLowerCase();
                    let senderPostCode = item['Sender Postcode']?.toString();
                    senderPostCode = senderPostCode?.trim();
                    const receiverPostCode = item['Receiver Postcode']?.toString();

                    /** Payload data for Domestic */
                    this.shipmentDOM.shipments.push({
                      id: index + 1,
                      sender: {
                        name: senderName?.trim(),
                        email: senderEmail?.trim(),
                        contact_number: item['Sender Contact No']
                          ?.toString()
                          ?.trim(),
                        address: senderAddress.trim(),
                        postcode: senderPostCode,
                      },
                      recipient: {
                        name: receiverName?.trim(),
                        dialing_code: '',
                        contact_number: item['Receiver Contact No']
                          ?.toString()
                          ?.trim(),
                        email: receiverEmail?.trim(),
                        address: receiverAddress?.trim(),
                        postcode: receiverPostCode?.trim(),
                      },
                      shipment: {
                        category: 'Ubat',
                        description: itemDescription?.trim(),
                        width: item['Item Width (cm)']
                          ? parseFloat(
                              parseFloat(item['Item Width (cm)']).toFixed(2)
                            )
                          : 0,
                        length: item['Item Length (cm)']
                          ? parseFloat(
                              parseFloat(item['Item Length (cm)']).toFixed(2)
                            )
                          : 0,
                        height: item['Item Height (cm)']
                          ? parseFloat(
                              parseFloat(item['Item Height (cm)']).toFixed(2)
                            )
                          : 0,
                        weight: item['Item Weight (kg)']
                          ? parseFloat(
                              parseFloat(item['Item Weight (kg)']).toFixed(2)
                            )
                          : 0,
                        notes: parcelNotes?.trim(),
                        sender_ref: senderRefNo?.toString()
                      },
                    });
                    /** For EXCEL if error occurs */
                    return {
                      uid: index + 1,
                      'Sender Name': senderName.trim(),
                      'Sender Email': senderEmail?.toLowerCase()?.trim(),
                      'Sender Contact No': item['Sender Contact No']
                        ?.toString()
                        ?.trim(),
                      'Sender Address': senderAddress.trim(),
                      'Sender Postcode': senderPostCode,

                      'Receiver Name': receiverName?.trim(),
                      'Receiver Email': receiverEmail?.toLowerCase()?.trim(),
                      'Receiver Contact No': item['Receiver Contact No']
                        ?.toString()
                        ?.trim(),
                      'Receiver Address': receiverAddress?.trim(),
                      'Receiver Postcode': receiverPostCode?.trim(),

                      'Item Weight (kg)': item['Item Weight (kg)'],
                      'Item Width (cm)': item['Item Width (cm)'],
                      'Item Length (cm)': item['Item Length (cm)'],
                      'Item Height (cm)': item['Item Height (cm)'],
                      Category: 'Ubat',
                      'Item Description': itemDescription?.trim(),
                      'Parcel Notes': parcelNotes?.trim(),
                      'Sender Ref No': senderRefNo
                    };
                  });
                  this.data.forEach((element: any) => {
                    let parcelNotes = element['Parcel Notes'].toString();
                    parcelNotes = parcelNotes.replace(/[\n\r]+/g, ' ');
                    let senderRefNo = element['Sender Ref No']?.toString();
                    senderRefNo = senderRefNo.replace(/[\n\r]+/g, ' ');
                    element.error = '';
                    for (const key in element) {
                      if (this.validate_dom_item(key)) {
                        if (key !== undefined && element[key] !== undefined) {
                          if (element[key] === '') {
                            element.error =
                              element?.error +
                              `\r\n ERROR - ${key} cannot be empty \r\n`;
                          }
                        }
                      }
                    }
                    this.excelReaderService._validation_common(element);
                    this.excelReaderService._validation_non_cod(element);
                    this.excelReaderService._validation_ubat(element);
                    if (!/^.[0-9]\d*$/.test(element['Receiver Postcode'])) {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Receiver Postcode must be NUMBER \r\n`;
                    }
                    if (!/^.{0,50}$/.test(senderRefNo?.trim())) {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Sender Ref No should not exceed more than 50 chars \r\n`;
                    }
                    if (!/^.{0,200}$/.test(parcelNotes?.trim())) {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Parcel Notes should not exceed more than 200 chars \r\n`;
                    }
                  });
                  this.data = this.data.map((item: any, index: any) => {
                    return {
                      error: item['ERROR'],
                      ...item,
                    };
                  });
                  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
                  this.excelReaderService.setErrorStyle(ws);
                  if (this.data.filter((data: any) => data?.error).length) {
                    this.errorDialog(ws, 'COD Ubat');
                  } else {
                    this.commonService.isLoading(true);
                    this.subscription = this.commonService
                      .submitData('shipments', 'upload-codubat', this.shipmentDOM)
                      .subscribe({
                        next: () => {
                          this.commonService.isLoading(false);
                          this.openSuccessDialog();
                        },
                        error: (data) => {
                          this.commonService.isLoading(false);
                          if (data?.error?.error?.data) {
                            this.errorDialog(
                              ws,
                              'COD Ubat',
                              data?.error?.error?.data.message
                                ? data?.error?.error?.data.message
                                : data?.error?.error?.data.errors
                            );
                          } else {
                            this.commonService.openErrorDialog(
                              this.languageData.Uh_oh,
                              this.languageData.error_while_upload,
                              'Ok'
                            );
                          }
                        },
                      });
                  }
                }
              }
            }

            if (workbook.SheetNames[0] === 'International' && !this.commonService.isCODUbat.getValue() && this.BU_type == 'bulk' && this.commonService._selectedTab?.index === 1) {
              const keys = Object.keys(this.data[0]);
              if ((
                this.findMatch(this.excelReaderService.checkINTL(), keys).not_match
                  .length !== 0
              ) ||(this.BU_type !=="bulk")) {
                this.dialog.open(DialogComponent, {
                  data: {
                    title: this.languageData.Uh_oh,
                    descriptions: this.languageData.templete_outdated,
                    icon: 'warning',
                    confirmEvent: false,
                  },
                });
              } else {
                this.data = this.data.map((item: any, index: any) => {
                  let senderName = item['Sender Name'].toString();
                  senderName = senderName.replace(/[\n\r]+/g, ' ');
                  let senderAddress = item['Sender Address'].toString();
                  senderAddress = senderAddress.replace(/[\n\r]+/g, ' ');
                  let receiverName = item['Receiver Name'].toString();
                  receiverName = receiverName.replace(/[\n\r]+/g, ' ');
                  let receiverEmail = item['Receiver Email']?.toString();
                  receiverEmail = receiverEmail?.toLowerCase();
                  let receiverAddress = item['Receiver Address'].toString();
                  receiverAddress = receiverAddress.replace(/[\n\r]+/g, ' ');
                  let parcelNotes = item['Parcel Notes'].toString();
                  parcelNotes = parcelNotes.replace(/[\n\r]+/g, ' ');
                  let senderEmail = item['Sender Email']?.toString();
                  senderEmail = senderEmail?.toLowerCase();
                  let senderPostCode = item['Sender Postcode']?.toString();
                  senderPostCode = senderPostCode?.trim();
                  const receiverPostCode = item['Receiver Postcode']?.toString();
                  let senderRefNo = item['Sender Ref No']?.toString();
                  senderRefNo = senderRefNo?.trim();

                  this.shipmentINTL.shipments.push({
                    id: index + 1,
                    sender: {
                      name: senderName.trim(),
                      email: senderEmail?.trim(),
                      contact_number: item['Sender Contact No']?.toString()?.trim(),
                      address: senderAddress?.trim(),
                      postcode: senderPostCode,
                    },
                    recipient: {
                      name: receiverName?.trim(),
                      dialing_code: '',
                      contact_number: item['Receiver Contact No']
                        ?.toString()
                        ?.trim(),
                      email: receiverEmail?.trim(),
                      address: receiverAddress?.trim(),
                      postcode: receiverPostCode?.trim(),
                      city: item['Receiver City']?.toString(),
                      state: item['Receiver State']?.toString(),
                      country: item['Receiver Country']?.toString(),
                    },
                    shipment: {
                      product: item['Product Name'],
                      category: item['Product Category'],
                      category_details: item['Category Details'],
                      width: parseFloat(
                        parseFloat(item['Parcel Width (cm)']).toFixed(2)
                      ),
                      length: parseFloat(
                        parseFloat(item['Parcel Length (cm)']).toFixed(2)
                      ),
                      height: parseFloat(
                        parseFloat(item['Parcel Height (cm)']).toFixed(2)
                      ),
                      weight: parseFloat(
                        parseFloat(item['Parcel Weight (kg)']).toFixed(2)
                      ),
                      importref: item["Importer's Ref No"]?.toString(),
                      sender_ref: senderRefNo?.toString(),
                      notes: parcelNotes?.trim(),
                      import_country: item['Receiver Country']?.toString(),
                      sum_insured: item['Insurance (MYR)']
                        ? parseFloat(parseFloat(item['Insurance (MYR)']).toFixed(2))
                        : 0,
                      customs_declarations: [],
                    },
                  });

                  if (item['No of Item']) {
                    this.customs_arr = [];
                    this.bool_arr = [];
                    const no_of_items = item['No of Item'];
                    const _item_description = item['Item Description']
                      ?.toString()
                      .split(',');
                    const _weight = item['Weight per Item (kg)']
                      ?.toString()
                      .split(',');
                    const _hscode = item['HS Code per Item']?.toString().split(',');
                    const _quantity = item['Qty per Item']?.toString().split(',');
                    const _value = item['Value per Item (MYR)']
                      ?.toString()
                      .split(',');
                    const _origin_country = item['Origin Country']
                      ?.toString()
                      .split(',');

                    this.customs_arr.push(
                      _item_description,
                      _weight,
                      _hscode,
                      _quantity,
                      _value,
                      _origin_country
                    );

                    this.customs_arr.forEach((data: any) => {
                      if (data !== undefined) {
                        if (data.length === no_of_items) {
                          this.bool_arr.push(true);
                        } else {
                          this.bool_arr.push(false);
                        }
                      } else {
                        this.isLoading = false;
                        this.cdr.detectChanges();
                        this.commonService.openErrorDialog(
                          this.languageData.Uh_oh,
                          this.languageData.error_not_as_per_templete,
                          'Ok'
                        );
                      }
                    });

                    if (this.allAreTrue(this.bool_arr)) {
                      for (let j = 0; j < no_of_items; j++) {
                        this.shipmentINTL.shipments[
                          index
                        ].shipment.customs_declarations.push({
                          item_description: _item_description[j]
                            ? _item_description[j].trim()
                            : _item_description[j],
                          item_category: _item_description[j]
                            ? _item_description[j].trim()
                            : _item_description[j],
                          weight: _weight[j]
                            ? parseFloat(parseFloat(_weight[j].trim()).toFixed(2))
                            : _weight[j],
                          hscode: _hscode[j] ? _hscode[j].trim() : _hscode[j],
                          quantity: _quantity[j]
                            ? parseFloat(parseFloat(_quantity[j].trim()).toFixed(2))
                            : _quantity[j],
                          value: _value[j]
                            ? parseFloat(parseFloat(_value[j].trim()).toFixed(2))
                            : _value[j],
                          country_origin: _origin_country[j]
                            ? _origin_country[j].trim()
                            : _origin_country[j],
                        });
                      }
                    }
                  }

                  return {
                    uid: index + 1,
                    'Sender Name': senderName?.trim(),
                    'Sender Email': senderEmail?.toLowerCase()?.trim(),
                    'Sender Contact No': item['Sender Contact No']
                      ?.toString()
                      ?.trim(),
                    'Sender Address': item['Sender Address']?.toString()?.trim(),
                    'Sender Postcode': item['Sender Postcode']?.toString()?.trim(),
                    'Receiver Name': receiverName?.trim(),
                    'Receiver Email': receiverEmail?.toLowerCase()?.trim(),
                    'Receiver Contact No': item['Receiver Contact No']
                      ?.toString()
                      ?.trim(),
                    'Receiver Address': item['Receiver Address']
                      ?.toString()
                      ?.trim(),
                    'Receiver Postcode': item['Receiver Postcode']
                      ?.toString()
                      ?.trim(),
                    'Receiver State': item['Receiver State']?.toString()?.trim(),
                    'Receiver City': item['Receiver City']?.toString()?.trim(),
                    'Receiver Country': item['Receiver Country']
                      ?.toString()
                      ?.trim(),
                    'Parcel Width (cm)': item['Parcel Width (cm)'],
                    'Parcel Weight (kg)': item['Parcel Weight (kg)'],
                    'Parcel Length (cm)': item['Parcel Length (cm)'],
                    'Parcel Height (cm)': item['Parcel Height (cm)'],
                    'Insurance (MYR)': item['Insurance (MYR)'],
                    'Product Category': item['Product Category'],
                    'Product Name': item['Product Name'],
                    'Category Details': item['Category Details'],
                    'Item Description': item['Item Description']?.toString(),
                    'Weight per Item (kg)': item['Weight per Item (kg)'],
                    'No of Item': item['No of Item'],
                    'HS Code per Item': item['HS Code per Item'],
                    'Qty per Item': item['Qty per Item'],
                    'Value per Item (MYR)': item['Value per Item (MYR)'],
                    'Origin Country': item['Origin Country'],
                    'Parcel Notes': parcelNotes?.trim(),
                    'Sender Ref No': item['Sender Ref No']?.toString(),
                    "Importer's Ref No": item["Importer's Ref No"]?.toString(),
                  };
                });
                this.data.forEach((element: any) => {
                  let parcelNotes = element['Parcel Notes'].toString();
                  parcelNotes = parcelNotes.replace(/[\n\r]+/g, ' ');
                  element.error = '';
                  for (const key in element) {
                    if (this.validate_intl_item(key)) {
                      if (key !== undefined && element[key] !== undefined) {
                        if (element[key] === '') {
                          element.error =
                            element?.error +
                            `\r\n ERROR - ${key} cannot be empty \r\n`;
                        }
                      }
                    }
                  }
                  this.excelReaderService._validation_common(element);
                  this.excelReaderService._validation_intl(element);
                  if (!/^.{0,200}$/.test(parcelNotes?.trim())) {
                    element.error =
                      element?.error +
                      `\r\n ERROR - Parcel Notes should not exceed more than 200 chars \r\n`;
                  }
                  if (typeof element['Product Name'] != 'string') {
                    element.error =
                      element?.error +
                      `\r\n ERROR - Please select a valid product name \r\n`;
                  }
                  if (typeof element['Product Category'] != 'string') {
                    element.error =
                      element?.error +
                      `\r\n ERROR - Please select a valid product category \r\n`;
                  }
                  if (typeof element['Category Details'] != 'string') {
                    element.error =
                      element?.error +
                      `\r\n ERROR - Please select valid category details \r\n`;
                  }
                });
                this.data = this.data.map((item: any, index: any) => {
                  return {
                    error: item['ERROR'],
                    ...item,
                  };
                });
                const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
                this.excelReaderService.setErrorStyle(ws);
                if (this.data.filter((data: any) => data?.error).length) {
                  this.errorDialog(ws, 'International');
                } else {
                  this.commonService.isLoading(true);
                  this.subscription = this.commonService
                    .submitData(
                      'shipments',
                      'upload-international',
                      this.shipmentINTL
                    )
                    .subscribe({
                      next: () => {
                        this.openSuccessDialog();
                        this.commonService.isLoading(false);
                      },
                      error: (data) => {
                        this.commonService.isLoading(false);
                        if (data?.error?.error?.data) {
                          this.errorDialog(
                            ws,
                            'International',
                            data.messsage ? data.message : data?.error?.error?.data.errors
                          );
                        } else {
                          this.commonService.openErrorDialog(
                            this.languageData.Uh_oh,
                            this.languageData.error_while_upload,
                            'Ok'
                          );
                        }
                      },
                    });
                }
              }
            }
            this.getSheet.
              pipe(
                take(1),
                takeUntil(this._onDestroy)
                ).
              subscribe((data) => {
                this.isLoading = false;
                this.cdr.detectChanges();
                if(this.commonService.isCOD.getValue() && !this.commonService.isCODUbat.getValue()){
                  if(this.commonService._selectedTab?.index === 0){
                    if(data !== 'COD Domestic') {
                      this.CreateShipmentFailure();
                      this.dialog.open(DialogComponent, {
                        data: {
                          title: this.languageData.found_error_in_upload,
                          descriptions: this.languageData.error_domestic_cod_templete,
                          icon: 'warning',
                          confirmEvent: false,
                        },
                      });
                    }
                  }else if(this.commonService._selectedTab?.index === 1){
                    if(data !== 'International'){
                      this.CreateShipmentFailure();
                      this.dialog.open(DialogComponent, {
                        data: {
                          title: this.languageData.found_error_in_upload,
                          descriptions: this.languageData.error_international_templete,
                          icon: 'warning',
                          confirmEvent: false,
                        },
                      });
                    }
                  }
                }else if(!this.commonService.isCOD.getValue() && !this.commonService.isCODUbat.getValue()){
                  if(this.commonService._selectedTab?.index === 0){
                    if(data !== 'Domestic') {
                      this.CreateShipmentFailure();
                      this.dialog.open(DialogComponent, {
                        data: {
                          title: this.languageData.found_error_in_upload,
                          descriptions: this.languageData.error_domestic_noncod_templete,
                          icon: 'warning',
                          confirmEvent: false,
                        },
                      });
                    }
                  }else if(this.commonService._selectedTab?.index === 1){
                    if(data !== 'International'){
                      this.CreateShipmentFailure();
                      this.dialog.open(DialogComponent, {
                        data: {
                          title: this.languageData.found_error_in_upload,
                          descriptions: this.languageData.error_international_templete,
                          icon: 'warning',
                          confirmEvent: false,
                        },
                      });
                    }
                  }
                }else if(this.commonService.isCODUbat.getValue() && !this.commonService.isCOD.getValue()){
                  if(data !== 'COD Ubat') {
                    this.CreateShipmentFailure();
                    this.dialog.open(DialogComponent, {
                      data: {
                        title: this.languageData.found_error_in_upload,
                        descriptions: this.languageData.error_domestic_templete,
                        icon: 'warning',
                        confirmEvent: false,
                      },
                    });
                  }
                }
              })
          }

          if(this.commonService._selectedTab?.index === 2) { /* MelPlus Alone */
            if(this.commonService.isMelPlus.getValue()) {
              if (workbook.SheetNames[0] === 'MelPlus') {
                const keys = Object.keys(this.data[0]);
                if (this.isMelPlusCod ?
                  this.findMatch(this.excelReaderService.checkMelPlusCOD(), keys).not_match
                    .length !== 0 :
                  this.findMatch(this.excelReaderService.checkMelPlus(), keys).not_match
                    .length !== 0
                ) {
                  this.dialog.open(DialogComponent, {
                    data: {
                      title: this.languageData.Uh_oh,
                      descriptions: this.languageData.templete_outdated,
                      icon: 'warning',
                      confirmEvent: false,
                    },
                  });
                } else {
                  this.data = this.data.map((item: any, index: any) => {
                    let senderName = item['Sender Name'].toString();
                    senderName = senderName.replace(/[\n\r]+/g, ' ');
                    let senderAddress = item['Sender Address'].toString();
                    senderAddress = senderAddress.replace(/[\n\r]+/g, ' ');
                    let receiverName = item['Receiver Name'].toString();
                    receiverName = receiverName.replace(/[\n\r]+/g, ' ');
                    let receiverEmail = item['Receiver Email']?.toString();
                    receiverEmail = receiverEmail?.toLowerCase();
                    let receiverAddress = item['Receiver Address'].toString();
                    receiverAddress = receiverAddress.replace(/[\n\r]+/g, ' ');
                    let itemDescription = item['Item Description'].toString();
                    itemDescription = itemDescription.replace(/[\n\r]+/g, ' ');
                    let parcelNotes = item['Parcel Notes'].toString();
                    parcelNotes = parcelNotes.replace(/[\n\r]+/g, ' ');
                    let senderRefNo = item['Sender Ref No']?.toString();
                    senderRefNo = senderRefNo?.trim();
                    let senderEmail = item['Sender Email']?.toString();
                    senderEmail = senderEmail?.toLowerCase();
                    let senderPostCode = item['Sender Postcode']?.toString();
                    senderPostCode = senderPostCode?.trim();
                    const receiverPostCode = item['Receiver Postcode']?.toString();
                    /** Payload data for Domestic */
                    this.shipmentDOM.shipments.push({
                      id: index + 1,
                      sender: {
                        name: senderName?.trim(),
                        email: senderEmail?.trim(),
                        contact_number: item['Sender Contact No']
                          ?.toString()
                          ?.trim(),
                        address: senderAddress.trim(),
                        postcode: senderPostCode,
                      },
                      recipient: {
                        name: receiverName?.trim(),
                        dialing_code: '',
                        contact_number: item['Receiver Contact No']
                          ?.toString()
                          ?.trim(),
                        email: receiverEmail?.trim(),
                        address: receiverAddress?.trim(),
                        postcode: receiverPostCode?.trim(),
                      },
                      shipment: {
                        category: 'MelPlus',
                        description: itemDescription?.trim(),
                        width: item['Item Width (cm)']
                          ? parseFloat(
                              parseFloat(item['Item Width (cm)']).toFixed(2)
                            )
                          : 0,
                        length: item['Item Length (cm)']
                          ? parseFloat(
                              parseFloat(item['Item Length (cm)']).toFixed(2)
                            )
                          : 0,
                        height: item['Item Height (cm)']
                          ? parseFloat(
                              parseFloat(item['Item Height (cm)']).toFixed(2)
                            )
                          : 0,
                        weight: item['Item Weight (kg)']
                          ? parseFloat(
                              parseFloat(item['Item Weight (kg)']).toFixed(2)
                            )
                          : 0,
                        cod_amount: (this.isMelPlusCod ? item['MelPlus COD (RM)'] : 0)
                          ? parseFloat(parseFloat(item['MelPlus COD (RM)']).toFixed(2))
                          : 0,
                        notes: parcelNotes?.trim(),
                        sender_ref: senderRefNo?.toString()
                      },
                    });
                    /** For EXCEL if error occurs */
                    return {
                      uid: index + 1,
                      'Sender Name': senderName.trim(),
                      'Sender Email': senderEmail?.toLowerCase()?.trim(),
                      'Sender Contact No': item['Sender Contact No']
                        ?.toString()
                        ?.trim(),
                      'Sender Address': senderAddress.trim(),
                      'Sender Postcode': senderPostCode,
                      'Receiver Name': receiverName?.trim(),
                      'Receiver Email': receiverEmail?.toLowerCase()?.trim(),
                      'Receiver Contact No': item['Receiver Contact No']
                        ?.toString()
                        ?.trim(),
                      'Receiver Address': receiverAddress?.trim(),
                      'Receiver Postcode': receiverPostCode?.trim(),
                      'Item Weight (kg)': item['Item Weight (kg)'],
                      'Item Width (cm)': item['Item Width (cm)'],
                      'Item Length (cm)': item['Item Length (cm)'],
                      'Item Height (cm)': item['Item Height (cm)'],
                      Category: 'MelPlus',
                      'Item Description': itemDescription?.trim(),
                      'Parcel Notes': parcelNotes?.trim(),
                      'MelPlus COD (RM)': item['MelPlus COD (RM)'],
                      'Sender Ref No': senderRefNo
                    };
                  });
                  this.data.forEach((element: any) => {
                    let parcelNotes = element['Parcel Notes'].toString();
                    parcelNotes = parcelNotes.replace(/[\n\r]+/g, ' ');

                    let senderRefNo = element['Sender Ref No']?.toString();
                    senderRefNo = senderRefNo.replace(/[\n\r]+/g, ' ');

                    element.error = '';
                    for (const key in element) {
                      if (this.validate_dom_item(key)) {
                        if (key !== undefined && element[key] !== undefined) {
                          if (element[key] === '') {
                            element.error =
                              element?.error +
                              `\r\n ERROR - ${key} cannot be empty \r\n`;
                          }
                        }
                      }

                    }
                    this.excelReaderService._validation_common(element);
                    this.excelReaderService._validation_melplus(element);

                    if(this.isMelPlusCod){
                      const codAmount = element['MelPlus COD (RM)'];

                      if (codAmount && codAmount !== undefined && codAmount !== null) {
                        if (isNaN(codAmount) || typeof codAmount != 'number') {
                          element.error += '\r\n ERROR - MelPlus COD (RM) Amount must be a number \r\n';
                        } else if (codAmount < 1 || codAmount > 500) {
                          element.error += '\r\n ERROR - Enter a min. of RM1 and max. of RM500 of COD amount per MelPlus order. \r\n';
                        } else {
                          element['MelPlus COD (RM)'] = Math.round(codAmount * 100) / 100;
                        }
                      }
                    }

                    if (!/^.{0,50}$/.test(senderRefNo?.trim())) {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Sender Ref No should not exceed more than 50 chars \r\n`;
                    }

                    if (!/^.{0,200}$/.test(parcelNotes?.trim())) {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Parcel Notes should not exceed more than 200 chars \r\n`;
                    }

                    if (typeof element['Category'] != 'string') {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Please select a valid category \r\n`;
                    }
                  });
                  this.data = this.data.map((item: any, index: any) => {
                    return {
                      error: item['ERROR'],
                      ...item,
                    };
                  });
                  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
                  this.excelReaderService.setErrorStyle(ws);
                  if (this.data.filter((data: any) => data?.error).length) {
                    this.errorDialog(ws, 'MelPlus');
                  } else {
                    this.commonService.isLoading(true);
                    let apiName = this.isMelPlusCod ? 'upload-melplus-cod' : 'upload-melplus';
                    this.subscription = this.commonService
                      .submitData('shipments', apiName, this.shipmentDOM)
                      .subscribe({
                        next: () => {
                          this.commonService.isLoading(false);
                          this.openSuccessDialog();
                        },
                        error: (data) => {
                          this.commonService.isLoading(false);
                          if (data?.error?.error?.data) {
                            this.errorDialog(
                              ws,
                              'MelPlus',
                              data?.error?.error?.data.message
                                ? data?.error?.error?.data.message
                                : data?.error?.error?.data.errors
                            );
                          } else {
                            this.commonService.openErrorDialog(
                              this.languageData.Uh_oh,
                              this.languageData.error_while_upload,
                              'Ok'
                            );
                          }
                        },
                      });
                  }
                }
              }
              this.getSheet.
              pipe(
                take(1),
                takeUntil(this._onDestroy)
                ).
              subscribe((data) => {
                this.isLoading = false;
                this.cdr.detectChanges();
                if(this.commonService.isMelPlus.getValue()) {
                    if(data !== 'MelPlus') {
                      this.CreateShipmentFailure();
                      this.dialog.open(DialogComponent, {
                        data: {
                          title: this.languageData.found_error_in_upload,
                          descriptions: this.languageData.error_melplus_templete,
                          icon: 'warning',
                          confirmEvent: false,
                        },
                      });
                    }
                  }
                })
            }
          }


        /* MPS Alone */
          if(this.BU_type === 'mps' && this.commonService.isMPS.getValue()) {
              if (workbook.SheetNames[0] === 'MPS') {
                const keys = Object.keys(this.data[0]);
                if (
                  this.findMatch(this.excelReaderService.checkMps(), keys).not_match
                    .length !== 0
                ) {
                  this.dialog.open(DialogComponent, {
                    data: {
                      title: this.languageData.Uh_oh,
                      descriptions: this.languageData.templete_outdated,
                      icon: 'warning',
                      confirmEvent: false,
                    },
                  });
                } else {
                  this.data = this.data.map((item: any, index: any) => {

                    /** Payload data for mps */
                    this.shipmentDOM.shipments.push({
                      id: index + 1,
                      sender: {
                        name: this.replaceNewlineString(item['Sender Name']),
                        email: this.replaceNewlineString(item['Sender Email']),
                        contact_number: this.trimValueString(item['Sender Contact No']),
                        address: this.replaceNewlineString(item['Sender Address']),
                        postcode: this.trimValueString(item['Sender Postcode']),
                      },
                      recipient: {
                        name: this.replaceNewlineString(item['Receiver Name']),
                        dialing_code: '',
                        contact_number: this.trimValueString(item['Receiver Contact No']),
                        email: this.replaceNewlineString(item['Receiver Email']),
                        address: this.replaceNewlineString(item['Receiver Address']),
                        postcode: this.trimValueString(item['Receiver Postcode']),
                      },
                      shipment: {
                        category: 'MPS',
                        description: this.replaceNewlineString(item['Item Description']),
                        width: this.assignValueNumber(item['Item Width (cm)']),
                        length: this.assignValueNumber(item['Item Length (cm)']),
                        height: this.assignValueNumber(item['Item Height (cm)']),
                        total_weight: this.assignValueNumber(item['Total Weight (kg)']),
                        total_pieces: this.assignValueNumber(item['Total Pieces']),
                        sender_ref: this.trimValueString(item['Sender Ref No']),
                        sum_insured: this.assignValueNumber(item['Insurance (MYR)']),
                      },
                    });

                    /** For EXCEL if error occurs */
                    return {
                      uid: index + 1,
                      'Sender Name': this.replaceNewlineString(item['Sender Name']),
                      'Sender Email': this.replaceNewlineString(item['Sender Email'])?.toLowerCase(),
                      'Sender Contact No': this.trimValueString(item['Sender Contact No']),
                      'Sender Address': this.replaceNewlineString(item['Sender Address']),
                      'Sender Postcode': this.trimValueString(item['Sender Postcode']),
                      'Receiver Name': this.replaceNewlineString(item['Receiver Name']),
                      'Receiver Email': this.replaceNewlineString(item['Receiver Email'])?.toLowerCase(),
                      'Receiver Contact No': this.trimValueString(item['Receiver Contact No']),
                      'Receiver Address': this.replaceNewlineString(item['Receiver Address']),
                      'Receiver Postcode': this.trimValueString(item['Receiver Postcode']),
                      'Total Pieces': item['Total Pieces'],
                      'Total Weight (kg)': item['Total Weight (kg)'],
                      'Item Width (cm)': item['Item Width (cm)'],
                      'Item Length (cm)': item['Item Length (cm)'],
                      'Item Height (cm)': item['Item Height (cm)'],
                      Category: 'MPS',
                      'Item Description': this.replaceNewlineString(item['Item Description']),
                      'Sender Ref No': this.replaceNewlineString(item['Sender Ref No']),
                      'Insurance (MYR)': item['Insurance (MYR)'],
                    };
                  });

                  this.data.forEach((element: any) => {
                    const senderRefNo = this.replaceNewlineString(element['Sender Ref No']) || '';
                    element.error = '';

                    // Check for empty fields
                    Object.keys(element).forEach(key => {
                      if (this.validate_dom_mps_item(key) && element[key] === '') {
                        element.error += `\r\n ERROR - ${key} cannot be empty \r\n`;
                      }
                    });

                    // Perform validations
                    this.excelReaderService._validation_common(element);
                    this.excelReaderService._validation_mps(element);

                    // Check Sender Ref No length
                    if (!/^.{0,50}$/.test(senderRefNo.trim())) {
                      element.error += `\r\n ERROR - Sender Ref No should not exceed more than 50 chars \r\n`;
                    }


                    if (typeof element['Category'] != 'string') {
                      element.error =
                        element?.error +
                        `\r\n ERROR - Please select a valid category \r\n`;
                    }
                  });

                  this.data = this.data.map((item: any, index: any) => {
                    return {
                      error: item['ERROR'],
                      ...item,
                    };
                  });
                  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
                  this.excelReaderService.setErrorStyle(ws);
                  if (this.data.filter((data: any) => data?.error).length) {
                    this.errorDialog(ws, 'MPS');
                  } else {
                    this.commonService.isLoading(true);
                    this.subscription = this.commonService
                      .submitData('shipments', 'upload-mps', this.shipmentDOM)
                      .pipe(
                        takeUntil(this._onDestroy)
                      )
                      .subscribe({
                        next: () => {
                          this.commonService.isLoading(false);
                          this.openSuccessDialog();
                        },
                        error: (data) => {
                          this.commonService.isLoading(false);
                          if (data?.error?.error?.data) {
                            this.errorDialog(
                              ws,
                              'MPS',
                              data?.error?.error?.data.message
                                ? data?.error?.error?.data.message
                                : data?.error?.error?.data.errors
                            );
                          } else {
                            this.commonService.openErrorDialog(
                              this.languageData.Uh_oh,
                              this.languageData.error_while_upload,
                              'Ok'
                            );
                          }
                        },
                      });
                  }
                }
              }
              this.getSheet.
              pipe(
                take(1),
                takeUntil(this._onDestroy)
                ).
              subscribe((data) => {
                this.isLoading = false;
                this.cdr.detectChanges();
                if(this.commonService.isMPS.getValue()) {
                    if(data !== 'MPS') {
                      this.CreateShipmentFailure();
                      this.dialog.open(DialogComponent, {
                        data: {
                          title: this.languageData.found_error_in_upload,
                          descriptions: this.languageData.error_mps_templete,
                          icon: 'warning',
                          confirmEvent: false,
                        },
                      });
                    }
                  }
              })
          }

          //contact bulk upload
          if (this.BU_type === 'bulk-contact' &&(!selectedFile.name.endsWith('.xls') || !selectedFile.name.endsWith('.xlsx') || !selectedFile.name.endsWith('.xlsm'))) {
            const keys = Object.keys(this.data[0]);
            if (
              this.findMatch(this.excelReaderService.checkContact(), keys)
                .not_match.length !== 0
            ) {
              this.getSheet
                .pipe(take(1), takeUntil(this._onDestroy))
                .subscribe((data) => {
                  this.isLoading = false;
                  this.cdr.detectChanges();
                });
              this.dialog.open(DialogComponent, {
                data: {
                  title: this.languageData.Uh_oh,
                  descriptions: this.languageData.templete_outdated,
                  icon: 'warning',
                  confirmEvent: false,
                },
              });
            } else {
              this.data = this.data.map((item: any, index: any) => {
                let receiverName = item['Receiver Name'].toString();
                receiverName = receiverName.replace(/[\n\r]+/g, ' ');
                let company = item['Company'].toString();
                company = company.replace(/[\n\r]+/g, ' ');
                let email = item['Email'].toString();
                email = email.replace(/[\n\r]+/g, ' ');
                let mobileNumber = item['Mobile Number'].toString();
                mobileNumber = mobileNumber.replace(/[\n\r]+/g, ' ');
                let address = item['Address'].toString();
                address = address.replace(/[\n\r]+/g, ' ');
                let postcode = item['Postcode'].toString();
                postcode = postcode.replace(/[\n\r]+/g, ' ');
                let city = item['City']?.toString();
                city = city?.trim();
                let state = item['State']?.toString();
                state = state?.toLowerCase();
                let country = item['Country']?.toString();
                country = country?.trim();

                /** Payload data for Domestic */
                this.bulkContact.contacts.push({
                  id: index + 1,
                  person: receiverName?.trim(),
                  company_name: company?.trim(),
                  email: email,
                  type: 'Recipient',
                  country: country,
                  mobile: mobileNumber,
                  dialing_code: '+60',
                  address: address,
                  postcode: postcode,
                  city: city,
                  state: state,
                });

                /** For EXCEL if error occurs */
                return {
                  uid: index + 1,
                  'Receiver Name': receiverName.trim(),
                  Company: company.trim(),
                  Email: email,
                  'Mobile Number': mobileNumber?.trim(),
                  Address: address?.trim(),
                  Postcode: postcode?.trim(),
                  City: city,
                  State: state,
                  Country: country,
                };
              });
              this.data.forEach((element: any) => {
                element.error = '';
                this.excelReaderService._validation_contact(element);
              });

              this.data = this.data.map((item: any, index: any) => {
                return {
                  error: item['ERROR'],
                  ...item,
                };
              });

              const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
              this.excelReaderService.setErrorStyle(ws);
              if (this.data.filter((data: any) => data?.error).length) {
                this.errorDialog(ws, 'Bulk Contact');
              } else {
                this.commonService.isLoading(true);
                this._contactService
                  .uploadBulkContact('bulk-upload', this.bulkContact)
                  .subscribe({
                    next: () => {
                      this.commonService.isLoading(false);
                      this.isLoading = false;
                      this.dialog.open(DialogComponent, {
                        data: {
                          descriptions: this.languageData.success_added_contact,
                          icon: 'success',
                          confirmEvent: false,
                        },
                      });
                    },
                    error: (data) => {
                      this.commonService.isLoading(false);
                      if (data?.error?.error?.data) {
                        this.errorDialog(
                          ws,
                          'Bulk Contact',
                          data?.error?.error?.data.message
                            ? data?.error?.error?.data.message
                            : data?.error?.error?.data.errors
                        );
                      } else {
                        this.commonService.openErrorDialog(
                          this.languageData.Uh_oh,
                          this.languageData.error_while_upload,
                          'Ok'
                        );
                      }
                    },
                  });
              }

              this.getSheet
                .pipe(take(1), takeUntil(this._onDestroy))
                .subscribe((data) => {
                  this.isLoading = false;

                  this.cdr.detectChanges();
                });
            }
          }

      });
    };

  }

  validate_dom_item(key: any) {
    return this.excelReaderService.commonData(key) || this.excelReaderService.alterData(key);
  }

  validate_dom_mps_item(key: any){
    return this.excelReaderService.commonData(key) || this.excelReaderService.onlyMPS(key);
  }

  validate_contact_item(key: any) {
    return this.excelReaderService.contactData(key) || this.excelReaderService.alterData(key);
  }

  allAreTrue(arr:any) {
    return arr.every((element:any) => element === true);
  }

  validate_intl_item(key:any) {
    return this.excelReaderService.commonData(key) || this.excelReaderService.intlData(key);
  }

  errorDialog(ws:any, status?:any, errordata?: any) {
    const fileName = 'errors_bulk_upload';
    const errorMsg: { id: any; message: string; }[] = [];
    if(errordata && typeof(errordata) !== 'string') {
      errordata.filter((data:any) => {
        for (const hand in data) {
          for (const card in data[hand]) {
              for (const prop in data[hand][card]) {
                for (const err in data[hand][card][prop]) {
                  if(data[hand][card][prop][err].errors) {
                    for(const err1 in (data[hand][card][prop][err].errors)) {
                      for(const err2 in data[hand][card][prop][err].errors[err1].errors) {
                        errorMsg.push({
                          id: data.id,
                          message: `${data[hand][card][prop][err].field} - ${data[hand][card][prop][err].errors[err1].errors[err2].field} - ${data[hand][card][prop][err].errors[err1].errors[err2].message}`
                        });
                      }

                    }
                  } else {
                    errorMsg.push({
                      id: data.id,
                      message: `${Object.keys(data[hand][card])[0]} - ${data[hand][card][prop][err].field} - ${data[hand][card][prop][err].message}`
                    });
                  }

                }


              }
          }
        }
      });
    }

    const wb = XLSX.utils.book_new();
    if(errordata && !errordata[0]?.id) {
      this.dialog.open(DialogComponent, {
        data: {
          title: this.languageData.Uh_oh,
          descriptions: `There seem to be empty fields/errors in the fields.<br/>Please correct the info and reupload the file.`,
          icon: 'warning',
          confirmEvent: false,
        },
      });
    } else {
      errorMsg.forEach((data:any) => {
        const val = 'A'+(data.id+1);
        ws[val]['v'] = ws[val]['v'] + `\r\n ERROR - ${data.message} \r\n`;
      });
    // this.isASCIIArr = [];

    this.excelReaderService.setErrorStyle(ws);
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: this.languageData.found_error_in_upload,
        descriptions: typeof(errordata) === 'string' ? errordata : this.languageData.error_multiple,
        icon: 'warning',
        actionText: this.languageData.download,
        confirmEvent: typeof(errordata) === 'string' ? false : true,
      },
    });

    const dialogSubmitSubscription =
    dialogRef.componentInstance.confirmEvent.subscribe((result) => {
      if (result) {
        XLSX.utils.book_append_sheet(wb, ws, status);
        // XLSX.writeFile(wb, fileName); OLD ONE
        const blob = XLSX.write(wb, { bookSST: true, bookType: 'xlsx', type: 'base64'});
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${blob}`;
        a.setAttribute('download', fileName);
        setTimeout(() => {
          a.click();
        },500);
        document.body.removeChild(a);
      }
      dialogSubmitSubscription.unsubscribe();
      dialogRef.close();
    });
    this.isLoading = false;
    this.cdr.detectChanges();
    }
  this.CreateShipmentFailure();
  }

  /**
  checkASCII(element:any, val:any) {
    if(element[val] && isNaN(element[val])) {
      const regex = new RegExp(/[^\x00-\x7F]+/g);
      const unicodeChars = element[val].match(regex);

      if(unicodeChars && unicodeChars?.length > 0) {
        this.isASCIIArr.push(...unicodeChars);
      };

      return unicodeChars && unicodeChars?.length > 0;
    }
  }
  */

  private trimValueString(value: any): string | undefined{
    const val = value?.toString();
    return val?.trim();
  }

  private replaceNewlineString(value: any): string | undefined {
    const val = value?.toString();
    return val?.replace(/[\n\r]+/g, ' ')?.trim();
  }

  private assignValueNumber(value: any): number{
    return value ? parseFloat(parseFloat(value).toFixed(2)) : 0
  }

  openSuccessDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '400px';
    dialogConfig.maxWidth = '680px';
    this.dialog.open(ModalDialogComponent,  dialogConfig);
    this.isLoading = false;
    this.cdr.detectChanges();
    this.OnUploadClick();
    this.shipmentCreateSuccess();
  }

  dropFile(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.fileUpload({ file: event.dataTransfer.files[0] });
    }
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
