/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {
    LangChangeEvent,
    TranslateService
} from '@ngx-translate/core';
import {Subscription} from 'rxjs';

@Component({
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, OnDestroy {

    private _currentLanguage: string;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._setCurrentLanguage();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    private _setCurrentLanguage(): void {
        this._currentLanguage = this._translateService.defaultLang;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(this._translateService.onDefaultLangChange
            .subscribe((event: LangChangeEvent) => {
                this._currentLanguage = event.lang;
            }));
    }

    private _unsetSubscriptions() {
        this._disposableSubscriptions.unsubscribe();
    }
}
