import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, EMPTY, Observable, of, Subject } from 'rxjs';
import { environment } from '@pos/shared/environments';
import { map, tap } from 'rxjs/operators';
import { RateCard, RateCardResponse, RateCalculatorData, ZoneResponse } from './rate-card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { bm } from '../../../../assets/my';
import { en } from '../../../../assets/en';
import { TranslationService } from '../../../../shared-services/translate.service';
@Injectable({
    providedIn: 'root',
})
export class RateCalculatorService {
    private clock: Observable<any> | undefined;
    private _loading = new BehaviorSubject<boolean>(false);
    _tabName = new BehaviorSubject<string>('');
    private rateCardDetails: RateCard[] = [];
    public readonly loading$ = this._loading.asObservable();
    notifier = new Subject();
    /* Default Country */
    private isCountryMY: BehaviorSubject<any> = new BehaviorSubject(false);
    _selectedTab = {
        index: 0
    };
    getHSC$!: Observable<any>;
    countryList$!: Observable<any>;
    getCurrentIsCountryMY$ = this.isCountryMY.asObservable();
    /* URLs */
    flagAPI = environment.flagAPI;
    MDMAPI = environment.MDMAPI;
    SPPAPI = environment.sppUatUrl;
    currentZone: number | null = null;
    private activeTab: BehaviorSubject<string> = new BehaviorSubject<string>('rateCard');

    isSubmitted: boolean = false;
    
    languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.rate_calulator :
    (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.rate_calulator :
        en.data.rate_calulator;
        
    constructor(
        private http: HttpClient,
        private router: Router,
        private snackBar: MatSnackBar, 
        private translate: TranslationService
    ) {
        this.translate.buttonClick$.subscribe(() => {
            if (localStorage.getItem("language") == "en") {
              this.languageData = en.data.rate_calulator;
            }
            else if (localStorage.getItem("language") == "my") {
              this.languageData = bm.data.rate_calulator
            }
        })
     }
    // New method to get zone information
    getZone(originPostcode: string, destinationPostcode: string): Observable<ZoneResponse> {
        const url = `${this.SPPAPI}shipments/v1/get-zone?origin_postcode=${originPostcode}&destination_postcode=${destinationPostcode}`;
        return this.http.get<ZoneResponse>(url);
    }
    fetchRateCards(): Observable<RateCard[]> {
        return this.http.get<RateCardResponse>(`${this.SPPAPI}rate-card//v1/query`)
            .pipe(
                map(response => response.data.rate_cards)
            );
    }
    /// Post 
    // calculate the shipping cost
    calculateShippingCost(zone: number, weight: number): Observable<number> {
        return this.fetchRateCards().pipe(
            map(rateCards => {
                const rateCard = rateCards.find(card => card.zone === zone);
                if (!rateCard) {
                    throw new Error(this.languageData.no_rate_card_found_for_zone+ ' ' +zone + '.');
                }
                const { first_weight, first_price, additional_weight, additional_price } = rateCard;
                if (weight <= first_weight) {
                    return first_price;
                } else {
                    const extraWeight = weight - first_weight;
                    const extraUnits = Math.ceil(extraWeight / additional_weight);
                    return first_price + (extraUnits * additional_price);
                }
            }),
            catchError(error => {
                let errorMessage = this.languageData.error_calculating_shipping_cost;
                if (error && error.error && error.error.message) {
                    errorMessage = error.error.message;
                }
                this.snackBar.open(errorMessage, this.languageData.close, {
                    duration: 5000,
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    panelClass: ['snack-bar-error'],
                });
                return EMPTY;
            })
        );
    }
    postRateCalculator(data: RateCalculatorData): Observable<any> {
        const postUrl = `${this.SPPAPI}rate-card/v1/save`;
        return this.http.post<any>(postUrl, data).pipe(
            tap(() => {
                this.isSubmitted = false;
                this.snackBar.open(this.languageData.your_rate_card_has_been_configured, this.languageData.close, {
                    duration: 3000,
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    panelClass: ['snack-bar-success'],
                  });
                  this.setActiveTab('shipment');
            }),
            catchError(error => {
                this.isSubmitted = false;
                const errorMessage = this.languageData.your_rate_card_is_not_configured;
                this.snackBar.open(errorMessage, this.languageData.close, {
                    duration: 5000,
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    panelClass: ['snack-bar-error'],
                });
                return EMPTY;
            })
        );
    }
    /// Post Ends 
    getRateCalculatorData(): Observable<RateCardResponse> {
        const getUrl = `${environment.sppUatUrl}rate-card/v1/query`;
        return this.http.get<RateCardResponse>(getUrl).pipe(
            map(response => response)
        );
    }
    setActiveTab(tabName: string): void {
        this.activeTab.next(tabName);
    }
    getActiveTab(): Observable<string> {
        return this.activeTab.asObservable();
    }
}
