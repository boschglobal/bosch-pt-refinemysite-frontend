/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    HttpClient,
    HttpHeaders
} from '@angular/common/http';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../shared/rest/helper/api-url.helper';
import {SaveUserLockResource} from './resources/save-user-lock.resource';
import {SaveUserRoleResource} from './resources/save-user-role.resource';
import {UserSuggestionsResource} from './resources/user-suggestions.resource';
import {UserResource} from './resources/user.resource';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _apuUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.User);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Get additional user info for current user
     * @returns {Observable<UserResource>}
     */
    public findAuthenticatedUser(): Observable<UserResource> {
        const requestUrl = this._apuUrlHelper
            .withPath( 'users/current')
            .build();

        return this._httpClient.get<UserResource>(requestUrl);
    }

    /**
     * @description Get user info from its id
     * @returns {Observable<UserResource>}
     */
    public findOne(userId: string): Observable<UserResource> {
        const requestUrl = this._apuUrlHelper
            .withPath( `users/${userId}`)
            .build();

        return this._httpClient.get<UserResource>(requestUrl);
    }

    /**
     * Finds suggested users for a company based on the search query for user name and email
     *
     * @return {Observable<UserResource>}
     */
    public findSuggestions(searchQuery: string, size = 15, pageIndex = 0): Observable<UserSuggestionsResource> {
        const requestUrl = this._apuUrlHelper
            .withPath('users/suggestions')
            .withPagination(size, pageIndex)
            .build();

        const body = {term: searchQuery};

        return this._httpClient.post<UserSuggestionsResource>(requestUrl, body);
    }

    /**
     * Updates the user's admin permission
     *
     * @return {Observable<UserResource>}
     */
    public setAdmin(userId: string, value: boolean, version: number): Observable<UserResource> {
        const requestUrl = this._apuUrlHelper
            .withPath(`users/${userId}/roles`)
            .build();

        const body = new SaveUserRoleResource(value);
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.post<UserResource>(requestUrl, body, {headers});
    }

    /**
     * Updates the user's locked state
     *
     * @return {Observable<UserResource>}
     */
    public setLock(userId: string, value: boolean, version: number): Observable<UserResource> {
        const requestUrl = this._apuUrlHelper
            .withPath(`users/${userId}/lock`)
            .build();

        const body = new SaveUserLockResource(value);
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.post<UserResource>(requestUrl, body, {headers});
    }

    /**
     * Deletes the user
     *
     * @return {Observable<>}
     */
    public delete(userId: string, version: number): Observable<{}> {
        const requestUrl = this._apuUrlHelper
            .withPath(`users/${userId}`)
            .build();

        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.delete(requestUrl, {headers});
    }

}
