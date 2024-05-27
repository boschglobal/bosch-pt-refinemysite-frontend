/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {JobResource} from '../api/resources/job.resource';
import {JobListResource} from '../api/resources/job-list.resource';

export enum JobActionEnum {
    RequestAll = '[Job] Request all',
    RequestAllFulfilled = '[Job] Request all fulfilled',
    RequestAllRejected = '[Job] Request all rejected',
    SetListAsSeen = '[Job] Set list as seen',
    SetListAsSeenFulfilled = '[Job] Set list as seen fulfilled',
    SetListAsSeenRejected = '[Job] Set list as seen rejected',
    SetJobAsRead = '[Job] Set list as read',
    SetJobAsReadFulfilled = '[Job] Set list as read fulfilled',
    SetJobAsReadRejected = '[Job] Set list as read rejected',
    SetJobToWatch = '[Job] Set job to watch',
    UnsetJobToWatch = '[Job] Unset job to watch',
    UpdateOneFulfilled = '[Job] Update one fulfilled',
}

export namespace JobActions {
    export namespace Request {
        export class All implements Action {
            readonly type = JobActionEnum.RequestAll;

            constructor() {
            }
        }

        export class AllFulfilled implements Action {
            readonly type = JobActionEnum.RequestAllFulfilled;

            constructor(public payload: JobListResource) {
            }
        }

        export class AllRejected implements Action {
            readonly type = JobActionEnum.RequestAllRejected;

            constructor() {
            }
        }
    }

    export namespace Set {
        export class ListAsSeen implements Action {
            readonly type = JobActionEnum.SetListAsSeen;

            constructor(public payload: string) {
            }
        }

        export class ListAsSeenFulfilled implements Action {
            readonly type = JobActionEnum.SetListAsSeenFulfilled;

            constructor(public payload: string) {
            }
        }

        export class ListAsSeenRejected implements Action {
            readonly type = JobActionEnum.SetListAsSeenRejected;

            constructor() {
            }
        }

        export class JobAsRead implements Action {
            readonly type = JobActionEnum.SetJobAsRead;

            constructor(public payload: string) {
            }
        }

        export class JobAsReadFulfilled implements Action {
            readonly type = JobActionEnum.SetJobAsReadFulfilled;

            constructor(public payload: string) {
            }
        }

        export class JobAsReadRejected implements Action {
            readonly type = JobActionEnum.SetJobAsReadRejected;

            constructor(public payload: string) {
            }
        }

        export class JobToWatch implements Action {
            readonly type = JobActionEnum.SetJobToWatch;

            constructor(public jobId: string) {
            }
        }
    }

    export namespace Unset {
        export class JobToWatch implements Action {
            readonly type = JobActionEnum.UnsetJobToWatch;

            constructor(public jobId: string) {
            }
        }
    }

    export namespace Update {
        export class OneFulfilled implements Action {
            readonly type = JobActionEnum.UpdateOneFulfilled;

            constructor(public payload: JobResource) {
            }
        }
    }
}

export type JobActions =
    JobActions.Request.All |
    JobActions.Request.AllFulfilled |
    JobActions.Request.AllRejected |
    JobActions.Set.ListAsSeen |
    JobActions.Set.ListAsSeenFulfilled |
    JobActions.Set.ListAsSeenRejected |
    JobActions.Set.JobAsRead |
    JobActions.Set.JobAsReadFulfilled |
    JobActions.Set.JobAsReadRejected |
    JobActions.Set.JobToWatch |
    JobActions.Unset.JobToWatch |
    JobActions.Update.OneFulfilled;
