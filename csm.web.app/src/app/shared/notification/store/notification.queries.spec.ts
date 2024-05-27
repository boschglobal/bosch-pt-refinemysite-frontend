/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {
    NOTIFICATION_MOCK,
    NOTIFICATION_MOCK_2
} from '../../../../test/mocks/notifications';
import {MockStore} from '../../../../test/mocks/store';
import {RequestStatusEnum} from '../../misc/enums/request-status.enum';
import {NotificationResource} from '../api/resources/notification.resource';
import {NotificationQueries} from './notification.queries';

describe('Notification Queries', () => {
    let notificationQueries: NotificationQueries;
    let subscription: Subscription;

    const getState = (hasNewNotifications = false, hasMoreItems = false, hasLastSeen = true) => {
        const currDate = new Date();
        const lastSeen = hasLastSeen ? currDate.toISOString() : null;
        const lastAdded = hasNewNotifications ? new Date(currDate.getTime() + 1000) : currDate;
        const links = !hasMoreItems ? {} : {
            prev: {
                href: ''
            }
        };

        return {
            notificationSlice: {
                list: {
                    ids: [NOTIFICATION_MOCK.id, NOTIFICATION_MOCK_2.id],
                    requestStatus: RequestStatusEnum.success,
                    _links: links,
                    lastSeen: lastSeen,
                    lastAdded: lastAdded.toISOString()
                },
                items: [NOTIFICATION_MOCK, NOTIFICATION_MOCK_2]
            }
        };
    };

    const mock = new MockStore(getState());

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: Store,
                useValue: mock
            },
            HttpClient,
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        notificationQueries = TestBed.inject(NotificationQueries);
    });

    afterEach(() => {
        if (subscription) {
            subscription.unsubscribe();
            subscription = null;
        }
    });

    it('should observe notifications', () => {
        subscription = notificationQueries
            .observeNotifications()
            .subscribe((result: NotificationResource[]) =>
                expect(result).toEqual([NOTIFICATION_MOCK, NOTIFICATION_MOCK_2]));
    });

    it('should observe notifications request status', () => {
        subscription = notificationQueries
            .observeNotificationsRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe notifications has no more items', () => {
        subscription = notificationQueries
            .observeNotificationsHasMoreItems()
            .subscribe((result: boolean) => expect(result).toBeFalsy());
    });

    it('should observe notifications has more items', () => {
        mock.nextMock(getState(false, true));

        subscription = notificationQueries
            .observeNotificationsHasMoreItems()
            .subscribe((result: boolean) => expect(result).toBeTruthy());
    });

    it('should observe notifications has no new items', () => {
        subscription = notificationQueries
            .observeNotificationsHasNewItems()
            .subscribe((result: boolean) => expect(result).toBeFalsy());
    });

    it('should observe notifications has new items', () => {
        mock.nextMock(getState(true));

        subscription = notificationQueries
            .observeNotificationsHasNewItems()
            .subscribe((result: boolean) => expect(result).toBeTruthy());
    });

    it('should observe notifications has new items without lastSeen setted', () => {
        mock.nextMock(getState(true, false, false));

        subscription = notificationQueries
            .observeNotificationsHasNewItems()
            .subscribe((result: boolean) => expect(result).toBeTruthy());
    });

    it('should return false when a date is previous to lastSeen', () => {
        const current = new Date();
        const date = current.toISOString();
        const lastSeen = new Date(current.getTime() + 1000).toISOString();

        expect(notificationQueries.isDateNotSeen(date, lastSeen)).toBeFalsy();
    });

    it('should return true when a date is after to lastSeen', () => {
        const current = new Date();
        const date = new Date(current.getTime() + 1000).toISOString();
        const lastSeen = current.toISOString();

        expect(notificationQueries.isDateNotSeen(date, lastSeen)).toBeTruthy();
    });

    it('should return true when a lastSeen is not set', () => {
        const current = new Date();
        const date = current.toISOString();
        const lastSeen = null;

        expect(notificationQueries.isDateNotSeen(date, lastSeen)).toBeTruthy();
    });
});
