/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType,
} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {
    Observable,
    of
} from 'rxjs';
import {
    catchError,
    map,
    mergeMap,
    switchMap,
} from 'rxjs/operators';

import {AlertMessageResource} from '../../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../../shared/alert/store/alert.actions';
import {LocalStorageService} from '../../../../../shared/local-storage/api/local-storage.service';
import {
    CALENDAR_EXPORT_FORMAT_TO_FILE_TYPE,
    CalendarExportService,
} from '../../../api/calendar/calendar-export.service';
import {CalendarUserSettings} from '../../../api/calendar/resources/calendar-user-settings';
import {
    CalendarActionEnum,
    CalendarActions,
} from './calendar.actions';

@Injectable()
export class CalendarEffects {

    constructor(private _actions$: Actions,
                private _calendarExportService: CalendarExportService,
                private _localStorageService: LocalStorageService) {
    }

    /**
     * @description Set user settings
     * @type {Observable<Action>}
     */
    public setUserSettings$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(CalendarActionEnum.SetUserSettings),
            switchMap((action: CalendarActions.Set.UserSettings) =>
                this._localStorageService.updateCalendarUserSettings(action.payload)
                    .pipe(
                        map((userSettings: CalendarUserSettings) => new CalendarActions.Set.UserSettingsFulfilled(userSettings)),
                        catchError(() => of(new CalendarActions.Set.UserSettingsRejected())))
            )));

    /**
     * @description Request user settings from local storage
     * @type {Observable<Action>}
     */
    public requestUserSettings$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(CalendarActionEnum.RequestUserSettings),
            switchMap(() =>
                this._localStorageService.findCalendarUserSettings()
                    .pipe(
                        map((userSettings: CalendarUserSettings) => new CalendarActions.Set.UserSettingsFulfilled(userSettings)),
                        catchError(() => of(new CalendarActions.Set.UserSettingsRejected()))
                    )
            )));

    /**
     * @description Export calendar
     * @type {Observable<Action>}
     */
    public exportCalendar$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(CalendarActionEnum.ExportOne),
            switchMap(({projectId, filters, format}: CalendarActions.Export.One) =>
                this._calendarExportService.getFile(projectId, filters, format)
                    .pipe(
                        mergeMap(({id}) => {
                            const fileType = CALENDAR_EXPORT_FORMAT_TO_FILE_TYPE[format];

                            return [
                                new CalendarActions.Export.OneFulfilled(id),
                                new AlertActions.Add.NeutralAlert(
                                    {message: new AlertMessageResource('Job_CalendarExportCard_RunningStatusTitle', {fileType})}),
                            ];
                        }),
                        catchError(() => of(new CalendarActions.Export.OneRejected())))))
    );
}
