/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {
    filter,
    take,
} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {LegalDocumentsActions} from '../../../user/store/legal-documents/legal-documents.actions';
import {LegalDocumentsQueries} from '../../../user/store/legal-documents/legal-documents.queries';
import {CountryEnum} from '../../../user/user-common/enums/country.enum';
import {LanguageEnum} from '../../translation/helper/language.enum';
import {TranslateHelper} from '../../translation/helper/translate.helper';
import {RequestStatusEnum} from '../enums/request-status.enum';

@Injectable({
    providedIn: 'root',
})
export class AppInitializerHelper {

    constructor(private _legalDocumentsQueries: LegalDocumentsQueries,
                private _store: Store<State>,
                private _translateHelper: TranslateHelper,
                private _translateService: TranslateService) {
    }

    public init(): Observable<any> {
        this._configBrowserLanguage();
        this._requestLegalDocuments();

        return this._configLegalDocuments();
    }

    private _configBrowserLanguage(): void {
        const browserLanguage = this._translateService.getBrowserLang();
        const browserCultureLang = this._translateService.getBrowserCultureLang();

        this._translateHelper.configLanguage(browserLanguage, browserCultureLang);
    }

    private _configLegalDocuments(): Observable<RequestStatusEnum> {
        return this._legalDocumentsQueries.observeLegalDocumentsRequestStatus()
            .pipe(
                filter(requestStatus => requestStatus === RequestStatusEnum.success || requestStatus === RequestStatusEnum.error),
                take(1),
            );
    }

    private _requestLegalDocuments(): void {
        const currentLang = this._translateService.currentLang;
        const [language, country]: [LanguageEnum, CountryEnum] = currentLang.split('-') as [LanguageEnum, CountryEnum];

        this._store.dispatch(new LegalDocumentsActions.Request.UnregisteredAll(country, language));
    }
}

export function appInitializer(appInitializerHelper: AppInitializerHelper): () => Observable<any> {
    return () => appInitializerHelper.init();
}
