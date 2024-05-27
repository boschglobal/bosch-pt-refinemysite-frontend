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
    ParticipantActionEnum,
    ProjectParticipantActions
} from '../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../project-common/store/participants/project-participant.queries';
import {ROUTE_PARAM_PARTICIPANT_ID} from '../project-route.paths';

@Injectable({
    providedIn: 'root',
})
export class ParticipantResolverGuard extends ProtectAccessGuard implements CanActivate {

    constructor(private _actions: Actions,
                private _projectParticipantQueries: ProjectParticipantQueries,
                private _router: Router,
                private _store: Store<State>) {
        super(_router);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        const currentItemId: string = route.paramMap.get(ROUTE_PARAM_PARTICIPANT_ID);
        const isItemInCache: boolean = this._projectParticipantQueries.hasParticipantById(currentItemId);
        let _canActivate: Observable<boolean> | boolean;

        this._store.dispatch(new ProjectParticipantActions.Set.Current(currentItemId));

        if (isItemInCache) {
            _canActivate = true;
        } else {
            _canActivate = this._actions
                .pipe(
                    ofType(ParticipantActionEnum.RequestCurrentFulfilled, ParticipantActionEnum.RequestCurrentRejected),
                    take(1),
                    map((action: Action) => {
                        const successful = action.type === ParticipantActionEnum.RequestCurrentFulfilled;

                        if (!successful) {
                            this._handleUnauthorized();
                        }

                        return successful;
                    }));
        }

        return _canActivate;
    }
}
