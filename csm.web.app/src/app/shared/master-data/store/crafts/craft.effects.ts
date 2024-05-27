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
import {
    Action,
    select,
    Store
} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {
    catchError,
    map,
    mergeMap,
    withLatestFrom
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {CraftService} from '../../../../craft/api/craft.service';
import {
    CraftActions,
    REQUEST_CRAFTS
} from './craft.actions';
import {CraftQueries} from './craft.queries';

@Injectable()
export class CraftEffects {

    private _craftQueries: CraftQueries = new CraftQueries();

    constructor(private _actions$: Actions,
                private _craftService: CraftService,
                private _store: Store<State>,
                private _translateService: TranslateService) {
        this._setSubscriptions();
    }

    /**
     * @description Request crafts interceptor to requests crafts
     * @type {Observable<Action>}
     */
    public requestCrafts$ = createEffect(() => this._actions$
        .pipe(
            ofType(REQUEST_CRAFTS),
            withLatestFrom(this._store
                .pipe(
                    select(this._craftQueries.getCraftSlice()))),
            mergeMap(([action, craftSlice]) => {
                const currentLang: string = this._translateService.defaultLang;
                const hasItemsForCurrentLang = craftSlice.list[currentLang].length;
                const forceRequest = (action as CraftActions.Request.Crafts).payload;

                if ((!craftSlice.used && !forceRequest) || hasItemsForCurrentLang) {
                    return of(new CraftActions.Request.CraftsRejected());
                }

                return this._craftService
                    .findAll()
                    .pipe(
                        map(craftListResource => new CraftActions.Request.CraftsFulfilled({currentLang, ...craftListResource})),
                        catchError((error: Error) => of(new CraftActions.Request.CraftsRejected())));
            })));

    private _setSubscriptions() {
        this._translateService.onDefaultLangChange.subscribe(_ => this._store.dispatch(new CraftActions.Request.Crafts(false)));
    }
}
