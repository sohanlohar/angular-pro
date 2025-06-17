import { Injectable } from '@angular/core';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class ExcelReaderService {
  constructor(private commonService: CommonService) {}

  _validation_common(element: any) {
    /** SENDER */

    const senderName = element['Sender Name'].replace(/[\n\r]+/g, ' ');
    if (senderName.trim() !== '' && !/^.{3,50}$/.test(senderName.trim())) {
      element.error =
        element?.error + `\r\n ERROR - Sender Name must be min 3, max 50 \r\n`;
    }

    if (
      element['Sender Email'].trim() !== '' &&
      !this.commonService.emailOnly.test(element['Sender Email'].trim())
    ) {
      element.error =
        element?.error + `\r\n ERROR - Sender Email is invalid \r\n`;
    }

    if (
      !isNaN(element['Sender Contact No']) &&
      !/^.{7,15}$/.test(element['Sender Contact No'])
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Sender contact number must be min 7, max 15 \r\n`;
    }

    if (
      !this.commonService.numericWithSpecialCharacters.test(element['Sender Contact No'])
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Sender contact number must be numeric or contains ()+- only \r\n`;
    }

    const senderAdd = element['Sender Address'].replace(/[\n\r]+/g, ' ');
    if (senderAdd.trim() !== '' && !/^.{5,200}$/.test(senderAdd.trim())) {
      element.error =
        element?.error +
        `\r\n ERROR - Sender address must be min 5, max 200 \r\n`;
    }

    if (
      !/^\d{4,10}$/.test(element['Sender Postcode'])
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Sender Postcode must be numeric, min 4, max 10 characters \r\n`;
    }


    /** RECEIVER */

    const receiverName = element['Receiver Name'].replace(/[\n\r]+/g, ' ');
    if (receiverName.trim() !== '' && !/^.{3,50}$/.test(receiverName.trim())) {
      element.error =
        element?.error +
        `\r\n ERROR - Receiver Name must be min 3, max 50 \r\n`;
    }

    if (
      element['Receiver Email'].trim() !== '' &&
      !this.commonService.emailOnly.test(element['Receiver Email'].trim())
    ) {
      element.error =
        element?.error + `\r\n ERROR - Receiver Email is invalid \r\n`;
    }

    // if (isNaN(element['Receiver Contact No'])) {
    //   element.error =
    //     element?.error +
    //     `\r\n ERROR - Receiver contact number must be NUMBER \r\n`;
    // }

    if (
      !isNaN(element['Receiver Contact No']) &&
      !/^.{7,15}$/.test(element['Receiver Contact No'])
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Receiver contact number must be min 7, max 15 \r\n`;
    }

    if (
      !this.commonService.numericWithSpecialCharacters.test(element['Receiver Contact No'])
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Receiver contact number must be numeric or contains ()+- only \r\n`;
    }

    const receiverAdd = element['Receiver Address'].replace(/[\n\r]+/g, ' ');
    if (receiverAdd.trim() !== '' && !/^.{5,200}$/.test(receiverAdd.trim())) {
      element.error =
        element?.error +
        `\r\n ERROR - Receiver address must be min 5, max 200 \r\n`;
    }

    if (
      element['Receiver Postcode'] !== '' &&
      !/^.{3,10}$/.test(element['Receiver Postcode'])
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Receiver Postcode must be min 3, max 10 \r\n`;
    }

    /** SHIPMENT */

    if(this.commonService.isCODUbat.getValue() === false && this.commonService.isMelPlus.getValue() === false) {
      if (isNaN(element['Insurance (MYR)'])) {
        element.error =
          element?.error + `\r\n ERROR - Sum Insured must be NUMBER \r\n`;
      }
    }
  }

  _validation_non_cod(element: any) {
    if (isNaN(element['Item Weight (kg)'])) {
      element.error =
        element?.error + `\r\n ERROR - Item weight must be NUMBER \r\n`;
    }

    if (
      !isNaN(element['Item Weight (kg)']) &&
      !(parseFloat(element['Item Weight (kg)']) > 0)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Item weight cannot be ZERO \r\n`;
    }

    if (isNaN(element['Item Width (cm)'])) {
      element.error =
        element?.error + `\r\n ERROR - Item width must be NUMBER \r\n`;
    }

    if (
      !isNaN(element['Item Width (cm)']) &&
      !(parseFloat(element['Item Width (cm)']) > 0)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Item width cannot be ZERO \r\n`;
    }

    if (isNaN(element['Item Length (cm)'])) {
      element.error =
        element?.error + `\r\n ERROR - Item length must be NUMBER \r\n`;
    }

    if (
      !isNaN(element['Item Length (cm)']) &&
      !(parseFloat(element['Item Length (cm)']) > 0)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Item length cannot be ZERO \r\n`;
    }

    if (isNaN(element['Item Height (cm)'])) {
      element.error =
        element?.error + `\r\n ERROR - Height must be NUMBER \r\n`;
    }

    if (
      !isNaN(element['Item Height (cm)']) &&
      !(parseFloat(element['Item Height (cm)']) > 0)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Item Height cannot be ZERO \r\n`;
    }

    if (
      element['Item Description'] !== '' &&
      !/^.{5,100}$/.test(element['Item Description'])
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Item Description must be min 5, max 100 \r\n`;
    }
  }

  _validation_melplus(element: any) {
    if (isNaN(element['Item Weight (kg)'])) {
      element.error =
        element?.error + `\r\n ERROR - Item weight must be NUMBER \r\n`;
    }

    if (
      !isNaN(element['Item Weight (kg)']) &&
      !(parseFloat(element['Item Weight (kg)']) > 0)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Item weight cannot be ZERO \r\n`;
    }

    if (
      !isNaN(element['Item Weight (kg)']) &&
      (parseFloat(element['Item Weight (kg)']) > 30)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Weight exceeds limit of 30.0 kg \r\n`;
    }

    if (isNaN(element['Item Width (cm)'])) {
      element.error =
        element?.error + `\r\n ERROR - Item width must be NUMBER \r\n`;
    }

    if (
      !isNaN(element['Item Width (cm)']) &&
      !(parseFloat(element['Item Width (cm)']) > 0)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Item width cannot be ZERO \r\n`;
    }

    if (
      !isNaN(element['Item Width (cm)']) &&
      (parseFloat(element['Item Width (cm)']) > 25)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Width exceeds 25cm \r\n`;
    }

    if (isNaN(element['Item Length (cm)'])) {
      element.error =
        element?.error + `\r\n ERROR - Item length must be NUMBER \r\n`;
    }

    if (
      !isNaN(element['Item Length (cm)']) &&
      !(parseFloat(element['Item Length (cm)']) > 0)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Item length cannot be ZERO \r\n`;
    }

    if (
      !isNaN(element['Item Length (cm)']) &&
      (parseFloat(element['Item Length (cm)']) > 35)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Length exceeds 35cm \r\n`;
    }

    if (isNaN(element['Item Height (cm)'])) {
      element.error =
        element?.error + `\r\n ERROR - Height must be NUMBER \r\n`;
    }

    if (
      !isNaN(element['Item Height (cm)']) &&
      !(parseFloat(element['Item Height (cm)']) > 0)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Item Height cannot be ZERO \r\n`;
    }

    if (
      !isNaN(element['Item Height (cm)']) &&
      (parseFloat(element['Item Height (cm)']) > 5)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Height exceeds 5cm \r\n`;
    }

    if (
      element['Item Description'] !== '' &&
      !/^.{5,100}$/.test(element['Item Description'])
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Item Description must be min 5, max 100 \r\n`;
    }
  }

  _validation_mps(element: any) {
    if (isNaN(element['Total Pieces'])) {
      element.error =
        element?.error + `\r\n ERROR - Total Pieces must be NUMBER \r\n`;
    }

    if (isNaN(element['Total Pieces']) &&
    (parseFloat(element['Total Pieces']) < 2)) {
      element.error =
        element?.error + `\r\n ERROR - Total Pieces min 2 \r\n`;
    }

    if (isNaN(element['Total Pieces']) &&
    (parseFloat(element['Total Pieces']) > 20)) {
      element.error =
        element?.error + `\r\n ERROR - Total Pieces max 20 \r\n`;
    }

    if (isNaN(element['Total Weight (kg)'])) {
      element.error =
        element?.error + `\r\n ERROR - Total Weight must be NUMBER \r\n`;
    }

    if (
      !isNaN(element['Total Weight (kg)']) &&
      !(parseFloat(element['Total Weight (kg)']) >= 0.1)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Total Weight cannot be ZERO \r\n`;
    }

    if (isNaN(element['Item Width (cm)'])  && element['IItem Width (cm)'] !== null) {
      element.error =
        element?.error + `\r\n ERROR - Item width must be NUMBER \r\n`;
    }

    if (isNaN(element['Item Length (cm)']) && element['Item Length (cm)'] !== null) {
      element.error =
        element?.error + `\r\n ERROR - Item length must be NUMBER \r\n`;
    }


    if (isNaN(element['Item Height (cm)']) && element['Item Height (cm)'] !== null) {
      element.error =
        element?.error + `\r\n ERROR - Height must be NUMBER \r\n`;
    }

    if (
      element['Item Description'] !== '' &&
      !/^.{5,100}$/.test(element['Item Description'])
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Item Description must be min 5, max 100 \r\n`;
    }

    if (
      !/^.{0,50}$/.test(element['Sender Ref No'])
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Sender Ref No max 50 \r\n`;
    }
  }

  _validation_contact(element: any){
    if (!isNaN(element['Receiver Name']) && element['Receiver Name']) {
      element.error =
        element?.error + `\r\n ERROR - Recipient name cannot contain number \r\n`;
    }
    if (!isNaN(element['Company'])) {
      element.error =
        element?.error + `\r\n ERROR - Company must be entered \r\n`;
    }
    if (element['Email'].trim() !== '' &&
      !this.commonService.emailOnly.test(element['Email'].trim())
    ) {
      element.error =
        element?.error + `\r\n ERROR - Email is invalid \r\n`;
    }
  }

  _validation_intl(element: any) {
    /** Receiver */

    if (
      element['Receiver Country'].trim() !== '' &&
      !/^\w{2}$/.test(element['Receiver Country'].trim())
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Receiver country must be in 2 Letter, eg. MY \r\n`;
    }

    if (
      element['Receiver Country'].trim() === 'SY'
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Selected receiver country is suspended temporarily \r\n`;
    }

    if (
      element['Receiver State'].trim() !== '' &&
      !/^.{3,50}$/.test(element['Receiver State'].trim())
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Receiver state must be min 3, max 50 \r\n`;
    }

    if (
      element['Receiver City'].trim() !== '' &&
      !/^.{3,50}$/.test(element['Receiver City'].trim())
    ) {
      element.error =
        element?.error +
        `\r\n ERROR - Receiver city must be min 3, max 50 \r\n`;
    }

    /** Shipment */

    if (isNaN(parseFloat(element['Parcel Weight (kg)']))) {
      element.error =
        element?.error + `\r\n ERROR - Parcel weight must be NUMBER \r\n`;
    }

    if (
      !isNaN(element['Parcel Weight (kg)']) &&
      !(parseFloat(element['Parcel Weight (kg)']) > 0)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Parcel weight cannot be ZERO \r\n`;
    }

    if (isNaN(element['Parcel Width (cm)'])) {
      element.error =
        element?.error + `\r\n ERROR - Parcel width must be NUMBER \r\n`;
    }

    if (
      !isNaN(element['Parcel Width (cm)']) &&
      !(parseFloat(element['Parcel Width (cm)']) > 0)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Parcel width cannot be ZERO \r\n`;
    }

    if (isNaN(element['Parcel Length (cm)'])) {
      element.error =
        element?.error + `\r\n ERROR - Parcel length must be NUMBER \r\n`;
    }

    if (
      !isNaN(element['Parcel Length (cm)']) &&
      !(parseFloat(element['Parcel Length (cm)']) > 0)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Parcel length cannot be ZERO \r\n`;
    }

    if (isNaN(element['Parcel Height (cm)'])) {
      element.error =
        element?.error + `\r\n ERROR - Parcel Height must be NUMBER \r\n`;
    }

    if (
      !isNaN(element['Parcel Height (cm)']) &&
      !(parseFloat(element['Parcel Height (cm)']) > 0)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Parcel Height cannot be ZERO \r\n`;
    }
  }

  _validation_ubat(element: any) {
    if (
      !isNaN(element['Item Weight (kg)']) &&
      (parseFloat(element['Item Weight (kg)']) > 2)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Weight exceeds limit of 2.0 kg \r\n`;
    }
    if (
      !isNaN(element['Item Width (cm)']) &&
      (parseFloat(element['Item Width (cm)']) > 26)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Width exceeds limit of 26.0 cm \r\n`;
    }
    if (
      !isNaN(element['Item Length (cm)']) &&
      (parseFloat(element['Item Length (cm)']) > 33)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Length exceeds limit of 33.0 cm \r\n`;
    }
    if (
      !isNaN(element['Item Height (cm)']) &&
      (parseFloat(element['Item Height (cm)']) > 10)
    ) {
      element.error =
        element?.error + `\r\n ERROR - Height exceeds limit of 10.0 cm \r\n`;
    }
  }

  setErrorStyle(ws: any) {
    for (const i in ws) {
      if (ws[i]['v'] != undefined) {
        if (ws[i]['v'].toString().includes('ERROR')) {
          ws['!cols'] = [
            {
              wch: 20,
              wpx: 250,
            },
          ];
          ws[i].s = {
            alignment: {
              wrapText: true,
            },
            font: {
              name: 'Calibri',
              sz: 11,
              bold: false,
              color: { rgb: 'FFFFFF' },
            },
            fill: {
              patternType: 'solid',
              fgColor: { rgb: 'E16348' },
            },
          };
        }
      }
    }
  }

  commonData(key: any) {
    return (
      key === 'Sender Name' ||
      key === 'Sender Email' ||
      key === 'Sender Contact No' ||
      key === 'Sender Address' ||
      key === 'Sender Postcode' ||
      key === 'Receiver Name' ||
      key === 'Receiver Contact No' ||
      key === 'Receiver Address' ||
      key === 'Receiver Postcode' ||
      key === 'Item Description'
    );
  }


  alterData(key: any) {
    return (
      key === 'Category' ||
      key === 'Item Weight (kg)' ||
      key === 'Item Width (cm)' ||
      key === 'Item Length (cm)' ||
      key === 'Item Height (cm)'
    );
  }

  onlyMPS(key: any){
    return (
      key === 'Total Pieces' ||
      key === 'Total Weight (kg)'
    )
  }

  intlData(key: any) {
    return (
      key === 'Receiver Country' ||
      key === 'Parcel Width (cm)' ||
      key === 'Parcel Length (cm)' ||
      key === 'Parcel Height (cm)' ||
      key === 'Parcel Weight (kg)' ||
      key === 'Product Category' ||
      key === 'Product Name' ||
      key === 'Category Details' ||
      key === 'No of Item' ||
      key === 'Weight per Item (kg)' ||
      key === 'HS Code per Item' ||
      key === 'Qty per Item' ||
      key === 'Value per Item (MYR)' ||
      key === 'Origin Country'
    );
  }

  contactData(key:any){
    return(
      key === 'Receiver Name' ||
      key === 'Company' ||
      key === 'Mobile Number' ||
      key === 'Address' ||
      key === 'Country' ||
      key === 'Postcode' ||
      key === 'State' ||
      key === 'City'
    );
  }

  checkDOM() {
    return [
      'Sender Name',
      'Sender Email',
      'Sender Contact No',
      'Sender Address',
      'Sender Postcode',
      'Receiver Name',
      'Receiver Email',
      'Receiver Contact No',
      'Receiver Address',
      'Receiver Postcode',
      'Item Description',
      'Category',
      'Item Weight (kg)',
      'Item Width (cm)',
      'Item Length (cm)',
      'Item Height (cm)',
      'Parcel Notes',
      'Sender Ref No',
      'Insurance (MYR)',
    ];
  }

  checkCODDOM() {
    return [
      'Sender Name',
      'Sender Email',
      'Sender Contact No',
      'Sender Address',
      'Sender Postcode',
      'Receiver Name',
      'Receiver Email',
      'Receiver Contact No',
      'Receiver Address',
      'Receiver Postcode',
      'Item Description',
      'Category',
      'Item Weight (kg)',
      'Item Width (cm)',
      'Item Length (cm)',
      'Item Height (cm)',
      'Parcel Notes',
      'Sender Ref No',
      'Insurance (MYR)',
      'COD Amount',
    ];
  }

  checkUbat() {
    return [
      'Sender Name',
      'Sender Email',
      'Sender Contact No',
      'Sender Address',
      'Sender Postcode',
      'Receiver Name',
      'Receiver Email',
      'Receiver Contact No',
      'Receiver Address',
      'Receiver Postcode',
      'Item Description',
      'Item Weight (kg)',
      'Item Width (cm)',
      'Item Length (cm)',
      'Item Height (cm)',
      'Parcel Notes',
      'Sender Ref No'
    ];
  }

  checkMelPlus() {
    return [
      'Sender Name',
      'Sender Email',
      'Sender Contact No',
      'Sender Address',
      'Sender Postcode',
      'Receiver Name',
      'Receiver Email',
      'Receiver Contact No',
      'Receiver Address',
      'Receiver Postcode',
      'Item Description',
      'Item Weight (kg)',
      'Item Width (cm)',
      'Item Length (cm)',
      'Item Height (cm)',
      'Parcel Notes',
      'Sender Ref No'
    ];
  }

  checkMelPlusCOD() {
    return [
      'Sender Name',
      'Sender Email',
      'Sender Contact No',
      'Sender Address',
      'Sender Postcode',
      'Receiver Name',
      'Receiver Email',
      'Receiver Contact No',
      'Receiver Address',
      'Receiver Postcode',
      'Item Description',
      'Item Weight (kg)',
      'Item Width (cm)',
      'Item Length (cm)',
      'Item Height (cm)',
      'Parcel Notes',
      'Sender Ref No',
      'MelPlus COD (RM)'
    ];
  }

  checkMps() {
    return [
      'Sender Name',
      'Sender Email',
      'Sender Contact No',
      'Sender Address',
      'Sender Postcode',
      'Receiver Name',
      'Receiver Email',
      'Receiver Contact No',
      'Receiver Address',
      'Receiver Postcode',
      'Total Pieces',
      'Total Weight (kg)',
      'Total Weight (kg)',
      'Item Length (cm)',
      'Item Height (cm)',
      'Item Description',
      'Sender Ref No',
      'Insurance (MYR)'
    ];
  }

  checkContact(){
    return [
      'Receiver Name',
      'Company',
      'Email',
      'Mobile Number',
      'Address',
      'Country',
      'Postcode',
      'State',
      'City'
    ]
  }

  checkINTL() {
    return [
      'Receiver Country',
      'Receiver State',
      'Receiver City',
      'Parcel Width (cm)',
      'Parcel Length (cm)',
      'Parcel Height (cm)',
      'Parcel Weight (kg)',
      'Product Category',
      'Product Name',
      'Category Details',
      'No of Item',
      'Weight per Item (kg)',
      'HS Code per Item',
      'Qty per Item',
      'Value per Item (MYR)',
      'Parcel Notes',
      'Insurance (MYR)',
      'Origin Country',
      'Sender Name',
      'Sender Email',
      'Sender Contact No',
      'Sender Address',
      'Sender Postcode',
      'Receiver Name',
      'Receiver Email',
      'Receiver Contact No',
      'Receiver Address',
      'Receiver Postcode',
      'Item Description',
    ];
  }
}
