/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {AbstractIdsSaveResource} from '../../../../shared/misc/api/resources/abstract-ids-save.resource';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {SaveProjectTaskFilters} from '../../store/tasks/slice/save-project-task-filters';
import {CreateTaskListItemResource} from './resources/create-task-list-item.resource';
import {SaveCopyTaskResource} from './resources/save-copy-task.resource';
import {SaveTaskResource} from './resources/save-task.resource';
import {SaveTaskListItemResource} from './resources/save-task-list-item.resource';
import {TaskResource} from './resources/task.resource';
import {ProjectTaskListResource} from './resources/task-list.resource';

export type TasksSortField =
    'name' |
    'location' |
    'company' |
    'start' |
    'end' |
    'craft' |
    'status' |
    'news' |
    'workArea' |
    'calendarCraft' |
    'calendarDefault';

export const TASKS_SORT_FIELDS: { [key in TasksSortField]: string } = {
    name: 'name,location,topic',
    location: 'location,name,topic',
    company: 'company,name,location,topic',
    start: 'start,end',
    end: 'end,start',
    craft: 'projectCraft,name,location,topic',
    status: 'status,name,location,topic',
    news: 'topic,name,location',
    workArea: 'workArea,start,company,projectCraft,name',
    calendarCraft: 'workArea,projectCraft,start,company,name',
    calendarDefault: 'workArea,start,company,projectCraft,name',
};

