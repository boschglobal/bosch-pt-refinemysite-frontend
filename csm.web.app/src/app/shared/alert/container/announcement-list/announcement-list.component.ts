/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {SystemHelper} from '../../../misc/helpers/system.helper';
import {AnnouncementResource} from '../../api/resources/announcement.resource';
import {AlertActions} from '../../store/alert.actions';
import {AlertQueries} from '../../store/alert.queries';

@Component({
    selector: 'ss-announcement-list',
    templateUrl: './announcement-list.component.html',
    styleUrls: ['./announcement-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AnnouncementListComponent implements OnInit, OnDestroy {

    public announcement: AnnouncementResource;

    public isDeprecatedBrowser = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _alertQueries: AlertQueries,
                private _changeDetectorRef: ChangeDetectorRef,
                private _store: Store,
                private _systemHelper: SystemHelper) {
    }

    ngOnInit() {
        this._requestReadAnnouncements();
        this._setSubscriptions();
        this._setDeprecatedBrowser();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleCloseAnnouncement(announcement: AnnouncementResource): void {
        this._store.dispatch(new AlertActions.Set.AnnouncementHasRead(announcement.id));
    }

    private _requestReadAnnouncements(): void {
        this._store.dispatch(new AlertActions.Request.ReadAnnouncements());
    }

    private _setAnnouncement(announcement: AnnouncementResource | undefined): void {
        this.announcement = announcement;
        this._changeDetectorRef.detectChanges();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._alertQueries.observeLastUnreadAnnouncement()
                .subscribe((lastUnreadAnnouncement: AnnouncementResource | undefined) => this._setAnnouncement(lastUnreadAnnouncement)));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setDeprecatedBrowser() {
        this.isDeprecatedBrowser = this._systemHelper.isDeprecatedBrowser();
        this._changeDetectorRef.detectChanges();
    }
}
