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

import {ApiVersionsEnum} from '../../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../rest/helpers/api-url.helper';
import {NotificationListResource} from './resources/notification-list.resource';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieves list of notifications
     * @param lastNotificationDate
     * @param firstNotificationDate
     * @param limit
     * @return {Observable<NotificationListResource>}
     */
    public findAll(lastNotificationDate: string = null, firstNotificationDate: string = null, limit = 30): Observable<NotificationListResource> {
        const url = this._apiUrlHelper
            .withPath('projects/notifications')
            .withCursorPaginationBefore(limit, lastNotificationDate)
            .withCursorPaginationAfter(limit, firstNotificationDate)
            .build();

        return this._httpClient.get<NotificationListResource>(url);
    }

    /**
     * @description Marks notification with given notificationId as read
     * @param notificationId
     * @return {Observable<{}>}
     */
    public markAsRead(notificationId: string): Observable<{}> {
        const url = this._apiUrlHelper
            .withPath(`projects/notifications/${notificationId}/read`)
            .build();

        return this._httpClient.post<NotificationListResource>(url, null);
    }

    /**
     * @description Marks list of notifications as seen
     * @param lastSeen
     * @return {Observable<{}>}
     */
    public markAsSeen(lastSeen: string): Observable<{}> {
        const url = this._apiUrlHelper
            .withPath('projects/notifications/seen')
            .build();

        return this._httpClient.post<NotificationListResource>(url, {lastSeen});
    }
}
