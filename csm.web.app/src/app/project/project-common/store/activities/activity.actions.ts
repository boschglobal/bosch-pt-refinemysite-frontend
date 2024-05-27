/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {ActivityListResource} from '../../api/activities/resources/activity-list.resource';

export enum ActivityActionEnum {
    INITIALIZE_ALL_ACTIVITIES = '[Activities] Initialize all',
    REQUEST_ALL_ACTIVITIES = '[Activities] Request all',
    REQUEST_ALL_ACTIVITIES_FULFILLED = '[Activities] Request all fulfilled',
    REQUEST_ALL_ACTIVITIES_REJECTED = '[Activities] Request all rejected ',
}

export namespace ActivityActions {

    export namespace Initialize {
        export class All implements Action {
            readonly type = ActivityActionEnum.INITIALIZE_ALL_ACTIVITIES;

            constructor() {
            }
        }
    }

    export namespace Request {

        export class All implements Action {
            readonly type = ActivityActionEnum.REQUEST_ALL_ACTIVITIES;

            constructor(public payload: RequestAllActivitiesPayload) {
            }
        }

        export class AllFulfilled implements Action {
            readonly type = ActivityActionEnum.REQUEST_ALL_ACTIVITIES_FULFILLED;

            constructor(public payload: ActivityListResource) {
            }
        }

        export class AllRejected implements Action {
            readonly type = ActivityActionEnum.REQUEST_ALL_ACTIVITIES_REJECTED;
        }
    }
}

export interface RequestAllActivitiesPayload {
    taskId: string;
    lastActivityId?: string;
}

export type ActivityActions =
    ActivityActions.Initialize.All |
    ActivityActions.Request.All |
    ActivityActions.Request.AllFulfilled |
    ActivityActions.Request.AllRejected;

