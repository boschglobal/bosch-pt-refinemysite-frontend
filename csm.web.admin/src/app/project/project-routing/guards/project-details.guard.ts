/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
} from '@angular/router';
import {
    Actions,
    ofType,
} from '@ngrx/effects';
import {
    Action,
    Store,
} from '@ngrx/store';
import {Observable} from 'rxjs';
import {
    map,
    take,
} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {FeatureAction} from '../../../feature/feature-common/store/feature.actions';
import {ProtectAccessGuard} from '../../../shared/misc/guard/protect-access.guard';
import {
    ProjectActions,
    ProjectActionsEnum,
} from '../../project-common/store/project.actions';

@Injectable({
    providedIn: 'root',
})
export class ProjectDetailsGuard extends ProtectAccessGuard implements CanActivate {

    constructor(private _actions: Actions,
                private _router: Router,
                private _store: Store<State>) {
        super(_router);
    }

    public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
        const currentItemId: string = route.paramMap.get('id');

        this._store.dispatch(new ProjectActions.Set.Current(currentItemId));
        this._store.dispatch(new ProjectActions.Request.One(currentItemId));
        this._store.dispatch(new FeatureAction.Initialize.All());

        return this._actions
            .pipe(
                ofType(ProjectActionsEnum.RequestOneFulfilled, ProjectActionsEnum.RequestOneRejected),
                take(1),
                map((action: Action) => {
                    const success = action.type === ProjectActionsEnum.RequestOneFulfilled;

                    if (!success) {
                        this._handleUnauthorized();
                    }
                    return success;
                }));
    }
}
