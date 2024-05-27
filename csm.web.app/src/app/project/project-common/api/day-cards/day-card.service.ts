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
import {AbstractItemSaveResource} from '../../../../shared/misc/api/resources/abstract-item-save.resource';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {DayCard} from '../../models/day-cards/day-card';
import {RfvKey} from '../rfvs/resources/rfv.resource';
import {TaskScheduleResource} from '../tasks/resources/task-schedule.resource';
import {DayCardResource} from './resources/day-card.resource';
import {SaveDayCardResource} from './resources/save-day-card.resource';
import {SaveDeleteDayCardResource} from './resources/save-delete-day-card.resource';

@Injectable({
    providedIn: 'root',
})
export class DayCardService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Find day card with given dayCardId
     * @param dayCardId
     * @returns {Observable<DayCardResource>}
     */
    public findOne(dayCardId: string): Observable<DayCardResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/schedule/daycards/${dayCardId}`)
            .build();

        return this._httpClient.get<DayCardResource>(url);
    }

    /**
     * @description Get a list of day cards with given daycardIds
     * @param dayCardIds
     * @returns {Observable<DayCardResource[]>}
     */
    public findAll(ids: AbstractIdsSaveResource): Observable<DayCardResource[]> {
        const url = this._apiUrlHelper
            .withPath('projects/tasks/schedule/daycards')
            .build();

        return this._httpClient
            .post<AbstractItemsResource<DayCardResource>>(url, ids)
            .pipe(map(response => response.items));
    }

    /**
     * @description Create day card in the task with given taskId
     * @param taskId
     * @param body
     * @param version of the schedule
     * @returns {Observable<TaskScheduleResource>}
     */
    public create(taskId: string, body: SaveDayCardResource, version: number): Observable<TaskScheduleResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/schedule/daycards`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.post<TaskScheduleResource>(url, body, {headers});
    }

    /**
     * @description Updates day card with given dayCardId
     * @param dayCardId
     * @param body
     * @param version of the day card
     * @returns {Observable<DayCardResource>}
     */
    public update(dayCardId: string, body: SaveDayCardResource, version: number): Observable<DayCardResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/schedule/daycards/${dayCardId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.put<DayCardResource>(url, body, {headers});
    }

    /**
     * @description Updates day card with given dayCardId
     * @param dayCardId
     * @param version of the schedule
     * @returns {Observable<DayCardResource>}
     */
    public delete(dayCardId: string, version: number): Observable<TaskScheduleResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/schedule/daycards/${dayCardId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.delete<TaskScheduleResource>(url, {headers});
    }

    /**
     * @description Delete a list of day cards
     * @param projectId
     * @param items
     * @returns {Observable<AbstractItemsResource<TaskScheduleResource>>}
     */
    public deleteAll(projectId: string, items: AbstractItemsResource<SaveDeleteDayCardResource>):
        Observable<AbstractItemsResource<TaskScheduleResource>> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/tasks/schedule/daycards`)
            .build();

        return this._httpClient.request<AbstractItemsResource<TaskScheduleResource>>('delete', url, {body: items});
    }

    /**
     * @description Marks day card as Not Done
     * @param dayCardId
     * @param body
     * @param version
     * @returns {Observable<DayCardResource>}
     */
    public cancel(dayCardId: string, reason: RfvKey, version: number): Observable<DayCardResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/schedule/daycards/${dayCardId}/cancel`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.post<DayCardResource>(url, {reason}, {headers});
    }

    /**
     * @description Marks a list of day cards as Not Done
     * @param dayCardList
     * @param version
     * @returns {Observable<DayCardResource[]>}
     */
    public cancelAll(dayCardList: AbstractItemSaveResource<DayCard>[], reason: RfvKey): Observable<DayCardResource[]> {
        const url = this._apiUrlHelper
            .withPath('projects/tasks/schedule/daycards/cancel')
            .build();
        const saveItemsResource = new AbstractItemsResource(dayCardList);

        return this._httpClient
            .post<AbstractItemsResource<DayCardResource>>(url, {...saveItemsResource, reason})
            .pipe(
                map(response => response.items));
    }

    /**
     * @description Marks day card as Done
     * @param dayCardId
     * @param version
     * @returns {Observable<DayCardResource>}
     */
    public complete(dayCardId: string, version: number): Observable<DayCardResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/schedule/daycards/${dayCardId}/complete`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.post<DayCardResource>(url, {}, {headers});
    }

    /**
     * @description Marks a list of day cards as complete
     * @param dayCardList
     * @returns {Observable<DayCardResource[]>}
     */
    public completeAll(dayCardList: AbstractItemSaveResource<DayCard>[]): Observable<DayCardResource[]> {
        const url = this._apiUrlHelper
            .withPath('projects/tasks/schedule/daycards/complete')
            .build();
        const saveItemsResource = new AbstractItemsResource(dayCardList);

        return this._httpClient
            .post<AbstractItemsResource<DayCardResource>>(url, saveItemsResource)
            .pipe(
                map(response => response.items));
    }

    /**
     * @description Marks day card as Approved
     * @param dayCardId
     * @param version
     * @returns {Observable<DayCardResource>}
     */
    public approve(dayCardId: string, version: number): Observable<DayCardResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/schedule/daycards/${dayCardId}/approve`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.post<DayCardResource>(url, {}, {headers});
    }

    /**
     * @description Approve a list of day cards
     * @param dayCardList
     * @returns {Observable<DayCardResource[]>}
     */
    public approveAll(dayCardList: AbstractItemSaveResource<DayCard>[]): Observable<DayCardResource[]> {
        const url = this._apiUrlHelper
            .withPath('projects/tasks/schedule/daycards/approve')
            .build();
        const saveItemsResource = new AbstractItemsResource(dayCardList);

        return this._httpClient
            .post<AbstractItemsResource<DayCardResource>>(url, saveItemsResource)
            .pipe(
                map(response => response.items));
    }

    /**
     * @description Resets day card status to Open
     * @param dayCardId
     * @param version
     * @returns {Observable<DayCardResource>}
     */
    public reset(dayCardId: string, version: number): Observable<DayCardResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/schedule/daycards/${dayCardId}/reset`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.post<DayCardResource>(url, {}, {headers});
    }
}
