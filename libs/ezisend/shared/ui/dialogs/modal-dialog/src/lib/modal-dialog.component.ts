import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ViewEncapsulation,
  Input
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { of } from 'rxjs';
import { bm } from '../../../../../../assets/my';
import { en } from '../../../../../../assets/en';
import { TranslationService } from '../../../../../../shared-services/translate.service';

@Component({
  selector: 'pos-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalDialogComponent implements OnInit{
  @Input() BU_type: any;
  message:any = '';
  messageNote:string = '';
  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.form_data :
  (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.form_data :
    en.data.form_data;
  isreturnOrder: any;

  constructor(
    public dialogRef: MatDialogRef<ModalDialogComponent>,
    private router: Router,
    private matIconRegistry: MatIconRegistry,
    private commonService: CommonService,
    private domSanitizer: DomSanitizer,
    private translate: TranslationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
        this.dialogRef.addPanelClass('dialog-container-custom');
    this.matIconRegistry.addSvgIcon(
      `close_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/close-x.svg`)
    );

    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.form_data
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.form_data
      }
    })
  }

  ngOnInit(): void {
    this.isreturnOrder=this.data?.isreturnorder;
   const state: any = this.router.url;
   of(state).subscribe(data => {
    this.message = data.includes('order-edit') ? 'updated' : 'created';
    this.messageNote = data.includes('order-edit') ? this.languageData.updated : this.languageData.created;
   })
  }

  close() {
    this.dialogRef.close();
    this.commonService.redirectTo('/shipment');
  }

  navTo() {
    let buType: string = '';
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
      event: 'go_to_page',
      event_category: 'SendParcel Pro - Bulk Shipments - ' +buType,
      event_action: 'Go To Page',
      event_label: 'My Shipments - Request For Pick Up',
    });

    if(this.router.url.includes('pending-pickup')){
      this.router.navigate(['/my-shipment'], { queryParams: { t: 'pending-pickup' } });
    }
    else{
      this.router.navigate(['/my-shipment'], { queryParamsHandling: 'preserve' });
    }
    this.dialogRef.close();
  }
  
}
