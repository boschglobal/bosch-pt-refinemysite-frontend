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
import {MessageResource} from '../../api/messages/resources/message.resource';
import {MessageListResourceLinks} from '../../api/messages/resources/message-list.resource';
import {MessageSlice} from './message.slice';

@Injectable({
    providedIn: 'root',
})
export class MessageQueries extends BaseQueries<MessageResource, MessageSlice, MessageListResourceLinks> {
    public moduleName = 'projectModule';
    public sliceName = 'messageSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves Observable of messages by topic
     * @param {string} topicId
     * @returns {Observable<MessageResource[]>}
     */
    public observeMessagesByTopic(topicId: string): Observable<MessageResource[]> {
        return this._store
            .pipe(
                select(this.getItemsByParent(topicId)),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves Observable of messages by topic request status
     * @param {string} topicId
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeMessagesByTopicRequestStatus(topicId: string): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatusByParent(topicId)),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of messages by topic has more topics
     * @param {string} topicId
     * @returns {Observable<boolean>}
     */
    public observeMessagesByTopicHasMoreItems(topicId: string): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getListHasMoreItemsByParent(topicId)),
                distinctUntilChanged());
    }
}
