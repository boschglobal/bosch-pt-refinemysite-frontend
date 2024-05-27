/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    HttpClient,
    HttpHeaders
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ApiVersionsEnum} from '../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../shared/rest/helpers/api-url.helper';
import {LanguageEnum} from '../../shared/translation/helper/language.enum';
import {SaveUserResource} from './resources/save-user.resource';
import {UserResource} from './resources/user.resource';

const CURRENT_USER_PATH = 'users/current';

export type LOCALES =
    'de_DE' |
    'en_GB' |
    'es_ES' |
    'fr_FR' |
    'fr_FT' | // we should keep this locale here as long as we have some users with it associated with their profile
    'pt_PT';

export const LANGUAGE_LOCALE_MAP: { [key in LanguageEnum]: LOCALES } = {
    [LanguageEnum.DE]: 'de_DE',
    [LanguageEnum.EN]: 'en_GB',
    [LanguageEnum.ES]: 'es_ES',
    [LanguageEnum.FR]: 'fr_FR',
    [LanguageEnum.PT]: 'pt_PT',
};

export const LOCALE_LANGUAGE_MAP: { [key in LOCALES]: LanguageEnum } = {
    /* eslint-disable @typescript-eslint/naming-convention */
    de_DE: LanguageEnum.DE,
    en_GB: LanguageEnum.EN,
    es_ES: LanguageEnum.ES,
    fr_FR: LanguageEnum.FR,
    fr_FT: LanguageEnum.FR,
    pt_PT: LanguageEnum.PT,
    /* eslint-enable @typescript-eslint/naming-convention */
};

@Injectable({
    providedIn: 'root',
})
export class UserService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.User);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Creates a user
     * @param {SaveUserResource} user
     * @returns {Observable<UserResource>}
     */
    public create(user: SaveUserResource): Observable<UserResource> {
        const url = this._apiUrlHelper
            .withPath(CURRENT_USER_PATH)
            .build();
        const body = this._mapSaveUserResource(user);

        return this._httpClient.post<UserResource>(url, body)
            .pipe(map(userResource => this._mapUserResource(userResource)));
    }

    /**
     * @description Get additional user info for current user
     * @returns {Observable<UserResource>}
     */
    public findCurrent(): Observable<UserResource> {
        const url = this._apiUrlHelper
            .withPath(CURRENT_USER_PATH)
            .build();
        return this._httpClient.get<UserResource>(url)
            .pipe(map(userResource => this._mapUserResource(userResource)));
    }

    /**
     * @description Updates a user resource
     * @param {string} version
     * @param {SaveUserResource} user
     * @returns {Observable<UserResource>}
     */
    public update(version: number, user: SaveUserResource): Observable<UserResource> {
        const url = this._apiUrlHelper
            .withPath(CURRENT_USER_PATH)
            .build();
        const body = this._mapSaveUserResource(user);
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.put<UserResource>(url, body, {headers})
            .pipe(map(userResource => this._mapUserResource(userResource)));
    }

    private _mapSaveUserResource(saveUserResource: SaveUserResource): SaveUserResource {
        const locale = LANGUAGE_LOCALE_MAP[saveUserResource.locale] as LanguageEnum;

        return {
            ...saveUserResource,
            ...locale ? {locale} : {},
        };
    }

    private _mapUserResource(userResource: UserResource): UserResource {
        const locale = LOCALE_LANGUAGE_MAP[userResource.locale];

        return {
            ...userResource,
            ...locale ? {locale} : {},
        };
    }
}
