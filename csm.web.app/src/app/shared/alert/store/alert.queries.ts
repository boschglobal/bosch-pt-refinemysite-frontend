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
    Store
} from '@ngrx/store';
import {isEqual} from 'lodash';
import {
    combineLatest,
    Observable,
} from 'rxjs';
import {
    distinctUntilChanged,
    map,
} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {AlertResource} from '../api/resources/alert.resource';
import {AnnouncementResource} from '../api/resources/announcement.resource';

@Injectable({
    providedIn: 'root',
})
export class AlertQueries {

    constructor(private _store: Store<State>) {
    }

    public observeAlerts(): Observable<AlertResource[]> {
        return this._store
            .pipe(
                select(this._getAlerts()),
                distinctUntilChanged(isEqual),
            );
    }

    public observeAnnouncements(): Observable<AnnouncementResource[]> {
        return this._store
            .pipe(
                select(this._getAnnouncements()),
                distinctUntilChanged(isEqual));
    }

    public observeLastUnreadAnnouncement(): Observable<AnnouncementResource | undefined> {
        return combineLatest([
            this.observeAnnouncements(),
            this.observeReadAnnouncements(),
        ]).pipe(
            map(([announcementsList, readAnnouncementsList]) =>
                announcementsList.find(announcement =>
                    !readAnnouncementsList.find(readAnnouncement => readAnnouncement === announcement.id))));
    }

    public observeReadAnnouncements(): Observable<string[]> {
        return this._store.pipe(
            select(this._getReadAnnouncements()),
            distinctUntilChanged());
    }

    private _getAlerts(): (state: State) => AlertResource[] {
        return (state: State) => state.alertSlice.alerts;
    }

    private _getAnnouncements(): (state: State) => AnnouncementResource[] {
        return (state: State) => state.alertSlice.announcements;
    }

    private _getReadAnnouncements(): (state: State) => string[] {
        return (state: State) => state.alertSlice.readAnnouncements;
    }
}
