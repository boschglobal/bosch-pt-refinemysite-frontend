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
    TestRequest
} from '@angular/common/http/testing';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../../configurations/configuration.local-with-dev-backend';
import {
    MOCK_CREATE_PROJECT_CRAFT,
    MOCK_PROJECT_CRAFT_B,
    MOCK_PROJECT_CRAFT_LIST,
    MOCK_SAVE_PROJECT_CRAFT,
    MOCK_SAVE_PROJECT_CRAFT_LIST
} from '../../../../../test/mocks/crafts';
import {ProjectCraftService} from './project-craft.service';
import {ProjectCraftResource} from './resources/project-craft.resource';
import {ProjectCraftListResource} from './resources/project-craft-list.resource';

describe('Project Craft Service', () => {
    let projectCraftService: ProjectCraftService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const projectId = '1234';
    const craftId = '1234';
    const craftVersion = 0;
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const createUrl = `${baseUrl}/projects/${projectId}/crafts`;
    const updateUrl = `${baseUrl}/projects/${projectId}/crafts/${craftId}`;
    const deleteUrl = `${baseUrl}/projects/${projectId}/crafts/${craftId}`;
    const updateListUrl = `${baseUrl}/projects/${projectId}/crafts`;
    const findAllParamUrl = `${baseUrl}/projects/${projectId}/crafts`;
    const emptyResponseBody = {};

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectCraftService = TestBed.inject(ProjectCraftService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findAll and return a craft list', waitForAsync(() => {
        projectCraftService.findAll(projectId)
            .subscribe((response: ProjectCraftListResource) =>
                expect(response).toEqual(MOCK_PROJECT_CRAFT_LIST));

        req = httpMock.expectOne(findAllParamUrl);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_PROJECT_CRAFT_LIST);
    }));

    it('should call create and create a craft', waitForAsync(() => {
        projectCraftService.create(projectId, MOCK_SAVE_PROJECT_CRAFT, craftVersion)
            .subscribe((response: ProjectCraftListResource) => {
                expect(response).toEqual(MOCK_PROJECT_CRAFT_LIST);
            });

        req = httpMock.expectOne(createUrl);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_PROJECT_CRAFT_LIST);
    }));

    it('should call update and return a craft', waitForAsync(() => {
        projectCraftService.update(projectId, craftId, MOCK_CREATE_PROJECT_CRAFT, craftVersion)
            .subscribe((response: ProjectCraftResource) =>
                expect(response).toEqual(MOCK_PROJECT_CRAFT_B));

        req = httpMock.expectOne(updateUrl);
        expect(req.request.method).toBe('PUT');
        req.flush(MOCK_PROJECT_CRAFT_B);
    }));

    it('should call delete and delete a craft', waitForAsync(() => {
        projectCraftService.delete(projectId, craftId, craftVersion)
            .subscribe((response: {}) =>
                expect(response).toEqual(emptyResponseBody));

        req = httpMock.expectOne(deleteUrl);
        expect(req.request.method).toBe('DELETE');
        req.flush(emptyResponseBody);
    }));

    it('should call updateList and return updated crafts list', waitForAsync(() => {
        projectCraftService.updateList(projectId, MOCK_SAVE_PROJECT_CRAFT_LIST, craftVersion)
            .subscribe((response: ProjectCraftListResource) =>
                expect(response).toEqual(MOCK_PROJECT_CRAFT_LIST));

        req = httpMock.expectOne(updateListUrl);
        expect(req.request.method).toBe('PUT');
        req.flush(MOCK_PROJECT_CRAFT_LIST);
    }));
});
