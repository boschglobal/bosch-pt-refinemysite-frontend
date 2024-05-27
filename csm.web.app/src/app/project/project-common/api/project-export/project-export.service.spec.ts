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

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {AbstractResource} from '../../../../shared/misc/api/resources/abstract.resource';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {ProjectExportFormatEnum} from '../../enums/project-export-format.enum';
import {ProjectExportSchedulingTypeEnum} from '../../enums/project-export-scheduling-type.enum';
import {ProjectExportService} from './project-export.service';
import {ProjectExportResource} from './resources/project-export.resource';

describe('Project Export Service', () => {
    let projectExportService: ProjectExportService;
    let httpMock: HttpTestingController;
    let req: TestRequest;
    const _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    const projectId = 'foo';
    const exportResource: ProjectExportResource = {
        format: ProjectExportFormatEnum.MSProject,
        includeComments: false,
        milestoneExportSchedulingType: ProjectExportSchedulingTypeEnum.ManuallyScheduled,
        taskExportSchedulingType: ProjectExportSchedulingTypeEnum.AutoScheduled,
    };
    const jobId = 'foo';
    const response: AbstractResource = {id: jobId};
    const url = _apiUrlHelper
        .withPath(`projects/${projectId}/export`)
        .build();

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
        providers: [ProjectExportService],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectExportService = TestBed.inject(ProjectExportService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call getFile and return a job id', () => {

        projectExportService
            .getFile(projectId, exportResource)
            .subscribe(result => expect(result.id).toBe(jobId));

        req = httpMock.expectOne(url);
        expect(req.request.method).toBe('POST');
        req.flush(response);
    });
});
