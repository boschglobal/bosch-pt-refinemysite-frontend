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
    ofType
} from '@ngrx/effects';
import {TranslateService} from '@ngx-translate/core';
import {
    interval,
    merge,
    of
} from 'rxjs';
import {
    catchError,
    map,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import {AnnouncementsService} from '../api/announcements.service';
import {
    AlertActionEnum,
    AlertActions
} from './alert.actions';
import {AlertQueries} from './alert.queries';

export const REQUEST_ANNOUNCEMENTS_PERIOD = 300000;

@Injectable()
export class AlertEffects {

    constructor(private _actions$: Actions,
                private _announcementsService: AnnouncementsService,
                private _alertQueries: AlertQueries,
                private _translateService: TranslateService) {
    }

    /**
     * @description Language change and interval interceptor to requests announcements
     * @description Should request announcements when the language changes or every 5 min
     */
    public requestAnnouncements$ = createEffect(() => merge(
        interval(REQUEST_ANNOUNCEMENTS_PERIOD),
        this._translateService.onDefaultLangChange,
    ).pipe(
        switchMap(() => {
            return this._announcementsService
                .findAll()
                .pipe(
                    map(announcementsList => new AlertActions.Add.Announcements(announcementsList)),
                    catchError(() => of(new AlertActions.Remove.AllAnnouncements()))
                );
        })
    ));

    /**
     * @description Requests read announcements
     * @type {Observable<Action>}
     */

    public requestReadAnnouncements$ = createEffect(() => this._actions$
        .pipe(
            ofType(AlertActionEnum.RequestReadAnnouncements),
            switchMap(() => this._announcementsService.getReadAnnouncements()
                .pipe(
                    map((readAnnouncements: string[]) => new AlertActions.Request.ReadAnnouncementsFulfilled(readAnnouncements)),
                    catchError(() => of(new AlertActions.Request.ReadAnnouncementsRejected()))))));

    /**
     * @description Sets read announcements
     * @type {Observable<Action>}
     */
    public setAnnouncementHasRead$ = createEffect(() => this._actions$
        .pipe(
            ofType(AlertActionEnum.SetAnnouncementHasRead),
            withLatestFrom(this._alertQueries.observeReadAnnouncements()),
            switchMap(([action, readAnnouncements]: [AlertActions.Set.AnnouncementHasRead, string[]]) =>
                this._announcementsService.setAnnouncementsHasRead([...readAnnouncements, action.payload])
                    .pipe(
                        map(() => new AlertActions.Set.AnnouncementHasReadFulfilled(action.payload)),
                        catchError(() => of(new AlertActions.Set.AnnouncementHasReadRejected()))))));
}
