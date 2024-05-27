/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {MessageResource} from './resources/message.resource';
import {MessageListResource} from './resources/message-list.resource';

@Injectable({
    providedIn: 'root',
})
export class MessageService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieve a message resource after post it
     * @param {string} topicId
     * @param {string} content
     * @returns {Observable<MessageResource>}
     */
    public create(topicId: string, content: string): Observable<MessageResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/topics/${topicId}/messages`)
            .build();
        const message: string = JSON.stringify({content});

        return this._httpClient.post<MessageResource>(url, message);
    }

    /**
     * @description Deletes a message
     * @param {string} messageId
     * @returns {Observable<{}>}
     */
    public delete(messageId: string): Observable<{}> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/topics/messages/${messageId}`)
            .build();

        return this._httpClient.delete(url);
    }

    /**
     * @description Retrieve the message list of a given topic
     * @param {string} topicId
     * @param {string} lastMessageId
     * @param {number} limit
     * @returns {Observable<MessageListResource>}
     */
    public findAll(topicId: string, lastMessageId?: string, limit = 2): Observable<MessageListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/topics/${topicId}/messages`)
            .withCursorPaginationBefore(limit, lastMessageId)
            .build();

        return this._httpClient.get<MessageListResource>(url);
    }

    /**
     * @description Retrieve message with given id
     * @param {string} messageId
     * @returns {Observable<MessageResource>}
     */
    public findOne(messageId: string): Observable<MessageResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/topics/messages/${messageId}`)
            .build();

        return this._httpClient.get<MessageResource>(url);
    }
}
