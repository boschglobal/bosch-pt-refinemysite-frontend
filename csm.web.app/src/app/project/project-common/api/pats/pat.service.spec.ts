/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    HttpClientTestingModule,
    HttpTestingController,
    TestRequest,
} from '@angular/common/http/testing';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../../configurations/configuration.local-with-dev-backend';
import {
    MOCK_PAT_LIST_RESOURCE,
    MOCK_PAT_RESOURCE,
    MOCK_SAVE_PAT_RESOURCE
} from '../../../../../test/mocks/pat';
import {PATService} from './pat.service';
import {PATResource} from './resources/pat.resource';
import {PATListResource} from './resources/pat-list.resource';

describe('PAT Service', () => {
    let patService: PATService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const patId = 'foo';
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.User}`;
    const findAllUrl = `${baseUrl}/users/current/pats`;
    const createUrl = `${baseUrl}/users/current/pats`;
    const updateUrl = `${baseUrl}/users/current/pats/${patId}`;
    const deleteUrl = `${baseUrl}/users/current/pats/${patId}`;
    const version = 1;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
        providers: [PATService],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        patService = TestBed.inject(PATService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findAll and return a PAT list', waitForAsync(() => {
        patService.findAll()
            .subscribe((response: PATListResource) =>
                expect(response).toEqual(MOCK_PAT_LIST_RESOURCE));

        req = httpMock.expectOne(findAllUrl);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_PAT_LIST_RESOURCE);
    }));

    it('should call create and create a PAT', waitForAsync(() => {
        patService.create(MOCK_SAVE_PAT_RESOURCE)
            .subscribe((response: PATResource) => {
                expect(response).toEqual(MOCK_PAT_RESOURCE);
            });

        req = httpMock.expectOne(createUrl);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_PAT_RESOURCE);
    }));

    it('should call update and return a PAT', waitForAsync(() => {
        patService.update(patId, MOCK_SAVE_PAT_RESOURCE, version)
            .subscribe((response: PATResource) =>
                expect(response).toEqual(MOCK_PAT_RESOURCE));

        req = httpMock.expectOne(updateUrl);
        expect(req.request.method).toBe('PUT');
        req.flush(MOCK_PAT_RESOURCE);
    }));

    it('should call delete and delete a PAT', waitForAsync(() => {
        patService.delete(patId, version)
            .subscribe((response: void) =>
                expect(response).toEqual(null));

        req = httpMock.expectOne(deleteUrl);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    }));
});
