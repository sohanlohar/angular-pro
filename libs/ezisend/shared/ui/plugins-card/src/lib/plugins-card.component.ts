import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '@pos/ezisend/shared/data-access/services';

@Component({
    selector: 'pos-plugins-card',
    templateUrl: './plugins-card.component.html',
    styleUrls:['./plugins-card.component.scss'],
})

export class PluginsCardComponent  {
    constructor(
        private commonService : CommonService
    ) { }

    Logo = './assets/wooCommerce.svg'
    shopifyLogoPath = './assets/shopify2.svg'
    @Input() pluginName = ''
    @Input() pluginDesc = ''
    @Output() selectedPlugin = new EventEmitter<string>();

    @Input() isSelected: boolean = false;
    defaultColor: string = 'white'; // Default background color
    selectedColor: string = '#d6eaff';
    

    onSelect(plugin:any){
        localStorage.setItem('selectedPlugin', plugin)
        this.commonService.selectedPlugin.next(plugin)
        this.selectedPlugin.emit(plugin);
        // this.isSelected = !this.isSelected;
    }
}