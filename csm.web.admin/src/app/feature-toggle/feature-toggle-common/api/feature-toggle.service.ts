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

import {ApiUrlHelper} from '../../../shared/rest/helper/api-url.helper';
import {FeatureToggleListResource} from './resources/feature-toggle-list.resource';
import {FeatureToggleSaveResource} from './resources/feature-toggle-save.resource';
import {ObjectTypeEnum} from '../../../shared/misc/enums/object-type.enum';

@Injectable({
    providedIn: 'root'
})
export class FeatureToggleService {
    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper();

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * Fetch all features toggles filtered by subject
     *
     * @returns {Observable<FeatureToggleListResource>}
     */
    public findAllFeatureTogglesBySubjectId(subjectId: string): Observable<FeatureToggleListResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`features/subjects/${subjectId}`)
            .build();
        return this._httpClient.get<FeatureToggleListResource>(requestUrl);
    }

    /**
     * Add a company or project to the given feature´s whitelist
     *
     * @param subjectId
     * @param featureName
     * @param type
     * @returns {Observable<{}>}
     */
    public addToFeatureWhitelist(subjectId: string, featureName: string, type: ObjectTypeEnum): Observable<{}> {
        const requestUrl = this._apiUrlHelper
            .withPath(`features/${featureName}/subjects/${subjectId}`)
            .build();
        return this._httpClient.put(requestUrl, new FeatureToggleSaveResource(type));
    }

    /**
     * Remove a company or project from the given feature´s whitelist
     *
     * @param subjectId
     * @param featureName
     * @returns {Observable<{}>}
     */
    public removeFromFeatureWhitelist(subjectId: string, featureName: string): Observable<{}> {
        const requestUrl = this._apiUrlHelper
            .withPath(`features/${featureName}/subjects/${subjectId}`)
            .build();
        return this._httpClient.delete(requestUrl);
    }
}