@Injectable({
    providedIn: 'root',
})
export class TaskService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieves a single task
     * @param {string} taskId
     * @returns {Observable<TaskResource>}
     */
    public findOne(taskId: string): Observable<TaskResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}`)
            .build();

        return this._httpClient.get<TaskResource>(url);
    }

    /**
     * @description Retrieves all tasks with
     * @param {string} projectId
     * @param {string} field
     * @param {string} direction
     * @param {number} pageNumber
     * @param {number} size
     * @param {ProjectTaskFilters} filters
     * @returns {Observable<ProjectTaskListResource>}
     */
    public findAll(projectId: string, field: string, direction: string, pageNumber: number, size: number,
                   filters: SaveProjectTaskFilters): Observable<ProjectTaskListResource> {

        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/tasks/search`)
            .withPagination(size, pageNumber)
            .withSort(TASKS_SORT_FIELDS[field], direction)
            .build();

        return this._httpClient.post<ProjectTaskListResource>(url, filters);
    }

    /**
     * @description Retrieves all tasks by ids
     * @param {string} projectId
     * @param {string[]} ids
     * @returns {Observable<TaskResource[]>}
     */
    public findAllByIds(projectId: string, ids: string[]): Observable<TaskResource[]> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/tasks/batch/find`)
            .build();

        return this._httpClient
            .post<AbstractItemsResource<TaskResource>>(url, {ids})
            .pipe(map(response => response.items));
    }

    /**
     * @description Create a new task
     * @param task The task to be created
     * @return An observable of the created TaskResource
     */
    public create(task: SaveTaskResource): Observable<TaskResource> {
        const url = this._apiUrlHelper
            .withPath('projects/tasks')
            .build();
        const body: string = JSON.stringify(task);

        return this._httpClient.post<TaskResource>(url, body);
    }

    /**
     * @description Create new tasks
     * @param taskList<CreateTaskListItemResource[]>
     * @returns {Observable<TaskResource[]>}
     */
    public createAll(taskList: CreateTaskListItemResource[]): Observable<TaskResource[]> {
        const url = this._apiUrlHelper
            .withPath('projects/tasks/batch')
            .build();
        const saveItemsResource = new AbstractItemsResource(taskList);

        return this._httpClient
            .post<ProjectTaskListResource>(url, {...saveItemsResource})
            .pipe(
                map(response => response.tasks));
    }

    /**
     * @description Delete a task with the give taskId
     * @param {string} taskId
     * @param {string} version
     * @returns {Observable<void>}
     */
    public delete(taskId: string, version: number): Observable<void> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.delete<void>(url, {headers});
    }

    /**
     * @description Delete a list of tasks
     * @param {string[]} ids
     * @param {string} projectId
     * @returns {Observable<void>}
     */
    public deleteAll(ids: AbstractIdsSaveResource, projectId: string): Observable<void> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/tasks/delete`)
            .build();
        const body = JSON.stringify(ids);

        return this._httpClient.request<void>('delete', url, {body});
    }

    /**
     * @description Assign a list of tasks to a participant
     * @param {string[]} taskIds
     * @param {string} participantId
     * @returns {Observable<ProjectTaskListResource>}
     */
    public assign(taskIds: string[], participantId: string): Observable<ProjectTaskListResource> {
        const url = this._apiUrlHelper
            .withPath('projects/tasks/assign')
            .build();
        const body = JSON.stringify({taskIds, assigneeId: participantId});

        return this._httpClient.post<ProjectTaskListResource>(url, body);
    }

    /**
     * @description Send a task
     * @param {string} taskId
     * @returns {Observable<TaskResource>}
     */
    public send(taskId: string): Observable<TaskResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/send`)
            .build();
        const body = JSON.stringify({});

        return this._httpClient.post<TaskResource>(url, body);
    }

    /**
     * @description Send a list of tasks
     * @description Switch from draft to open status
     * @param {AbstractIdsSaveResource} ids
     * @param {string} projectId
     * @returns {Observable<AbstractItemsResource<TaskResource>>}
     */
    public sendAll(ids: AbstractIdsSaveResource, projectId: string): Observable<AbstractItemsResource<TaskResource>> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/tasks/send`)
            .build();
        const body = JSON.stringify(ids);

        return this._httpClient.post<AbstractItemsResource<TaskResource>>(url, body);
    }

    /**
     * @description Update a task
     * @param {string} taskId
     * @param {SaveTaskResource} task
     * @param {string} version
     * @returns {Observable<TaskResource>}
     */
    public update(taskId: string, task: SaveTaskResource, version: number): Observable<TaskResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}`)
            .build();
        const body: string = JSON.stringify(task);
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.put<TaskResource>(url, body, {headers});
    }

    /**
     * @description Update all tasks
     * @param taskList<SaveTaskListItemResource[]>
     * @returns {Observable<TaskResource[]>}
     */
    public updateAll(taskList: SaveTaskListItemResource[]): Observable<TaskResource[]> {
        const url = this._apiUrlHelper
            .withPath('projects/tasks/batch')
            .build();
        const saveItemsResource = new AbstractItemsResource(taskList);

        return this._httpClient
            .put<ProjectTaskListResource>(url, {...saveItemsResource})
            .pipe(
                map(response => response.tasks));
    }

    /**
     * @description Start a task
     * @param {string} taskId
     * @returns {Observable<TaskResource>}
     */
    public start(taskId: string): Observable<TaskResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/start`)
            .build();
        const body = JSON.stringify({});

        return this._httpClient.post<TaskResource>(url, body);
    }

    /**
     * @description Start a list of tasks
     * @param {AbstractIdsSaveResource} ids
     * @param {string} projectId
     * @returns {Observable<AbstractItemsResource<TaskResource>>}
     */
    public startAll(ids: AbstractIdsSaveResource, projectId: string): Observable<AbstractItemsResource<TaskResource>> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/tasks/start`)
            .build();
        const body = JSON.stringify(ids);

        return this._httpClient.post<AbstractItemsResource<TaskResource>>(url, body);
    }

    /**
     * @description Close a task
     * @param {string} taskId
     * @returns {Observable<TaskResource>}
     */
    public close(taskId: string): Observable<TaskResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/close`)
            .build();
        const body = JSON.stringify({});

        return this._httpClient.post<TaskResource>(url, body);
    }

    /**
     * @description Close a list of tasks
     * @param {AbstractIdsSaveResource} ids
     * @param {string} projectId
     * @returns {Observable<AbstractItemsResource<TaskResource>>}
     */
    public closeAll(ids: AbstractIdsSaveResource, projectId: string): Observable<AbstractItemsResource<TaskResource>> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/tasks/close`)
            .build();
        const body = JSON.stringify(ids);

        return this._httpClient.post<AbstractItemsResource<TaskResource>>(url, body);
    }

    /**
     * @description Accept a task
     * @param {string} taskId
     * @returns {Observable<TaskResource>}
     */
    public accept(taskId: string): Observable<TaskResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/accept`)
            .build();
        const body = JSON.stringify({});

        return this._httpClient.post<TaskResource>(url, body);
    }

    /**
     * @description Accept a list of tasks
     * @param {AbstractIdsSaveResource} ids
     * @param {string} projectId
     * @returns {Observable<AbstractItemsResource<TaskResource>>}
     */
    public acceptAll(ids: AbstractIdsSaveResource, projectId: string): Observable<AbstractItemsResource<TaskResource>> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/tasks/accept`)
            .build();
        const body = JSON.stringify(ids);

        return this._httpClient.post<AbstractItemsResource<TaskResource>>(url, body);
    }

    /**
     * @description Reset a task status
     * @param {string} taskId
     * @returns {Observable<TaskResource>}
     */
    public reset(taskId: string): Observable<TaskResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/reset`)
            .build();
        const body = JSON.stringify({});

        return this._httpClient.post<TaskResource>(url, body);
    }

    /**
     * @description Reset a list of tasks status
     * @param {AbstractIdsSaveResource} ids
     * @param {string} projectId
     * @returns {Observable<AbstractItemsResource<TaskResource>>}
     */
    public resetAll(ids: AbstractIdsSaveResource, projectId: string): Observable<AbstractItemsResource<TaskResource>> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/tasks/reset`)
            .build();
        const body = JSON.stringify(ids);

        return this._httpClient.post<AbstractItemsResource<TaskResource>>(url, body);
    }

    /**
     * @description Copy a list of tasks
     * @param {SaveCopyTaskResource} tasksToCopy
     * @param {string} projectId
     * @returns {Observable<AbstractItemsResource<TaskResource>>}
     */
    public copyAll(tasksToCopy: SaveCopyTaskResource[], projectId: string): Observable<AbstractItemsResource<TaskResource>> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/tasks/copy`)
            .build();
        const saveItemsResource = new AbstractItemsResource(tasksToCopy);
        const body = JSON.stringify(saveItemsResource);

        return this._httpClient.post<AbstractItemsResource<TaskResource>>(url, body);
    }
}
