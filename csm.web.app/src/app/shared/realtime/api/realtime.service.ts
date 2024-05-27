/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    fromEvent,
    Observable,
    Subject
} from 'rxjs';
import {
    filter,
    map,
    switchMap
} from 'rxjs/operators';

import {ApiVersionsEnum} from '../../../../configurations/api/api-versions.enum';
import {UserQueries} from '../../../user/store/user/user.queries';
import {JOB_TYPES_SUPPORTED} from '../../jobs/api/enums/job-type.enum';
import {ApiUrlHelper} from '../../rest/helpers/api-url.helper';
import {RealtimeEventTypeEnum} from '../enums/realtime-event-type.enum';
import {EventSourceService} from './event-source.service';
import {RealtimeEventJobDataResource} from './resources/realtime-event-job-data.resource';
import {RealtimeEventNotificationDataResource} from './resources/realtime-event-notification-data.resource';
import {RealtimeEventUpdateDataResource} from './resources/realtime-event-update-data.resource';

@Injectable({
    providedIn: 'root',
})
export class RealtimeService {

    public error$: Subject<Event> = new Subject<Event>();

    public open$: Subject<Event> = new Subject<Event>();

    public openConnection$: Subject<void> = new Subject<void>();

    private _eventSource: EventSource;

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Event);

    constructor(private _eventSourceService: EventSourceService,
                private _userQueries: UserQueries) {
    }

    /**
     * @description Returns stream of events for the event type RealtimeEventTypeEnum.Update
     * @return {Observable<RealtimeEventUpdateDataResource>}
     */
    public getUpdateEvents(): Observable<RealtimeEventUpdateDataResource> {
        return this._getObservableFromEventSource(RealtimeEventTypeEnum.Update).pipe(
            map(({data}) => RealtimeEventUpdateDataResource.fromString(data))
        );
    }

    /**
     * @description Returns stream of events for the event type RealtimeEventTypeEnum.Notification
     * @return {Observable<RealtimeEventNotificationDataResource>}
     */
    public getNotificationEvents(): Observable<RealtimeEventNotificationDataResource> {
        return this._getObservableFromEventSource(RealtimeEventTypeEnum.Notification).pipe(
            map(({data}) => RealtimeEventNotificationDataResource.fromString(data))
        );
    }

    /**
     * @description Returns stream of events for the event type RealtimeEventTypeEnum.Job
     * @return {Observable<RealtimeEventJobDataResource>}
     */
    public getJobEvents(): Observable<RealtimeEventJobDataResource> {
        return this._getObservableFromEventSource(RealtimeEventTypeEnum.Job).pipe(
            map(({data}) => RealtimeEventJobDataResource.fromString(data)),
            filter(({job}) => JOB_TYPES_SUPPORTED.includes(job.type)),
        );
    }

    private _openConnection(): void {
        this._eventSource = this._eventSourceService.connect(this._getUrl(), {withCredentials: true});
        this._eventSource.onopen = event => this.open$.next(event);
        this._eventSource.onerror = event => this.error$.next(event);

        this.openConnection$.next();
    }

    private _getConnection(type: RealtimeEventTypeEnum): Observable<any> {
        if (!this._eventSource) {
            this._openConnection();
        }

        return fromEvent(this._eventSource, type);
    }

    private _getObservableFromEventSource(type: RealtimeEventTypeEnum): Observable<any> {
        return this._userQueries.observeCurrentUser().pipe(
            filter(user => !!user),
            switchMap(() => this._getConnection(type))
        );
    }

    private _getUrl(): string {
        return this._apiUrlHelper
            .withPath('events')
            .build();
    }
}
