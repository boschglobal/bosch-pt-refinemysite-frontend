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
import {TopicCriticalityEnum} from '../../enums/topic-criticality.enum';
import {SaveTopicResource} from './resources/save-topic.resource';
import {TopicResource} from './resources/topic.resource';
import {TopicListResource} from './resources/topic-list.resource';

@Injectable({
    providedIn: 'root',
})
export class TopicService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Create a new topic
     * @param {SaveTopicResource} topic
     * @param {string} taskId
     * @returns {Observable<TopicResource>}
     */
    public create(topic: SaveTopicResource, taskId: string): Observable<TopicResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/topics`)
            .build();
        const body: string = JSON.stringify(topic);

        return this._httpClient.post<TopicResource>(url, body);
    }

    /**
     * @description Deletes Topic with given id
     * @param {string} topicId
     * @returns {Observable<{}>}
     */
    public delete(topicId: string): Observable<{}> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/topics/${topicId}`)
            .build();

        return this._httpClient.delete<{}>(url);
    }

    /**
     * @description Retrieve the topic list of a given task.
     * @param {string} taskId
     * @param {string} lastTopicId
     * @param {number} limit
     * @returns {Observable<TopicListResource>}
     */
    public findAll(taskId: string, lastTopicId?: string, limit = 5): Observable<TopicListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/topics`)
            .withCursorPaginationBefore(limit, lastTopicId)
            .build();

        return this._httpClient.get<TopicListResource>(url);
    }

    /**
     * @description Retrieve topic with given id
     * @param {string} topicId
     * @returns {Observable<TopicResource>}
     */
    public findOne(topicId: string): Observable<TopicResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/topics/${topicId}`)
            .build();

        return this._httpClient.get<TopicResource>(url);
    }

    /**
     * @description Change criticality status of a topics
     * @param {string} topicId
     * @param {TopicCriticalityEnum} topicCriticality
     * @returns {Observable<TopicResource>}
     */
    public updateCriticality(topicId: string, topicCriticality: TopicCriticalityEnum): Observable<TopicResource> {
        const path = topicCriticality === TopicCriticalityEnum.CRITICAL ? `projects/tasks/topics/${topicId}/escalate` : `projects/tasks/topics/${topicId}/deescalate`;
        const url = this._apiUrlHelper
            .withPath(path)
            .build();

        return this._httpClient.post<TopicResource>(url, null);
    }
}
