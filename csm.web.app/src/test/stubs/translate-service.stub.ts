/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EventEmitter} from '@angular/core';
import {
    LangChangeEvent,
    TranslationChangeEvent
} from '@ngx-translate/core';
import {
    Observable,
    of,
    Subject
} from 'rxjs';

export class TranslateServiceStub {
    public currentLang = 'en';
    public defaultLang = 'en';
    public onTranslationChange: EventEmitter<TranslationChangeEvent> = new EventEmitter();

    private _onLangChangeObserver = new Subject<LangChangeEvent>();
    private _onDefaultLangChangeObserver = new Subject<LangChangeEvent>();

    public use(lang: string): Observable<any> {
        const langChangeEvent: LangChangeEvent = {
            lang,
            translations: null,
        };
        this.currentLang = lang;
        this._onLangChangeObserver.next(langChangeEvent);
        return of(langChangeEvent);
    }

    public setDefaultLang(lang: string): Observable<any> {
        const langChangeEvent: LangChangeEvent = {
            lang,
            translations: null,
        };
        this.defaultLang = lang;
        this._onDefaultLangChangeObserver.next(langChangeEvent);
        return of(langChangeEvent);
    }

    public get onLangChange(): Observable<LangChangeEvent> {
        return this._onLangChangeObserver;
    }

    public get onDefaultLangChange(): Observable<LangChangeEvent> {
        return this._onDefaultLangChangeObserver;
    }

    public get(key: string | Array<string>, interpolateParams?: Object): Observable<string | any> {
        return of(key);
    }

    public instant(key: string) {
        return key;
    }
}
