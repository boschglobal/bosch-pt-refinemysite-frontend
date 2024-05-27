/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {of} from 'rxjs';

import {
    MOCK_REALTIME_JOB_EVENT,
    MOCK_REALTIME_JOB_SERVER_RESOURCE,
    MOCK_REALTIME_NOTIFICATION_EVENT,
    MOCK_REALTIME_NOTIFICATION_SERVER_RESOURCE,
    MOCK_REALTIME_UPDATE_EVENT,
    MOCK_REALTIME_UPDATE_SERVER_RESOURCE
} from '../../../../test/mocks/realtime';
import {EventSourceServiceStub} from '../../../../test/stubs/event-source.service.stub';
import {UserQueries} from '../../../user/store/user/user.queries';
import {JobTypeEnum} from '../../jobs/api/enums/job-type.enum';
import {EventSourceService} from './event-source.service';
import {RealtimeService} from './realtime.service';

describe('Realtime Service', () => {
    let realtimeService: RealtimeService;
    let eventSourceService: EventSourceServiceStub;

    const moduleDef: TestModuleMetadata = {
        imports: [],
        providers: [
            RealtimeService,
            {
                provide: UserQueries,
                useValue: {
                    observeCurrentUser() {
                        return of(true);
                    },
                },
            },
            {
                provide: EventSourceService,
                useClass: EventSourceServiceStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        realtimeService = TestBed.inject(RealtimeService);
        eventSourceService = TestBed.inject<EventSourceServiceStub>(EventSourceService as any);
    });

    it('should be created', () => {
        expect(realtimeService).toBeTruthy();
    });

    it('should open only one connection when getUpdateEvents is called more than one time', () => {
        spyOn(eventSourceService, 'connect').and.callThrough();

        realtimeService.getUpdateEvents().subscribe().unsubscribe();
        realtimeService.getUpdateEvents().subscribe().unsubscribe();

        expect(eventSourceService.connect).toHaveBeenCalledTimes(1);
    });

    it('should emit openConnection when connection to the service is being handled', () => {
        const results = [];
        const subscription = realtimeService.openConnection$.subscribe(result => results.push(result));

        spyOn(eventSourceService, 'connect').and.callThrough();

        realtimeService.getUpdateEvents().subscribe().unsubscribe();

        expect(results.length).toBe(1);
        expect(results[0]).toBeUndefined();
        expect(eventSourceService.connect).toHaveBeenCalled();
        subscription.unsubscribe();
    });

    it('should call getUpdateEvents and get events', () => {
        eventSourceService.dispatchMessage(MOCK_REALTIME_UPDATE_SERVER_RESOURCE);

        realtimeService
            .getUpdateEvents()
            .subscribe(response => {
                expect(response).toEqual(MOCK_REALTIME_UPDATE_EVENT.data);
            }).unsubscribe();
    });

    it('should call getNotificationEvents and get events', () => {
        eventSourceService.dispatchMessage(MOCK_REALTIME_NOTIFICATION_SERVER_RESOURCE);

        realtimeService
            .getNotificationEvents()
            .subscribe(response => {
                expect(response).toEqual(MOCK_REALTIME_NOTIFICATION_EVENT.data);
            }).unsubscribe();
    });

    it('should expose onopen events in open$ stream', () => {
        const event = new MessageEvent('open');

        realtimeService.getUpdateEvents().subscribe().unsubscribe();
        realtimeService
            .open$
            .subscribe(response => {
                expect(response).toEqual(event);
            });

        eventSourceService.dispatchOpen(event);
    });

    it('should expose onerror events in error$ stream', () => {
        const event = new MessageEvent('error');

        realtimeService.getUpdateEvents().subscribe().unsubscribe();
        realtimeService
            .error$
            .subscribe(response => {
                expect(response).toEqual(event);
            });

        eventSourceService.dispatchError(event);
    });

    it('should call getJobEvents and receive jobs', () => {
        const results = [];

        eventSourceService.dispatchMessage(MOCK_REALTIME_JOB_SERVER_RESOURCE);

        const subscription = realtimeService
            .getJobEvents()
            .subscribe(result => results.push(result));

        expect(results.length).toBe(1);
        expect(results[0].job).toEqual(MOCK_REALTIME_JOB_EVENT.data);
        subscription.unsubscribe();
    });

    it('should call getJobEvents and filter received jobs by support types', () => {
        const results = [];
        const notSupportedRealTimeJobData = JSON.stringify({
            ...MOCK_REALTIME_JOB_EVENT.data,
            type: 'NOT_SUPPORTED_JOB' as JobTypeEnum,
        });
        const notSupportedRealTimeJobServerResponse = {
            ...MOCK_REALTIME_JOB_SERVER_RESOURCE,
            data: notSupportedRealTimeJobData,
        };

        eventSourceService.dispatchMessage(notSupportedRealTimeJobServerResponse);

        const subscription = realtimeService
            .getJobEvents()
            .subscribe(result => results.push(result));

        expect(results).toEqual([]);
        subscription.unsubscribe();
    });
});
