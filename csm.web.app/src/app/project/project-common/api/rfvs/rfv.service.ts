/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {RfvEntity} from '../../entities/rfvs/rfv';
import {RfvResource} from './resources/rfv.resource';
import {SaveRfvResource} from './resources/save-rfv.resource';

@Injectable({
    providedIn: 'root',
})
export class RfvService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieves all rfvs
     * @param projectId
     */
    public findAll(projectId: string): Observable<RfvEntity[]> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/rfvs`)
            .build();

        return this._httpClient.get<AbstractItemsResource<RfvResource>>(url)
            .pipe(map(list => list.items.map(rfv => RfvEntity.fromRfvResource(rfv))));
    }

    /**
     * @description Update rfv
     * @param projectId
     * @param body
     */
    public update(projectId: string, body: SaveRfvResource): Observable<RfvEntity> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/rfvs`)
            .build();

        return this._httpClient.put<RfvResource>(url, body)
            .pipe(map(rfv => RfvEntity.fromRfvResource(rfv)));
    }
}
