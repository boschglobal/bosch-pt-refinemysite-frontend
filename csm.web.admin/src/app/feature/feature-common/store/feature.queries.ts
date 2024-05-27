/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {isEqual} from 'lodash';
import {Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {BaseQueries} from '../../../shared/misc/store/base.queries';
import {FeatureListResourceLinks} from '../api/resources/feature-list.resource';
import {FeatureResource} from '../api/resources/feature.resource';
import {FeatureSlice} from './feature.slice';
import {FeatureToggleResource} from '../../../feature-toggle/feature-toggle-common/api/resources/feature-toggle.resource';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {State} from '../../../app.reducers';

@Injectable({
    providedIn: 'root',
})
export class FeatureQueries extends BaseQueries<FeatureToggleResource, FeatureSlice, FeatureListResourceLinks> {

    public sliceName = 'featureSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves Observable of feature request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeCurrentFeatureRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of feature list request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeCurrentFeatureListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    public observeCurrentFeature(): Observable<FeatureResource> {
        return this._store
            .pipe(
                select(this.getCurrentItem()),
                distinctUntilChanged(isEqual));
    }

    public observeCurrentFeatureList(): Observable<FeatureResource[]> {
        return this._store
            .pipe(
                select(this.getList()),
                distinctUntilChanged(isEqual));
    }
}
