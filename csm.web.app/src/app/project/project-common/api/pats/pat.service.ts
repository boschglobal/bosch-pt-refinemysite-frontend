/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    HttpClient,
    HttpHeaders
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {PATResource} from './resources/pat.resource';
import {PATListResource} from './resources/pat-list.resource';
import {SavePATResource} from './resources/save-pat.resource';

@Injectable({
    providedIn: 'root',
})
export class PATService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.User);

    constructor(private _httpClient: HttpClient) {
    }

    public findAll(): Observable<PATListResource> {
        const url = this._apiUrlHelper
            .withPath('users/current/pats')
            .build();

        return this._httpClient.get<PATListResource>(url);
    }

    public create(pat: SavePATResource): Observable<PATResource> {
        const url = this._apiUrlHelper
            .withPath('users/current/pats')
            .build();

        return this._httpClient.post<PATResource>(url, pat);
    }

    public delete(patId: string, version: number): Observable<void> {
        const url = this._apiUrlHelper
            .withPath(`users/current/pats/${patId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.delete<void>(url, {headers});
    }

    public update(patId: string, pat: SavePATResource, version: number): Observable<PATResource> {
        const url = this._apiUrlHelper
            .withPath(`users/current/pats/${patId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.put<PATResource>(url, pat, {headers});
    }
}
