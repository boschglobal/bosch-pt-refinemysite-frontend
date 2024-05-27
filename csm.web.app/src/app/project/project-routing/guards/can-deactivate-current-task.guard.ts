/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanDeactivate,
    RouterStateSnapshot
} from '@angular/router';
import {Store} from '@ngrx/store';

import {State} from '../../../app.reducers';
import {ObjectIdentifierPair} from '../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../shared/misc/enums/object-type.enum';
import {ActivityActions} from '../../project-common/store/activities/activity.actions';
import {NewsActions} from '../../project-common/store/news/news.actions';
import {ProjectTaskActions} from '../../project-common/store/tasks/task.actions';
import {TopicActions} from '../../project-common/store/topics/topic.actions';
import {ROUTE_PARAM_TASK_ID} from '../project-route.paths';

@Injectable({
    providedIn: 'root',
})
export class CanDeactivateCurrentTaskGuard implements CanDeactivate<boolean> {

    constructor(private _store: Store<State>) {
    }

    canDeactivate(component: boolean, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): boolean {
        this._store.dispatch(new ProjectTaskActions.Initialize.Current());
        this._store.dispatch(new TopicActions.Initialize.All());
        this._store.dispatch(new ActivityActions.Initialize.All());
        this._store.dispatch(new NewsActions.Delete.News(new ObjectIdentifierPair(ObjectTypeEnum.Task, currentRoute.params[ROUTE_PARAM_TASK_ID])));

        return true;
    }
}
