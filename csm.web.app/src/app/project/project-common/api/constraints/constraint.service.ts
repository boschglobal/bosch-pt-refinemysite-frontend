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
import {ConstraintEntity} from '../../entities/constraints/constraint';
import {ConstraintResource} from './resources/constraint.resource';
import {SaveConstraintResource} from './resources/save-constraint.resource';

@Injectable({
    providedIn: 'root',
})
export class ConstraintService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieves all constraints
     * @param projectId
     */
    public findAll(projectId: string): Observable<ConstraintEntity[]> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/constraints`)
            .build();

        return this._httpClient.get<AbstractItemsResource<ConstraintResource>>(url)
            .pipe(map(list => list.items.map(constraint => ConstraintEntity.fromConstraintResource(constraint))));
    }

    /**
     * @description Update constraint
     * @param projectId
     * @param body
     */
    public update(projectId: string, body: SaveConstraintResource): Observable<ConstraintEntity> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/constraints`)
            .build();

        return this._httpClient.put<ConstraintResource>(url, body)
            .pipe(map(constraint => ConstraintEntity.fromConstraintResource(constraint)));
    }
}
