/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../configurations/api/api-versions.enum';
import {ClientTypeEnum} from '../../shared/misc/enums/client-type.enum';
import {ApiUrlHelper} from '../../shared/rest/helpers/api-url.helper';
import {LanguageEnum} from '../../shared/translation/helper/language.enum';
import {CountryEnum} from '../user-common/enums/country.enum';
import {LegalDocumentResource} from './resources/user-legal-documents.resource';
import {LegalDocumentListResource} from './resources/user-legal-documents-list.resource';
import {LANGUAGE_LOCALE_MAP} from './user.service';

@Injectable({
    providedIn: 'root',
})
export class UserLegalDocumentsService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.User);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Get the latest version of legal document.
     * @returns {Observable<LegalDocumentListResource>}
     */
    public findCurrent(): Observable<LegalDocumentListResource> {
        const url = this._apiUrlHelper
            .withPath('users/current/documents')
            .withQueryParam('client', ClientTypeEnum.Web)
            .build();

        return this._httpClient.get<LegalDocumentListResource>(url);
    }

    /**
     * @description Get the latest version of legal documents by country and locale.
     * @param {CountryEnum} country
     * @param {LanguageEnum} locale
     * @returns {Observable<LegalDocumentListResource>}
     */
    public findUnregistered(country: CountryEnum, locale: LanguageEnum): Observable<LegalDocumentListResource> {
        const url = this._apiUrlHelper
            .withPath('users/unregistered/documents')
            .withQueryParam('country', country)
            .withQueryParam('locale', LANGUAGE_LOCALE_MAP[locale])
            .withQueryParam('client', ClientTypeEnum.Web)
            .build();

        return this._httpClient.get<LegalDocumentListResource>(url);
    }

    /**
     * @description Post to consent to multiple document versions.
     * @param {string[]} ids
     * @returns {Observable<{}>}
     */
    public consents(ids: string[]): Observable<{}> {
        const url = this._apiUrlHelper
            .withPath('users/current/consents')
            .build();

        return this._httpClient.post<LegalDocumentResource>(url, {ids});
    }

    /**
     * @description Post to delay consent to all documents.
     * @returns {Observable<{}>}
     */
    public delayConsent(): Observable<{}> {
        const url = this._apiUrlHelper
            .withPath('users/current/documents/delay-consent')
            .build();

        return this._httpClient.post<LegalDocumentResource>(url, null);
    }
}
