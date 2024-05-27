/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';

import {
    ERROR_ALERT_MOCK,
    SUCCESS_ALERT_MOCK
} from '../../../../test/mocks/alerts';
import {ANNOUNCEMENTS_LIST_MOCK} from '../../../../test/mocks/announcements';
import {MockStore} from '../../../../test/mocks/store';
import {State} from '../../../app.reducers';
import {AlertResource} from '../api/resources/alert.resource';
import {AnnouncementResource} from '../api/resources/announcement.resource';
import {AlertQueries} from './alert.queries';

describe('Alert Queries', () => {
    let alertQueries: AlertQueries;

    const initialState: Pick<State, 'alertSlice'> = {
        alertSlice: {
            alerts: [
                ERROR_ALERT_MOCK,
                SUCCESS_ALERT_MOCK,
            ],
            announcements: ANNOUNCEMENTS_LIST_MOCK.items,
            readAnnouncements: [
                ANNOUNCEMENTS_LIST_MOCK.items[0].id,
            ],
        },
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            AlertQueries,
            {
                provide: Store,
                useValue: new MockStore(initialState),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        alertQueries = TestBed.inject(AlertQueries);
    });

    it('should retrieve alerts', () => {
        const expectedResult = initialState.alertSlice.alerts;

        alertQueries
            .observeAlerts()
            .subscribe((result: AlertResource[]) =>
                expect(result).toEqual(expectedResult));
    });

    it('should retrieve announcements', () => {
        const expectedResult = initialState.alertSlice.announcements;

        alertQueries
            .observeAnnouncements()
            .subscribe((result: AnnouncementResource[]) =>
                expect(result).toEqual(expectedResult));
    });

    it('should retrieve lastUnreadAnnouncement', () => {
        const unreadAnnouncement = ANNOUNCEMENTS_LIST_MOCK.items[1];

        alertQueries.observeLastUnreadAnnouncement().subscribe((result: AnnouncementResource) =>
            expect(result).toEqual(unreadAnnouncement));
    });

    it('should retrieve readAnnouncements', () => {
        const expectedResult = initialState.alertSlice.readAnnouncements;

        alertQueries.observeReadAnnouncements().subscribe((result: string[]) =>
            expect(result).toEqual(expectedResult));
    });
});
