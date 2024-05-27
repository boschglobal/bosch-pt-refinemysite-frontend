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
    waitForAsync,
} from '@angular/core/testing';

import {ApiVersionsEnum} from '../../../configurations/api/api-versions.enum';
import {configuration} from '../../../configurations/configuration.local-with-dev-backend';
import {
    TEST_USER_RESOURCE_REGISTERED,
    TEST_USER_RESOURCE_UNREGISTERED
} from '../../../test/mocks/user';
import {LanguageEnum} from '../../shared/translation/helper/language.enum';
import {SaveUserResource} from './resources/save-user.resource';
import {UserResource} from './resources/user.resource';
import {
    LANGUAGE_LOCALE_MAP,
    UserService,
} from './user.service';

describe('User Service', () => {
    let userService: UserService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const userDataRegistered: UserResource = TEST_USER_RESOURCE_REGISTERED;
    const userDataUnregistered: UserResource = TEST_USER_RESOURCE_UNREGISTERED;
    const userVersion: number = userDataRegistered.version;
    const saveUserResource: SaveUserResource = {
        gender: userDataRegistered.gender,
        firstName: userDataRegistered.firstName,
        lastName: userDataRegistered.lastName,
        position: userDataRegistered.position,
        craftIds: [],
        phoneNumbers: userDataRegistered.phoneNumbers,
    };
    const saveUserResourceWithLanguage = {
        ...saveUserResource,
        locale: LanguageEnum.PT,
    };
    const saveUserResourceWithFullLocale = {
        ...saveUserResource,
        locale: LANGUAGE_LOCALE_MAP[LanguageEnum.PT],
    };
    const userResourceWithLanguage = {
        ...userDataRegistered,
        locale: LanguageEnum.PT,

    };
    const userResourceWithFullLocale = {
        ...userDataRegistered,
        locale: LANGUAGE_LOCALE_MAP[LanguageEnum.PT],
    };

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.User}`;
    const createUrl = `${baseUrl}/users/current`;
    const findUrl = `${baseUrl}/users/current`;
    const updateUrl = `${baseUrl}/users/current`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        userService = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call create() and return created user', waitForAsync(() => {
        const createUserPayload: SaveUserResource = Object.assign({}, saveUserResource, {
            eulaAccepted: true,
        });

        userService.create(createUserPayload)
            .subscribe((response: UserResource) =>
                expect(response).toEqual(userDataRegistered));

        req = httpMock.expectOne(createUrl);
        expect(req.request.method).toBe('POST');
        req.flush(userDataRegistered);
    }));

    it('should call findCurrent() and return a user unregistered', waitForAsync(() => {
        userService
            .findCurrent()
            .subscribe((response: UserResource) => {
                expect(response).toEqual(userDataUnregistered);
            });

        req = httpMock.expectOne(findUrl);
        expect(req.request.method).toBe('GET');
        req.flush(userDataUnregistered);
    }));

    it('should call update() and return a user registered', waitForAsync(() => {
        userService
            .update(userVersion, saveUserResource)
            .subscribe((response: UserResource) => {
                expect(response).toEqual(userDataRegistered);
            });

        req = httpMock.expectOne(updateUrl);
        expect(req.request.method).toBe('PUT');
        req.flush(userDataRegistered);
    }));

    it('should map the user language to a full local when create is called', () => {
        userService.create(saveUserResourceWithLanguage)
            .subscribe((response: UserResource) =>
                expect(response).toEqual(userResourceWithLanguage));

        req = httpMock.expectOne(createUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(saveUserResourceWithFullLocale);
        req.flush(userResourceWithFullLocale);
    });

    it('should map the user language to a full local when update is called', () => {
        userService.update(userVersion, saveUserResourceWithLanguage)
            .subscribe((response: UserResource) =>
                expect(response).toEqual(userResourceWithLanguage));

        req = httpMock.expectOne(updateUrl);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(saveUserResourceWithFullLocale);
        req.flush(userResourceWithFullLocale);
    });

    it('should map the user full locale to a language when findCurrent is called', () => {
        userService.findCurrent()
            .subscribe((response: UserResource) =>
                expect(response).toEqual(userResourceWithLanguage));

        req = httpMock.expectOne(findUrl);
        expect(req.request.method).toBe('GET');
        req.flush(userResourceWithFullLocale);
    });
});
