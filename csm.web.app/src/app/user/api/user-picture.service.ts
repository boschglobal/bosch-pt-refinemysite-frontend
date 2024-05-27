/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../shared/rest/helpers/api-url.helper';
import {UserPictureResource} from './resources/user-picture.resource';

@Injectable({
    providedIn: 'root',
})
export class UserPictureService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.User);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Upload user picture service
     * @param {string} userId
     * @param {File} picture
     * @returns {Observable<UserPictureResource>}
     */
    public upload(userId: string, picture: File): Observable<UserPictureResource> {
        const url = this._apiUrlHelper
            .withPath(`users/${userId}/picture`)
            .build();
        const data = new FormData();
        data.append('file', picture);

        return this._httpClient.post<UserPictureResource>(url, data);
    }

    /**
     * @description Remove a picture from a user by project id
     * @param {string} userId
     * @returns {Observable<UserPictureResource>}
     */
    public remove(userId: string): Observable<UserPictureResource> {
        const url = this._apiUrlHelper
            .withPath(`users/${userId}/picture`)
            .build();

        return this._httpClient.delete<UserPictureResource>(url);
    }
}
