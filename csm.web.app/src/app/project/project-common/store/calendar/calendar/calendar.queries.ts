/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store,
} from '@ngrx/store';
import {Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {State} from '../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {CalendarUserSettings} from '../../../api/calendar/resources/calendar-user-settings';
import {CalendarSlice} from './calendar.slice';

@Injectable({
    providedIn: 'root',
})
export class CalendarQueries {

    public moduleName = 'calendarModule';

    public sliceName = 'calendarSlice';

    constructor(private _store: Store<State>) {
    }

    /**
     * @description Retrieves an observable with the slices calendar user settings
     * @returns {Observable<CalendarUserSettings>}
     */
    public observeCalendarUserSettings(): Observable<CalendarUserSettings> {
        return this._store
            .pipe(
                select(this._getUserSettings()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves an observable with the current export request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeExportRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this._getExportRequestStatus()),
                distinctUntilChanged());
    }

    private _getSlice(state: State): CalendarSlice {
        return state.projectModule[this.moduleName][this.sliceName];
    }

    private _getUserSettings(): (state: State) => CalendarUserSettings {
        return (state: State) => this._getSlice(state).userSettings;
    }

    private _getExportRequestStatus(): (state: State) => RequestStatusEnum {
        return (state: State) => this._getSlice(state).exportRequestStatus;
    }
}
