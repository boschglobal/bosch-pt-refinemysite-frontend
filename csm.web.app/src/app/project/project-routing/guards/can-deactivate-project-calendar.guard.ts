/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {CanDeactivate} from '@angular/router';
import {Store} from '@ngrx/store';

import {State} from '../../../app.reducers';
import {RealtimeActions} from '../../../shared/realtime/store/realtime.actions';
import {CalendarScopeActions} from '../../project-common/store/calendar/calendar-scope/calendar-scope.actions';

@Injectable({
    providedIn: 'root',
})
export class CanDeactivateProjectCalendarGuard implements CanDeactivate<boolean> {

    constructor(private _store: Store<State>) {
    }

    public canDeactivate(): boolean {
        this._store.dispatch(new RealtimeActions.Unset.Context());
        this._store.dispatch(new CalendarScopeActions.Initialize.Focus());
        return true;
    }
}
