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
import {CraftListResource} from './resources/craft-list.resource';

@Injectable({
    providedIn: 'root',
})
export class CraftService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Craft);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieves all crafts
     * @returns {Observable<CraftListResource>}
     */
    public findAll(): Observable<CraftListResource> {
        const url = this._apiUrlHelper
            .withPath('crafts')
            .withQueryParam('size', 100)
            .build();

        return this._httpClient.get<CraftListResource>(url);
    }
}
