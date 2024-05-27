/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Observable,
    ReplaySubject
} from 'rxjs';

import {RealtimeEventJobDataResource} from '../../app/shared/realtime/api/resources/realtime-event-job-data.resource';
import {RealtimeEventNotificationDataResource} from '../../app/shared/realtime/api/resources/realtime-event-notification-data.resource';
import {RealtimeEventUpdateDataResource} from '../../app/shared/realtime/api/resources/realtime-event-update-data.resource';

type RealtimeServiceStubEventsType =
    RealtimeEventUpdateDataResource |
    RealtimeEventNotificationDataResource |
    RealtimeEventJobDataResource;

export class RealtimeServiceStub {

    constructor(private _events$: ReplaySubject<RealtimeServiceStubEventsType>,
                public openConnection$?: Observable<void>,
                public open$?: Observable<Event>,
                public error$?: Observable<Event>) {
    }

    public getUpdateEvents(): Observable<RealtimeEventUpdateDataResource> {
        return this._events$ as Observable<RealtimeEventUpdateDataResource>;
    }

    public getNotificationEvents(): Observable<RealtimeEventNotificationDataResource> {
        return this._events$ as Observable<RealtimeEventNotificationDataResource>;
    }

    public getJobEvents(): Observable<RealtimeEventJobDataResource> {
        return this._events$ as Observable<RealtimeEventJobDataResource>;
    }
}
