/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {TopicResource} from '../../api/topics/resources/topic.resource';
import {TopicListLinks} from '../../api/topics/resources/topic-list.resource';
import {TopicSlice} from './topic.slice';

@Injectable({
    providedIn: 'root',
})
export class TopicQueries extends BaseQueries<TopicResource, TopicSlice, TopicListLinks> {

    public moduleName = 'projectModule';

    public sliceName = 'topicSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves Observable of current task topics
     * @returns {Observable<TopicResource[]>}
     */
    public observeTopicsByTask(): Observable<TopicResource[]> {
        return this._store
            .pipe(
                select(this.getList()),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves Observable of current task topics request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeTopicsByTaskRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current task topics has more items
     * @returns {Observable<boolean>}
     */
    public observeTopicsByTaskHasMoreItems(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getListHasMoreItems()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current item current topic request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeCreateRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }
}
