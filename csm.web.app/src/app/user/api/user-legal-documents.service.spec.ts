/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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

import {ApiVersionsEnum} from '../../../configurations/api/api-versions.enum';
import {configuration} from '../../../configurations/configuration.local-with-dev-backend';
import {MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_LIST} from '../../../test/mocks/user-legal-documents';
import {ClientTypeEnum} from '../../shared/misc/enums/client-type.enum';
import {LanguageEnum} from '../../shared/translation/helper/language.enum';
import {CountryEnum} from '../user-common/enums/country.enum';
import {LegalDocumentListResource} from './resources/user-legal-documents-list.resource';
import {LANGUAGE_LOCALE_MAP} from './user.service';
import {UserLegalDocumentsService} from './user-legal-documents.service';

describe('User Legal Documents Service', () => {
    let userLegalDocumentsService: UserLegalDocumentsService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const userLegalDocumentsDataConsentedList: LegalDocumentListResource = MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_LIST;

    const country = CountryEnum.DE;
    const client = ClientTypeEnum.Web;
    const locale = LanguageEnum.EN;
    const fullLocale = LANGUAGE_LOCALE_MAP[locale];
    const id = '7d3acb63-5ff4-445f-9012-e33c24cfb449';
    const ids: string[] = [id, id];
    const emptyResponseBody = {};

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.User}`;
    const findCurrent = `${baseUrl}/users/current/documents?client=${client}`;
    const findUnregistered = `${baseUrl}/users/unregistered/documents?country=${country}&locale=${fullLocale}&client=${client}`;
    const consents = `${baseUrl}/users/current/consents`;
    const delayConsent = `${baseUrl}/users/current/documents/delay-consent`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        userLegalDocumentsService = TestBed.inject(UserLegalDocumentsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findCurrent() and return a list of documents', waitForAsync(() => {
        userLegalDocumentsService.findCurrent()
            .subscribe((response: LegalDocumentListResource) =>
                expect(response).toEqual(userLegalDocumentsDataConsentedList));

        req = httpMock.expectOne(findCurrent);
        expect(req.request.method).toBe('GET');
        req.flush(userLegalDocumentsDataConsentedList);
    }));

    it('should call findUnregistered() and return a list of documents', waitForAsync(() => {
        userLegalDocumentsService.findUnregistered(country, locale)
            .subscribe((response: LegalDocumentListResource) =>
                expect(response).toEqual(userLegalDocumentsDataConsentedList));

        req = httpMock.expectOne(findUnregistered);
        expect(req.request.method).toBe('GET');
        req.flush(userLegalDocumentsDataConsentedList);
    }));

    it('should call consents() return an empty object', waitForAsync(() => {
        userLegalDocumentsService.consents(ids)
            .subscribe((response: {}) =>
                expect(response).toEqual(emptyResponseBody));

        req = httpMock.expectOne(consents);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ids});
        req.flush(emptyResponseBody);
    }));

    it('should call delayConsent() return an empty object', waitForAsync(() => {
        userLegalDocumentsService.delayConsent()
            .subscribe((response: {}) =>
                expect(response).toEqual(emptyResponseBody));

        req = httpMock.expectOne(delayConsent);
        expect(req.request.method).toBe('POST');
        req.flush(emptyResponseBody);
    }));
});
