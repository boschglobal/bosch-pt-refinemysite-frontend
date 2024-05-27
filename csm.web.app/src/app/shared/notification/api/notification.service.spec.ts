/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    HttpClientTestingModule,
    HttpTestingController,
    TestRequest
} from '@angular/common/http/testing';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {ApiVersionsEnum} from '../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../configurations/configuration.local-with-dev-backend';
import {
    NOTIFICATION_LIST_MOCK,
    NOTIFICATION_MOCK
} from '../../../../test/mocks/notifications';
import {NotificationService} from './notification.service';
import {NotificationListResource} from './resources/notification-list.resource';

describe('Notification Service', () => {
    let notificationService: NotificationService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const notificationId = 'foo';
    const firstNotificationDate = NOTIFICATION_MOCK.date;
    const lastNotificationDate = NOTIFICATION_MOCK.date;
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const findAllUrl = `${baseUrl}/projects/notifications?limit=30`;
    const findAllAfterUrl = `${baseUrl}/projects/notifications?limit=100&after=${encodeURIComponent(firstNotificationDate)}`;
    const findAllBeforeUrl = `${baseUrl}/projects/notifications?limit=30&before=${encodeURIComponent(lastNotificationDate)}`;
    const markAsSeenUrl = `${baseUrl}/projects/notifications/seen`;
    const markAsReadUrl = `${baseUrl}/projects/notifications/${notificationId}/read`;

    const emptyResponseBody = {};
    const notificationListResponseBody = NOTIFICATION_LIST_MOCK;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        notificationService = TestBed.inject(NotificationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findAll and return list of notifications', waitForAsync(() => {
        notificationService
            .findAll()
            .subscribe((response: NotificationListResource) =>
                expect(response).toBe(notificationListResponseBody));

        req = httpMock.expectOne(findAllUrl);
        expect(req.request.method).toBe('GET');
        req.flush(notificationListResponseBody);
    }));

    it('should call findAll and return list of notifications before lastNotificationDate', waitForAsync(() => {
        notificationService
            .findAll(lastNotificationDate)
            .subscribe((response: NotificationListResource) =>
                expect(response).toBe(notificationListResponseBody));

        req = httpMock.expectOne(findAllBeforeUrl);
        expect(req.request.method).toBe('GET');
        req.flush(notificationListResponseBody);
    }));

    it('should call findAll and return list of notifications after firstNotificationDate', waitForAsync(() => {
        notificationService
            .findAll(null, firstNotificationDate, 100)
            .subscribe((response: NotificationListResource) =>
                expect(response).toBe(notificationListResponseBody));

        req = httpMock.expectOne(findAllAfterUrl);
        expect(req.request.method).toBe('GET');
        req.flush(notificationListResponseBody);
    }));

    it('should call markAsRead and return empty object', waitForAsync(() => {
        notificationService
            .markAsRead(notificationId)
            .subscribe((response: {}) =>
                expect(response).toBe(emptyResponseBody));

        req = httpMock.expectOne(markAsReadUrl);
        expect(req.request.method).toBe('POST');
        req.flush(emptyResponseBody);
    }));

    it('should call markAsSeen and return empty object', waitForAsync(() => {
        notificationService
            .markAsSeen(firstNotificationDate)
            .subscribe((response: {}) =>
                expect(response).toBe(emptyResponseBody));

        req = httpMock.expectOne(markAsSeenUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({lastSeen: firstNotificationDate});
        req.flush(emptyResponseBody);
    }));
});
