import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PageLayoutModule } from '@pos/ezisend/shared/ui/page-layout';
import { EzisendShipmentUiMyShipmentTableModule } from '@pos/ezisend/shipment/ui/my-shipment-table';
import { EzisendShipmentUiSearchInputModule } from '@pos/ezisend/shipment/ui/search-input';
import { EzisendShipmentUiDateRangePickerModule } from '@pos/ezisend/shipment/ui/date-range-picker';
import { MyShipmentComponent } from './my-shipment.component';
import { DeliveredComponent } from './pages/delivered/delivered.component';
import { FailDeliverComponent } from './pages/fail-deliver/fail-deliver.component';
import { LiveShipmentsComponent } from './pages/live-shipments/live-shipments.component';
import { PendingPickupComponent } from './pages/pending-pickup/pending-pickup.component';
import { RequestForPickupComponent } from './pages/request-for-pickup/request-for-pickup.component';
import { ReturnedComponent } from './pages/returned/returned.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { EzisendShipmentUiDropdownInputModule } from '@pos/ezisend/shipment/ui/dropdown-input';
import { EzisendSharedUiDialogsPickupDialogModule } from '@pos/ezisend/shared/ui/dialogs/pickup-dialog';
import { AddOrderComponent } from './pages/add-order/add-order.component';
import { PickupDetailsComponent } from './pages/pickup-details/pickup-details.component';
import { OrderDetailsComponent } from './pages/order-details/order-details.component';
import { EzisendSharedUiLoadingSpinnerModule } from '@pos/ezisend/shared/ui/loading-spinner';
import { EzisendSharedUiDialogsViewGuideDialogModule } from '@pos/ezisend/shared/ui/dialogs/view-guide-dialog';
import { FormControlWrapperModule } from '@pos/ezisend/shared/ui/forms/form-control-wrapper';
import { MpsDetailsComponent } from './pages/mps-details/mps-details.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatCardModule} from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@NgModule({
  imports: [
    CommonModule,
    PageLayoutModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    EzisendShipmentUiMyShipmentTableModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatDialogModule,
    MatSelectModule,
    EzisendSharedUiLoadingSpinnerModule,
    EzisendShipmentUiDateRangePickerModule,
    EzisendShipmentUiSearchInputModule,
    EzisendShipmentUiDropdownInputModule,
    EzisendSharedUiDialogsPickupDialogModule,
    EzisendSharedUiDialogsViewGuideDialogModule,
    MatProgressSpinnerModule,
    FormControlWrapperModule,
    MatButtonToggleModule,
    MatStepperModule,
    MatButtonModule,
    MatExpansionModule,
    MatCardModule,
    MatProgressBarModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: MyShipmentComponent },
      { path: 'add-order', pathMatch: 'full', component: AddOrderComponent },
      { path: 'order-details/:id', pathMatch: 'full', component: OrderDetailsComponent },
      { path: 'mps-details/:id', pathMatch: 'full', component: MpsDetailsComponent },
      { path: 'parcel-details/:id', pathMatch: 'full', component: PickupDetailsComponent },
    ]),
  ],
  declarations: [
    MyShipmentComponent,
    RequestForPickupComponent,
    PendingPickupComponent,
    LiveShipmentsComponent,
    DeliveredComponent,
    FailDeliverComponent,
    ReturnedComponent,
    AddOrderComponent,
    PickupDetailsComponent,
    OrderDetailsComponent,
    MpsDetailsComponent,
  ],
  exports: [
    MyShipmentComponent,
    RequestForPickupComponent,
    PendingPickupComponent,
    LiveShipmentsComponent,
    DeliveredComponent,
    FailDeliverComponent,
    ReturnedComponent,
    AddOrderComponent,
    PickupDetailsComponent,
    OrderDetailsComponent,
  ],
})
export class EzisendShipmentFeatureMyShipmentModule {}
