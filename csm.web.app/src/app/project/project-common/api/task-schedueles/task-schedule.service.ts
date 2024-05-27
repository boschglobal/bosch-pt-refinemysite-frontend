/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    HttpClient,
    HttpHeaders
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {SaveTaskScheduleResource} from '../tasks/resources/save-task-schedule.resource';
import {TaskScheduleResource} from '../tasks/resources/task-schedule.resource';
import {TaskScheduleListResource} from '../tasks/resources/task-shedule-list.resource';
import {CreateTaskScheduleListItemResource} from './resources/create-task-schedule-list-item.resource';
import {SaveTaskScheduleListItemResource} from './resources/save-task-schedule-list-item.resource';

@Injectable({
    providedIn: 'root',
})
export class TaskScheduleService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieves the schedule for a given taskScheduleId
     * @param {string} projectId
     * @param {string} taskScheduleId
     * @returns {Observable<TaskScheduleResource>}
     */
    public findOne(projectId: string, taskScheduleId: string): Observable<TaskScheduleResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/tasks/schedules/${taskScheduleId}`)
            .build();

        return this._httpClient.get<TaskScheduleResource>(url);
    }

    /**
     * @description Retrieves the schedule for task with given taskId
     * @param taskId
     * @returns {Observable<TaskScheduleResource>}
     */
    public findOneByTaskId(taskId: string): Observable<TaskScheduleResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/schedule`)
            .build();

        return this._httpClient.get<TaskScheduleResource>(url);
    }

    /**
     * @description Retrieves the schedule from tasks with given taskScheduleIds
     * @param ids
     * @returns {Observable<TaskScheduleResource[]>}
     */
    public findAllByIds(ids: string[]): Observable<TaskScheduleResource[]> {
        const url = this._apiUrlHelper
            .withPath('projects/tasks/schedules')
            .withQueryParam('identifierType', ObjectTypeEnum.TaskSchedule)
            .build();

        return this._httpClient
            .post<TaskScheduleListResource>(url, {ids})
            .pipe(map(response => response.taskSchedules));
    }

    /**
     * @description Retrieves the schedule from tasks with given taskIds
     * @param ids
     * @returns {Observable<TaskScheduleResource[]>}
     */
    public findAllFromTasks(ids: string[]): Observable<TaskScheduleResource[]> {
        const url = this._apiUrlHelper
            .withPath('projects/tasks/schedules')
            .withQueryParam('identifierType', ObjectTypeEnum.Task)
            .build();

        return this._httpClient.post<TaskScheduleListResource>(url, {ids}).pipe(
            map(r => r.taskSchedules)
        );
    }

    /**
     * @description Creates and retrieves the schedule for task with given taskId
     * @param taskId
     * @param body
     * @returns {Observable<TaskScheduleResource>}
     */
    public create(taskId: string, body: SaveTaskScheduleResource): Observable<TaskScheduleResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/schedule`)
            .build();

        return this._httpClient.post<TaskScheduleResource>(url, body);
    }

    /**
     * @description Creates and retrieves a list of task schedules
     * @param taskScheduleList<CreateTaskScheduleListItemResource[]>
     * @returns {Observable<TaskScheduleResource[]>}
     */
    public createAll(taskScheduleList: CreateTaskScheduleListItemResource[]): Observable<TaskScheduleResource[]> {
        const url = this._apiUrlHelper
            .withPath('projects/tasks/schedules/batch')
            .build();
        const saveItemsResource = new AbstractItemsResource<CreateTaskScheduleListItemResource>(taskScheduleList);

        return this._httpClient
            .post<TaskScheduleListResource>(url, {...saveItemsResource})
            .pipe(
                map(response => response.taskSchedules));
    }

    /**
     * @description Updates and retrieves the schedule for task with given taskId
     * @param taskId
     * @param body
     * @param version
     * @returns {Observable<TaskScheduleResource>}
     */
    public update(taskId: string, body: SaveTaskScheduleResource, version: number): Observable<TaskScheduleResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/schedule`)
            .build();
        const headers: HttpHeaders = this._getHeaders(version);

        return this._httpClient.put<TaskScheduleResource>(url, body, {headers});
    }

    /**
     * @description Updates and retrieves a list of task schedules
     * @param taskScheduleList<SaveTaskScheduleListItemResource[]>
     * @returns {Observable<TaskScheduleResource[]>}
     */
    public updateAll(taskScheduleList: SaveTaskScheduleListItemResource[]): Observable<TaskScheduleResource[]> {
        const url = this._apiUrlHelper
            .withPath('projects/tasks/schedules/batch')
            .build();
        const saveItemsResource = new AbstractItemsResource(taskScheduleList);

        return this._httpClient
            .put<TaskScheduleListResource>(url, {...saveItemsResource})
            .pipe(
                map(response => response.taskSchedules));
    }

    /**
     * @description Deletes the schedule for task with given taskId
     * @param taskId
     * @param version
     * @returns {Observable<void>}
     */
    public deleteById(taskId: string, version: number): Observable<void> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/schedule`)
            .build();
        const headers: HttpHeaders = this._getHeaders(version);

        return this._httpClient.delete<void>(url, {headers});
    }

    private _getHeaders(version: number): HttpHeaders {
        return new HttpHeaders()
            .append('If-Match', version.toString());
    }
}
