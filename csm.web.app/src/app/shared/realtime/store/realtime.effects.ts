/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {createEffect} from '@ngrx/effects';
import {
    merge,
    of,
} from 'rxjs';
import {
    catchError,
    filter,
    first,
    map,
    switchMap,
    timeout
} from 'rxjs/operators';

import {AlertMessageResource} from '../../alert/api/resources/alert-message.resource';
import {AlertActions} from '../../alert/store/alert.actions';
import {RealtimeService} from '../api/realtime.service';

export const REALTIME_EVENT_TIMEOUT_TIMER = 15000;

@Injectable()
export class RealtimeEffects {

    private _connectionErrorEvents$ = this._realtimeService.openConnection$.pipe(
        switchMap(() => merge(
            this._realtimeService.error$,
            this._realtimeService.open$.pipe(
                timeout(REALTIME_EVENT_TIMEOUT_TIMER),
                first(),
                filter((event: Event | Error | void) => event instanceof Error)))));

    private _realtimeUnavailableAlertAction = new AlertActions.Add.WarningAlert({
        message: new AlertMessageResource('Realtime_UnavailableConnection_Message'),
    });

    constructor(private _realtimeService: RealtimeService) {
    }

    public connectionError$ = createEffect(() => this._connectionErrorEvents$
        .pipe(
            first(),
            map(() => this._realtimeUnavailableAlertAction),
            catchError(() => of(this._realtimeUnavailableAlertAction))));
}
