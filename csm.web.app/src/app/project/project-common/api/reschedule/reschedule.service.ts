/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {AbstractResource} from '../../../../shared/misc/api/resources/abstract.resource';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {RescheduleResource} from './resources/reschedule.resource';
import {SaveRescheduleResource} from './resources/save-reschedule.resource';

@Injectable({
    providedIn: 'root',
})
export class RescheduleService {
    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) { }

    public reschedule(projectId: string, reschedule: SaveRescheduleResource): Observable<AbstractResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/reschedule`)
            .build();
        return this._httpClient.post<AbstractResource>(url, reschedule);
    }

    public validate(projectId: string, reschedule: SaveRescheduleResource): Observable<RescheduleResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/reschedule/validate`)
            .build();
        return this._httpClient.post<RescheduleResource>(url, reschedule);
    }

}
