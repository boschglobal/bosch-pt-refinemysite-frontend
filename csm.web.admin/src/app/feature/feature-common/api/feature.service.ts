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
import {FeatureListResource} from './resources/feature-list.resource';
import {FeatureResource} from './resources/feature.resource';
import {FeatureSaveResource} from './resources/feature-save.resource';

@Injectable({
    providedIn: 'root'
})
export class FeatureService {
    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper();

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * Fetch all features
     *
     * @returns {Observable<FeatureListResource>}
     */
    public findAllFeatures(): Observable<FeatureListResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`features`)
            .build();
        return this._httpClient.get<FeatureListResource>(requestUrl);
    }

    /**
     * Create feature
     *
     * @returns {Observable<FeatureResource>}
     */
    public createFeature(featureName: string): Observable<FeatureResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`features`)
            .build();
        return this._httpClient.post<FeatureResource>(requestUrl, new FeatureSaveResource(featureName));
    }

    /**
     * Enable feature
     *
     * @returns {Observable<FeatureResource>}
     */
    public enableFeature(featureName: string): Observable<FeatureResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`features/${featureName}/enable`)
            .build();
        return this._httpClient.post<FeatureResource>(requestUrl, {});
    }

    /**
     * Disable feature
     *
     * @returns {Observable<FeatureResource>}
     */
    public disableFeature(featureName: string): Observable<FeatureResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`features/${featureName}/disable`)
            .build();
        return this._httpClient.post<FeatureResource>(requestUrl, {});
    }

    /**
     * Activate feature whitelist
     *
     * @returns {Observable<FeatureResource>}
     */
    public activateFeatureWhitelist(featureName: string): Observable<FeatureResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`features/${featureName}/activate-whitelist`)
            .build();
        return this._httpClient.post<FeatureResource>(requestUrl, {});
    }
}
