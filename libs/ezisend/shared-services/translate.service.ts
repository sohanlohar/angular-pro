import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
// import { TranslateService } from '@ngx-translate/core'
@Injectable({
    providedIn: 'root',
})
export class TranslationService {
    // constructor(private translate: TranslateService) { }
    private buttonClickSource = new Subject<void>();

    buttonClick$ = this.buttonClickSource.asObservable();

    emitButtonClick() {
        this.buttonClickSource.next();
    }
}
