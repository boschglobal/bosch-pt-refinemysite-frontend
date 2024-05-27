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
    waitForAsync,
} from '@angular/core/testing';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../../configurations/configuration.local-with-dev-backend';
import {
    MOCK_QUICK_FILTER_LIST,
    MOCK_QUICK_FILTER_RESOURCE,
    MOCK_SAVE_QUICK_FILTER,
} from '../../../../../test/mocks/quick-filters';
import {QuickFilterService} from './quick-filter.service';
import {QuickFilterResource} from './resources/quick-filter.resource';
import {QuickFilterListResource} from './resources/quick-filter-list.resource';

describe('Quick Filter Service', () => {
    let quickFilterService: QuickFilterService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const filterId = 'quick-filter-id';
    const projectId = 'project-id';
    const version = 0;

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const updateUrl = `${baseUrl}/projects/${projectId}/quickfilters/${filterId}`;
    const deleteUrl = `${baseUrl}/projects/${projectId}/quickfilters/${filterId}`;
    const createUrl = `${baseUrl}/projects/${projectId}/quickfilters`;
    const findAllUrl = `${baseUrl}/projects/${projectId}/quickfilters`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        quickFilterService = TestBed.inject(QuickFilterService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findAll and return a quick filter list', waitForAsync(() => {
        quickFilterService.findAll(projectId)
            .subscribe((response: QuickFilterListResource) =>
                expect(response).toEqual(MOCK_QUICK_FILTER_LIST));

        req = httpMock.expectOne(findAllUrl);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_QUICK_FILTER_LIST);
    }));

    it('should call create and return created quick filter', waitForAsync(() => {
        quickFilterService.create(projectId, MOCK_SAVE_QUICK_FILTER)
            .subscribe((response: QuickFilterResource) =>
                expect(response).toEqual(MOCK_QUICK_FILTER_RESOURCE));

        req = httpMock.expectOne(createUrl);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_QUICK_FILTER_RESOURCE);
    }));

    it('should call update and return updated quick filter', waitForAsync(() => {
        quickFilterService.update(projectId, filterId, MOCK_SAVE_QUICK_FILTER, version)
            .subscribe((response: QuickFilterResource) =>
                expect(response).toEqual(MOCK_QUICK_FILTER_RESOURCE));

        req = httpMock.expectOne(updateUrl);
        expect(req.request.method).toBe('PUT');
        req.flush(MOCK_QUICK_FILTER_RESOURCE);
    }));

    it('should call delete and return nothing', waitForAsync(() => {
        quickFilterService.delete(projectId, filterId, version)
            .subscribe((response: void) =>
                expect(response).toEqual(null));

        req = httpMock.expectOne(deleteUrl);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    }));
});
