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
import {provideMockActions} from '@ngrx/effects/testing';
import {
    Observable,
    of,
    ReplaySubject,
    throwError
} from 'rxjs';

import {LanguageEnum} from '../../../shared/translation/helper/language.enum';
import {LegalDocumentListResource} from '../../api/resources/user-legal-documents-list.resource';
import {UserLegalDocumentsService} from '../../api/user-legal-documents.service';
import {CountryEnum} from '../../user-common/enums/country.enum';
import {LegalDocumentsActions} from './legal-documents.actions';
import {LegalDocumentsEffects} from './legal-documents.effects';

describe('Legal Documents Effects', () => {
    let legalDocumentsService: jasmine.SpyObj<UserLegalDocumentsService>;
    let legalDocumentsEffects: LegalDocumentsEffects;
    let actions: ReplaySubject<any>;

    const errorResponse: Observable<any> = throwError('error');
    const emptyResponse: Observable<{}> = of({});

    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockActions(() => actions),
            {
                provide: UserLegalDocumentsService,
                useValue: jasmine.createSpyObj('UserLegalDocumentsService', [
                    'findCurrent',
                    'findUnregistered',
                    'consents',
                    'delayConsent',
                ]),
            },
            LegalDocumentsEffects,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        legalDocumentsEffects = TestBed.inject(LegalDocumentsEffects);
        legalDocumentsService = TestBed.inject(UserLegalDocumentsService) as jasmine.SpyObj<UserLegalDocumentsService>;
        actions = new ReplaySubject(1);
    });

    it('should trigger a LegalDocumentsActions.Request.AllFullfilled action after requesting current legal documents successfully', () => {
        const legalDocuments = new LegalDocumentListResource();
        const expectedResult = new LegalDocumentsActions.Request.AllFulfilled(legalDocuments);

        legalDocumentsService.findCurrent.and.returnValue(of(legalDocuments));

        actions.next(new LegalDocumentsActions.Request.All());
        legalDocumentsEffects.findCurrent$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a LegalDocumentsActions.Request.AllRejected action after requesting current legal documents failed', () => {
        const expectedResult = new LegalDocumentsActions.Request.AllRejected();

        legalDocumentsService.findCurrent.and.returnValue(errorResponse);

        actions.next(new LegalDocumentsActions.Request.All());
        legalDocumentsEffects.findCurrent$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a LegalDocumentsActions.Request.UnregisteredAllFulfilled action after' +
    'requesting unregistered legal documents successfully', () => {
        const country = CountryEnum.PT;
        const locale = LanguageEnum.PT;
        const legalDocuments = new LegalDocumentListResource();
        const expectedResult = new LegalDocumentsActions.Request.UnregisteredAllFulfilled(legalDocuments);

        legalDocumentsService.findUnregistered.and.returnValue(of(legalDocuments));

        actions.next(new LegalDocumentsActions.Request.UnregisteredAll(country, locale));
        legalDocumentsEffects.findUnregistered$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a LegalDocumentsActions.Request.UnregisteredAllRejected action after' +
    'requesting unregistered legal documents failed', () => {
        const country = CountryEnum.PT;
        const locale = LanguageEnum.PT;
        const expectedResult = new LegalDocumentsActions.Request.UnregisteredAllRejected();

        legalDocumentsService.findUnregistered.and.returnValue(errorResponse);

        actions.next(new LegalDocumentsActions.Request.UnregisteredAll(country, locale));
        legalDocumentsEffects.findUnregistered$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a LegalDocumentsActions.Consent.AllFulfilled action after consent all documents successfully', () => {
        const ids = ['123', '456'];
        const expectedResult = new LegalDocumentsActions.Consent.AllFulfilled();

        legalDocumentsService.consents.and.returnValue(emptyResponse);

        actions.next(new LegalDocumentsActions.Consent.All(ids));
        legalDocumentsEffects.consents$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a LegalDocumentsActions.Consent.AllRejected action after consent all documents failed', () => {
        const ids = ['123', '456'];
        const expectedResult = new LegalDocumentsActions.Consent.AllRejected();

        legalDocumentsService.consents.and.returnValue(errorResponse);

        actions.next(new LegalDocumentsActions.Consent.All(ids));
        legalDocumentsEffects.consents$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a LegalDocumentsActions.Consent.DelayFulfilled action after delay documents successfully', () => {
        const expectedResult = new LegalDocumentsActions.Consent.DelayFulfilled();

        legalDocumentsService.delayConsent.and.returnValue(emptyResponse);

        actions.next(new LegalDocumentsActions.Consent.Delay());
        legalDocumentsEffects.delayConsent$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a LegalDocumentsActions.Consent.DelayRejected action after delay documents failed', () => {
        const expectedResult = new LegalDocumentsActions.Consent.DelayRejected();

        legalDocumentsService.delayConsent.and.returnValue(errorResponse);

        actions.next(new LegalDocumentsActions.Consent.Delay());
        legalDocumentsEffects.delayConsent$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });
});
