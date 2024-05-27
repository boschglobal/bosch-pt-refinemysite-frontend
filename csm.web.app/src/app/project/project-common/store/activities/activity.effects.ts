/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {
    Observable,
    of
} from 'rxjs';
import {
    catchError,
    map,
    switchMap
} from 'rxjs/operators';

import {ActivityService} from '../../api/activities/activity.service';
import {ActivityListResource} from '../../api/activities/resources/activity-list.resource';
import {
    ActivityActionEnum,
    ActivityActions
} from './activity.actions';

@Injectable()
export class ActivityEffects {
    constructor(private _actions$: Actions,
                private _activityService: ActivityService) {
    }

    /**
     * @description Request topics interceptor to request current task topics
     * @type {Observable<Action>}
     */
    public requestActivities$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ActivityActionEnum.REQUEST_ALL_ACTIVITIES),
            switchMap((action: ActivityActions.Request.All) => {
                const {taskId, lastActivityId} = action.payload;
                return this._activityService.findAll(taskId, lastActivityId).pipe(
                    map((activities: ActivityListResource) => new ActivityActions.Request.AllFulfilled(activities)),
                    catchError((error: Error) => of(new ActivityActions.Request.AllRejected())));
            })));
}
