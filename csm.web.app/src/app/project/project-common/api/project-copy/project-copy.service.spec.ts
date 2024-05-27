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
import {MOCK_PROJECT_COPY_RESOURCE_1} from '../../../../../test/mocks/project-copy';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {AbstractResource} from '../../../../shared/misc/api/resources/abstract.resource';
import {ProjectCopyService} from './project-copy.service';

describe('Project Copy Service', () => {
    let projectCopyService: ProjectCopyService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const jobId = 'foo';
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const copyUrl = `${baseUrl}/projects/${MOCK_PROJECT_1.id}/copy`;
    const response: AbstractResource = {id: jobId};

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
        providers: [ProjectCopyService],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectCopyService = TestBed.inject(ProjectCopyService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call copy and create a project copy', waitForAsync(() => {
        projectCopyService
            .copyOne(MOCK_PROJECT_1.id, MOCK_PROJECT_COPY_RESOURCE_1)
            .subscribe(result => expect(result.id).toBe(jobId));

        req = httpMock.expectOne(copyUrl);
        expect(req.request.method).toBe('POST');
        req.flush(response);
    }));
});
