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

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../../configurations/configuration.local-with-dev-backend';
import {
    MOCK_SAVE_WORKAREA,
    MOCK_SAVE_WORKAREA_LIST,
    MOCK_WORKAREA_A,
    MOCK_WORKAREAS_LIST
} from '../../../../../test/mocks/workareas';
import {WorkareaResource} from './resources/workarea.resource';
import {WorkareaListResource} from './resources/workarea-list.resource';
import {WorkareaService} from './workarea.service';

describe('Workarea Service', () => {
    let workareaService: WorkareaService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const projectId = '1234';
    const workareaId = '1234';
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const createUrl = `${baseUrl}/projects/workareas`;
    const updateListUrl = `${baseUrl}/projects/workareas`;
    const deleteUrl = `${baseUrl}/projects/workareas/${workareaId}`;
    const updateUrl = `${baseUrl}/projects/workareas/${workareaId}`;
    const findAllParamUrl = `${baseUrl}/projects/${projectId}/workareas`;
    const version = 1;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        workareaService = TestBed.inject(WorkareaService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findAll and return a workarea list', waitForAsync(() => {
        workareaService.findAll(projectId)
            .subscribe((response: WorkareaListResource) =>
                expect(response).toEqual(MOCK_WORKAREAS_LIST));

        req = httpMock.expectOne(findAllParamUrl);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_WORKAREAS_LIST);
    }));

    it('should call create and return created workarea', waitForAsync(() => {
        workareaService.create(MOCK_SAVE_WORKAREA, version)
            .subscribe((response: WorkareaListResource) =>
                expect(response).toEqual(MOCK_WORKAREAS_LIST));

        req = httpMock.expectOne(createUrl);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_WORKAREAS_LIST);
    }));

    it('should call delete and return updated workarea list without deleted workarea', waitForAsync(() => {
        workareaService.delete(workareaId, version)
            .subscribe((response: WorkareaListResource) =>
                expect(response).toEqual(MOCK_WORKAREAS_LIST));

        req = httpMock.expectOne(deleteUrl);
        expect(req.request.method).toBe('DELETE');
        req.flush(MOCK_WORKAREAS_LIST);
    }));

    it('should call update and return updated workarea', waitForAsync(() => {
        workareaService.update(workareaId, MOCK_SAVE_WORKAREA)
            .subscribe((response: WorkareaResource) =>
                expect(response).toEqual(MOCK_WORKAREA_A));

        req = httpMock.expectOne(updateUrl);
        expect(req.request.method).toBe('PUT');
        req.flush(MOCK_WORKAREA_A);
    }));

    it('should call updateList and return updated workarea list', waitForAsync(() => {
        workareaService.updateList(MOCK_SAVE_WORKAREA_LIST, version)
            .subscribe((response: WorkareaListResource) =>
                expect(response).toEqual(MOCK_WORKAREAS_LIST));

        req = httpMock.expectOne(updateListUrl);
        expect(req.request.method).toBe('PUT');
        req.flush(MOCK_WORKAREAS_LIST);
    }));
});
