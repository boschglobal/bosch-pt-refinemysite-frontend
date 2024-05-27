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
    MOCK_RESCHEDULE_JOB_ID_RESOURCE,
    MOCK_RESCHEDULE_RESOURCE,
    MOCK_SAVE_RESCHEDULE_RESOURCE
} from '../../../../../test/mocks/project-reschedule';
import {RescheduleService} from './reschedule.service';

describe('Reschedule Service', () => {
    let service: RescheduleService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const projectId = 'project-id';

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const validateUrl = `${baseUrl}/projects/${projectId}/reschedule/validate`;
    const rescheduleUrl = `${baseUrl}/projects/${projectId}/reschedule`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        service = TestBed.inject(RescheduleService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should return a POST request to the reschedule validation endpoint', waitForAsync(() => {
        service.validate(projectId, MOCK_SAVE_RESCHEDULE_RESOURCE)
            .subscribe((response) =>
                expect(response).toEqual(MOCK_RESCHEDULE_RESOURCE));

        req = httpMock.expectOne(validateUrl);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_RESCHEDULE_RESOURCE);
    }));

    it('should return a POST request to the reschedule endpoint', waitForAsync(() => {
        service.reschedule(projectId, MOCK_SAVE_RESCHEDULE_RESOURCE)
            .subscribe((response) =>
                expect(response).toEqual(MOCK_RESCHEDULE_JOB_ID_RESOURCE));

        req = httpMock.expectOne(rescheduleUrl);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_RESCHEDULE_JOB_ID_RESOURCE);
    }));
});
