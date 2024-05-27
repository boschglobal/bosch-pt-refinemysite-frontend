/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    Observable,
    of,
    ReplaySubject,
    throwError
} from 'rxjs';
import {first} from 'rxjs/operators';

import {ANNOUNCEMENTS_LIST_MOCK} from '../../../../test/mocks/announcements';
import {MockStore} from '../../../../test/mocks/store';
import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {State} from '../../../app.reducers';
import {AnnouncementsService} from '../api/announcements.service';
import {AnnouncementListResource} from '../api/resources/announcement-list.resource';
import {AlertActions} from './alert.actions';
import {
    AlertEffects,
    REQUEST_ANNOUNCEMENTS_PERIOD
} from './alert.effects';
import SpyObj = jasmine.SpyObj;

describe('Alert Effects', () => {
    let alertEffects: AlertEffects;
    let announcementsService: SpyObj<AnnouncementsService>;
    let translateService: TranslateService;
    let actions: ReplaySubject<AlertActions>;

    const languageDEIdentifier = 'de';
    const languageENIdentifier = 'en';
    const errorResponse: Observable<never> = throwError('error');
    const findAllAnnouncementResponse: Observable<AnnouncementListResource> = of(ANNOUNCEMENTS_LIST_MOCK);
    const readAnnouncementId = '591fffce-d4ba-4cd9-a150-ae71e23715df';

    const initialState: Pick<State, 'alertSlice'> = {
        alertSlice: {
            alerts: [],
            announcements: ANNOUNCEMENTS_LIST_MOCK.items,
            readAnnouncements: [
                readAnnouncementId,
            ],
        },
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockActions(() => actions),
            AlertEffects,
            {
                provide: AnnouncementsService,
                useValue: jasmine.createSpyObj('AnnouncementsService', ['findAll', 'getReadAnnouncements', 'setAnnouncementsHasRead']),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
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
        alertEffects = TestBed.inject(AlertEffects);
        announcementsService = TestBed.inject(AnnouncementsService) as jasmine.SpyObj<AnnouncementsService>;
        translateService = TestBed.inject(TranslateService);

        actions = new ReplaySubject(1);
    });

    afterEach(() => {
        translateService.setDefaultLang(languageENIdentifier);
        announcementsService.findAll.calls.reset();
    });

    it('should trigger a AlertActions.Add.Announcements action after requesting announcements successfully due to interval',
        fakeAsync(() => {
            const expectedResult = new AlertActions.Add.Announcements(ANNOUNCEMENTS_LIST_MOCK);

            announcementsService.findAll.and.returnValue(findAllAnnouncementResponse);

            alertEffects.requestAnnouncements$.pipe(
                first(),
            ).subscribe(result => {
                expect(result).toEqual(expectedResult);
            });

            tick(REQUEST_ANNOUNCEMENTS_PERIOD);
        }));

    it('should trigger a AlertActions.Add.Announcements action after requesting announcements successfully due to language change', () => {
        const expectedResult = new AlertActions.Add.Announcements(ANNOUNCEMENTS_LIST_MOCK);

        announcementsService.findAll.and.returnValue(findAllAnnouncementResponse);
        alertEffects.requestAnnouncements$.pipe(
            first(),
        ).subscribe(result => {
            expect(result).toEqual(expectedResult);
        });

        translateService.setDefaultLang(languageDEIdentifier);
    });

    it('should trigger a AlertActions.Remove.AllAnnouncements action after requesting announcements has failed', () => {
        const expectedResult = new AlertActions.Remove.AllAnnouncements();

        announcementsService.findAll.and.returnValue(errorResponse);
        alertEffects.requestAnnouncements$.pipe(
            first(),
        ).subscribe(result => {
            expect(result).toEqual(expectedResult);
        });

        translateService.setDefaultLang(languageDEIdentifier);
    });

    it('should trigger AlertActions.Request.ReadAnnouncementsFulfilled when requesting read announcements has succeeded', () => {
        const expectedResult = new AlertActions.Request.ReadAnnouncementsFulfilled(initialState.alertSlice.readAnnouncements);

        announcementsService.getReadAnnouncements.and.returnValue(of(initialState.alertSlice.readAnnouncements));

        actions.next(new AlertActions.Request.ReadAnnouncements());

        alertEffects.requestReadAnnouncements$.subscribe(result =>
            expect(result).toEqual(expectedResult)
        );
    });

    it('should trigger AlertActions.Request.ReadAnnouncementsRejected when requesting read announcements has failed', () => {
        const expectedResult = new AlertActions.Request.ReadAnnouncementsRejected();

        announcementsService.getReadAnnouncements.and.returnValue(errorResponse);

        actions.next(new AlertActions.Request.ReadAnnouncements());

        alertEffects.requestReadAnnouncements$.subscribe(result =>
            expect(result).toEqual(expectedResult)
        );
    });

    it('should trigger AlertActions.Set.AnnouncementHasReadFulfilled when set read announcement has succeeded', () => {
        const expectedResult = new AlertActions.Set.AnnouncementHasReadFulfilled(readAnnouncementId);

        announcementsService.setAnnouncementsHasRead.and.returnValue(of(initialState.alertSlice.readAnnouncements));

        actions.next(new AlertActions.Set.AnnouncementHasRead(readAnnouncementId));

        alertEffects.setAnnouncementHasRead$.subscribe(result =>
            expect(result).toEqual(expectedResult)
        );
    });

    it('should trigger AlertActions.Set.AnnouncementHasReadRejected when set read announcement has failed', () => {
        const expectedResult = new AlertActions.Set.AnnouncementHasReadRejected();

        announcementsService.setAnnouncementsHasRead.and.returnValue(errorResponse);

        actions.next(new AlertActions.Set.AnnouncementHasRead(readAnnouncementId));

        alertEffects.setAnnouncementHasRead$.subscribe(result =>
            expect(result).toEqual(expectedResult)
        );
    });
});
