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
    MOCK_UPDATE_WORK_DAYS_PAYLOAD,
    MOCK_WORK_DAYS
} from '../../../../../test/mocks/workdays';
import {WorkDaysResource} from './resources/work-days.resource';
import {WorkDaysService} from './work-days.service';

describe('Work Days Service', () => {
    let workDaysService: WorkDaysService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const projectId = 'project-id';
    const version = 0;

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const workdaysUrl = `${baseUrl}/projects/${projectId}/workdays`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        workDaysService = TestBed.inject(WorkDaysService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findAll and return a work day resource', waitForAsync(() => {
        workDaysService.findAll(projectId)
            .subscribe((response: WorkDaysResource) =>
                expect(response).toEqual(MOCK_WORK_DAYS));

        req = httpMock.expectOne(workdaysUrl);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_WORK_DAYS);
    }));

    it('should call update and return updated work day resource', waitForAsync(() => {
        workDaysService.update(projectId, MOCK_UPDATE_WORK_DAYS_PAYLOAD, version)
            .subscribe((response: WorkDaysResource) =>
                expect(response).toEqual(MOCK_WORK_DAYS));

        req = httpMock.expectOne(workdaysUrl);
        expect(req.request.method).toBe('PUT');
        req.flush(MOCK_WORK_DAYS);
    }));
});
