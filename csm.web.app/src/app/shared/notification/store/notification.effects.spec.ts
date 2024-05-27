/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {
    Action,
    Store
} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    Observable,
    of,
    ReplaySubject,
    throwError,
} from 'rxjs';

import {
    NOTIFICATION_EMPTY_LIST_MOCK,
    NOTIFICATION_LIST_MOCK,
    NOTIFICATION_LIST_WITHOUT_PREV_LINK_MOCK,
    NOTIFICATION_MOCK
} from '../../../../test/mocks/notifications';
import {MockStore} from '../../../../test/mocks/store';
import {RealtimeServiceStub} from '../../../../test/stubs/realtime-service.stub';
import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {RealtimeService} from '../../realtime/api/realtime.service';
import {RealtimeEventNotificationDataResource} from '../../realtime/api/resources/realtime-event-notification-data.resource';
import {NotificationService} from '../api/notification.service';
import {NotificationListResource} from '../api/resources/notification-list.resource';
import {NotificationActions} from './notification.actions';
import {NotificationEffects} from './notification.effects';

describe('Notification Effects', () => {
    let notificationEffects: NotificationEffects;
    let actions: ReplaySubject<any>;
    let notificationService: any;
    let translateService: any;

    const findAllNotificationsResponse: Observable<NotificationListResource> = of(NOTIFICATION_LIST_MOCK);
    const findBeforeNotificationsResponse: Observable<NotificationListResource> = of(NOTIFICATION_LIST_MOCK);
    const findAfterNotificationsResponse: Observable<NotificationListResource> = of(NOTIFICATION_LIST_MOCK);
    const findEmptyAfterNotificationsResponse: Observable<NotificationListResource> = of(NOTIFICATION_EMPTY_LIST_MOCK);
    const findAfterNotificationsWithoutPrevLinkResponse: Observable<NotificationListResource> = of(NOTIFICATION_LIST_WITHOUT_PREV_LINK_MOCK);
    const markAsSeenNotificationsResponse: Observable<{}> = of({});
    const markAsReadNotificationResponse: Observable<{}> = of({});
    const errorResponse: Observable<any> = throwError('error');
    const notifications: ReplaySubject<RealtimeEventNotificationDataResource> = new ReplaySubject(1);
    const currentDate = new Date().toISOString();
    const notificationId = '123';

    const SLICE_INITIAL_STATE = {
        notificationSlice: {
            items: [],
            list: {
                ids: [],
                lastSeen: null
            }
        }
    };

    const storeMock = new MockStore({});

    const moduleDef: TestModuleMetadata = {
        providers: [
            NotificationEffects,
            provideMockActions(() => actions),
            {
                provide: NotificationService,
                useValue: jasmine.createSpyObj('NotificationService', ['findAll', 'markAsRead', 'markAsSeen'])
            },
            {
                provide: RealtimeService,
                useValue: new RealtimeServiceStub(notifications),
            },
            {
                provide: Store,
                useValue: storeMock
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub()
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        notificationEffects = TestBed.inject(NotificationEffects);
        notificationService = TestBed.inject(NotificationService);
        translateService = TestBed.inject(TranslateService);

        actions = new ReplaySubject(1);

        storeMock.nextMock(SLICE_INITIAL_STATE);
    });

    afterAll(() => {
        translateService.setDefaultLang('en');
    });

    it('should trigger a NotificationActions.Request.AllFulfilled action after requesting notifications successfully', () => {
        const expectedResult = new NotificationActions.Request.AllFulfilled(NOTIFICATION_LIST_MOCK);

        notificationService.findAll.and.returnValue(findAllNotificationsResponse);
        actions.next(new NotificationActions.Request.All());
        notificationEffects.requestNotifications$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a NotificationActions.Request.AllFulfilled and NotificationActions.Set.AsSeen actions after requesting notifications successfully', () => {
        const results = [];
        const expectedResult = [
            new NotificationActions.Request.AllFulfilled(NOTIFICATION_LIST_MOCK),
            new NotificationActions.Set.AsSeen(NOTIFICATION_MOCK.date)
        ];

        storeMock.nextMock({
            notificationSlice: {
                list: {
                    lastAdded: currentDate
                }
            }
        });

        notificationService.findAll.and.returnValue(findAllNotificationsResponse);
        actions.next(new NotificationActions.Request.All());
        notificationEffects.requestNotifications$.subscribe(result => {
            results.push(result);
        });

        expect(results).toEqual(expectedResult);
    });

    it('should trigger a NotificationActions.Request.AllFulfilled actions after requesting notifications successfully on first load', () => {
        const expectedResult = new NotificationActions.Request.AllFulfilled(NOTIFICATION_LIST_MOCK);

        storeMock.nextMock({
            notificationSlice: {
                list: {
                    lastAdded: currentDate,
                    lastSeen: currentDate
                }
            }
        });

        notificationService.findAll.and.returnValue(findAllNotificationsResponse);
        actions.next(new NotificationActions.Request.All());
        notificationEffects.requestNotifications$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });

    });

    it('should trigger a NotificationActions.Request.AllRejected action after requesting notifications has failed', () => {
        const expectedResult = new NotificationActions.Request.AllRejected();

        notificationService.findAll.and.returnValue(errorResponse);
        actions.next(new NotificationActions.Request.All());
        notificationEffects.requestNotifications$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a NotificationActions.Request.AllBeforeFulfilled action after requesting old notifications successfully', () => {
        const expectedResult = new NotificationActions.Request.AllBeforeFulfilled(NOTIFICATION_LIST_MOCK);

        notificationService.findAll.and.returnValue(findBeforeNotificationsResponse);
        actions.next(new NotificationActions.Request.AllBefore(currentDate));
        notificationEffects.requestNotificationsBefore$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a NotificationActions.Request.AllBeforeRejected action after requesting old notifications has failed', () => {
        const expectedResult = new NotificationActions.Request.AllBeforeRejected();

        notificationService.findAll.and.returnValue(errorResponse);
        actions.next(new NotificationActions.Request.AllBefore(currentDate));
        notificationEffects.requestNotificationsBefore$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a NotificationActions.Request.AllAfterFulfilled action after requesting recent notifications successfully ' +
        'and a NotificationActions.Request.AllAfter when there are more notifications to fetch', () => {
        const results = [];
        const firstNewNotificationDate = NOTIFICATION_LIST_MOCK.items[NOTIFICATION_LIST_MOCK.items.length - 1].date;
        const expectedResult = [
            new NotificationActions.Request.AllAfterFulfilled(NOTIFICATION_LIST_MOCK),
            new NotificationActions.Request.AllAfter(firstNewNotificationDate),
        ];

        notificationService.findAll.and.returnValue(findAfterNotificationsResponse);
        actions.next(new NotificationActions.Request.AllAfter(currentDate));
        notificationEffects.requestNotificationsAfter$.subscribe(result => {
            results.push(result);
        });

        expect(results).toEqual(expectedResult);
    });

    it('should trigger a NotificationActions.Request.AllAfterFulfilled action after requesting recent notifications successfully ' +
        'and a NotificationActions.Set.AsSeen with the date of the most recent notification', () => {
        const results = [];
        const firstNewNotificationDate = NOTIFICATION_LIST_WITHOUT_PREV_LINK_MOCK.items[NOTIFICATION_LIST_WITHOUT_PREV_LINK_MOCK.items.length - 1].date;
        const expectedResult = [
            new NotificationActions.Request.AllAfterFulfilled(NOTIFICATION_LIST_WITHOUT_PREV_LINK_MOCK),
            new NotificationActions.Set.AsSeen(firstNewNotificationDate)
        ];

        notificationService.findAll.and.returnValue(findAfterNotificationsWithoutPrevLinkResponse);
        actions.next(new NotificationActions.Request.AllAfter(currentDate));
        notificationEffects.requestNotificationsAfter$.subscribe(result => {
            results.push(result);
        });

        expect(results).toEqual(expectedResult);
    });

    it('should trigger a NotificationActions.Request.AllAfterFulfilled action after requesting recent notifications successfully with no items', () => {
        const results = [];
        const expectedResult = [
            new NotificationActions.Request.AllAfterFulfilled(NOTIFICATION_EMPTY_LIST_MOCK),
            new NotificationActions.Set.AsSeen(currentDate)
        ];

        notificationService.findAll.and.returnValue(findEmptyAfterNotificationsResponse);
        actions.next(new NotificationActions.Request.AllAfter(currentDate));
        notificationEffects.requestNotificationsAfter$.subscribe(result => {
            results.push(result);
        });

        expect(results).toEqual(expectedResult);
    });

    it('should trigger a NotificationActions.Request.AllAfterFulfilled action after requesting recent notifications successfully with no items and with a lastSeen updated', () => {
        const results = [];
        const expectedResult = [
            new NotificationActions.Request.AllAfterFulfilled(NOTIFICATION_EMPTY_LIST_MOCK),
        ];

        storeMock.nextMock({
            notificationSlice: {
                list: {
                    lastSeen: currentDate
                }
            }
        });

        const lastSeenDate = new Date(currentDate);
        const previousDate = new Date(lastSeenDate.getTime() - 1);

        notificationService.findAll.and.returnValue(findEmptyAfterNotificationsResponse);
        actions.next(new NotificationActions.Request.AllAfter(previousDate.toISOString()));
        notificationEffects.requestNotificationsAfter$.subscribe(result => {
            results.push(result);
        });

        expect(results).toEqual(expectedResult);
    });

    it('should trigger a NotificationActions.Request.AllAfterRejected action after requesting recent notifications has failed', () => {
        const expectedResult = new NotificationActions.Request.AllAfterRejected();

        notificationService.findAll.and.returnValue(errorResponse);
        actions.next(new NotificationActions.Request.AllAfter(currentDate));
        notificationEffects.requestNotificationsAfter$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a NotificationActions.Set.LastAdded action after receiving a notification event from backend', () => {
        const expectedResult = new NotificationActions.Set.LastAdded(currentDate);

        notifications.next(new RealtimeEventNotificationDataResource(currentDate));
        notificationEffects.newNotifications$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a NotificationActions.Set.AsSeenFulfilled action after mark as seen successfully', () => {
        const expectedResult = new NotificationActions.Set.AsSeenFulfilled(currentDate);

        notificationService.markAsSeen.and.returnValue(markAsSeenNotificationsResponse);
        actions.next(new NotificationActions.Set.AsSeen(currentDate));
        notificationEffects.markNotificationsAsSeen$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a NotificationActions.Set.AsSeenRejected action after mark as seen has failed', () => {
        const expectedResult = new NotificationActions.Set.AsSeenRejected(currentDate);

        notificationService.markAsSeen.and.returnValue(errorResponse);
        actions.next(new NotificationActions.Set.AsSeen(currentDate));
        notificationEffects.markNotificationsAsSeen$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a NotificationActions.Set.AsReadFulfilled action after mark as read successfully', () => {
        const expectedResult = new NotificationActions.Set.AsReadFulfilled(notificationId);

        notificationService.markAsRead.and.returnValue(markAsReadNotificationResponse);
        actions.next(new NotificationActions.Set.AsRead(notificationId));
        notificationEffects.markNotificationAsRead$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a NotificationActions.Set.AsReadRejected action after mark as read has failed', () => {
        const expectedResult = new NotificationActions.Set.AsReadRejected(notificationId);

        notificationService.markAsRead.and.returnValue(errorResponse);
        actions.next(new NotificationActions.Set.AsRead(notificationId));
        notificationEffects.markNotificationAsRead$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a NotificationActions.Request.All when language change', () => {
        const expectedResult = new NotificationActions.Request.All();

        storeMock.nextMock({
            notificationSlice: {
                items: [NOTIFICATION_MOCK],
                list: {
                    ids: [NOTIFICATION_MOCK.id]
                }
            }
        });

        translateService.setDefaultLang('en');

        notificationEffects.requestNotificationsOnLangChange$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });

        translateService.setDefaultLang('de');
    });

    it('should not trigger a NotificationActions.Request.All when language change but there are no notifications on the list', () => {
        let currentResult: Action = null;

        storeMock.nextMock({
            notificationSlice: {
                items: [],
                list: {
                    ids: []
                }
            }
        });

        translateService.setDefaultLang('en');

        notificationEffects.requestNotificationsOnLangChange$.subscribe(result => {
            currentResult = result;
        });

        translateService.setDefaultLang('de');

        expect(currentResult).toBeNull();
    });
});
