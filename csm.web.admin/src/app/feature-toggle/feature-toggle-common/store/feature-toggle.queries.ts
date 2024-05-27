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
import {FeatureToggleListResourceLinks} from '../api/resources/feature-toggle-list.resource';
import {FeatureToggleResource} from '../api/resources/feature-toggle.resource';
import {FeatureToggleSlice} from './feature-toggle.slice';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {State} from '../../../app.reducers';

@Injectable({
    providedIn: 'root',
})
export class FeatureToggleQueries extends BaseQueries<FeatureToggleResource, FeatureToggleSlice, FeatureToggleListResourceLinks> {

    public sliceName = 'featureToggleSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves Observable of features toggles with a given subjectId
     * @returns {Observable<FeatureToggleResource[]>}
     */
    public observeFeatureTogglesBySubjectId(subjectId: string): Observable<FeatureToggleResource[]> {
        return this._store
            .pipe(
                select(this._getCurrentFeatureTogglesBySubject(subjectId)),
                distinctUntilChanged());
    }

    public observeCurrentFeatureToggle(): Observable<FeatureToggleResource> {
        return this._store
            .pipe(
                select(this.getCurrentItem()),
                distinctUntilChanged(isEqual));
    }

    public observeFeatureToggleListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    public observeFeatureToggleCurrentItemRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    private _getCurrentFeatureTogglesBySubject(subjectId: string):
        (state: State) => FeatureToggleResource[] {
        return (state: State) =>
            this._getSlice(state).items.filter(featureToggle =>
                featureToggle.subjectId === subjectId);
    }
}
