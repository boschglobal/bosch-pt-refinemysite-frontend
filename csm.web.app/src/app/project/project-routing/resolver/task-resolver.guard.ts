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
    CanActivate,
    Router,
    RouterStateSnapshot
} from '@angular/router';
import {
    Actions,
    ofType
} from '@ngrx/effects';
import {
    Action,
    Store
} from '@ngrx/store';
import {Observable} from 'rxjs';
import {
    map,
    take
} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {ProtectAccessGuard} from '../../../shared/misc/guard/protect-access.guard';
import {
    ProjectTaskActions,
    TaskActionEnum
} from '../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../project-common/store/tasks/task-queries';
import {ROUTE_PARAM_TASK_ID} from '../project-route.paths';

@Injectable({
    providedIn: 'root',
})
export class CurrentTaskResolverGuard extends ProtectAccessGuard implements CanActivate {

    constructor(private _actions: Actions,
                private _projectTaskQueries: ProjectTaskQueries,
                private _router: Router,
                private _store: Store<State>) {
        super(_router);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        const currentTaskId: string = route.paramMap.get(ROUTE_PARAM_TASK_ID);
        const isTaskInCache: boolean = this._projectTaskQueries.hasTaskById(currentTaskId);
        let _canActivate: Observable<boolean> | boolean;

        this._store.dispatch(new ProjectTaskActions.Set.Current(currentTaskId));

        if (isTaskInCache) {
            _canActivate = true;
        } else {
            _canActivate = this._actions
                .pipe(
                    ofType(TaskActionEnum.RequestOneFulfilled, TaskActionEnum.RequestOneRejected),
                    take(1),
                    map((action: Action) => {
                        const successful = action.type === TaskActionEnum.RequestOneFulfilled;
                        if (!successful) {
                            this._handleUnauthorized();
                        }
                        return successful;
                    }));
        }

        return _canActivate;
    }

}
