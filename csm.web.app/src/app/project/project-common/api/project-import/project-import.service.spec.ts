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
import {configuration} from '../../../../../configurations/configuration.local-with-dev-backend';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {AbstractResource} from '../../../../shared/misc/api/resources/abstract.resource';
import {ProjectImportService} from './project-import.service';
import {ProjectImportAnalyzeResource} from './resources/project-import-analyze.resource';
import {ProjectImportUploadResource} from './resources/project-import-upload.resource';
import {SaveProjectImportAnalyzeResource} from './resources/save-project-import-analyze.resource';

describe('Project Import Service', () => {
    let projectImportService: ProjectImportService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const projectImportServiceUploadUrl = `${baseUrl}/projects/${MOCK_PROJECT_1.id}/import/upload`;
    const projectImportServiceAnalyzeUrl = `${baseUrl}/projects/${MOCK_PROJECT_1.id}/import/analyze`;
    const projectImportServiceImportUrl = `${baseUrl}/projects/${MOCK_PROJECT_1.id}/import`;
    const testDataFile: File = new File([''], 'filename');

    const projectImportUploadResponse: ProjectImportUploadResource = {
        id: '228b6a6e-6379-446b-b817-84e8616e3156',
        columns: [{
            name: 'Resource Names',
            columnType: 'Project',
            fieldType: 'RESOURCE_NAMES',
        }],
    };
    const projectImportAnalyzeResponse: ProjectImportAnalyzeResource = {
        id: '17a536b3-5e88-423c-bf48-8f0763668ac4',
        version: 1,
        validationResults: [],
        statistics: {
            workAreas: 0,
            crafts: 2,
            tasks: 1,
            milestones: 0,
            relations: 0,
        },
    };
    const testDataAnalyzeParams: SaveProjectImportAnalyzeResource = {
        readWorkAreasHierarchically: false,
        craftColumn: {
            columnType: 'Project',
            fieldType: 'NAME',
        },
    };
    const projectImportResponse = {id: '228b6a6e-6379-446b-b817-84e8616e3156'};

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectImportService = TestBed.inject(ProjectImportService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call upload and return a response', () => {
        projectImportService.upload(MOCK_PROJECT_1.id, testDataFile)
            .subscribe((response: ProjectImportUploadResource) =>
                expect(response).toBe(projectImportUploadResponse));

        request = httpMock.expectOne(projectImportServiceUploadUrl);
        request.flush(projectImportUploadResponse);
    });

    it('should call analyze and return a response', () => {
        projectImportService.analyze(MOCK_PROJECT_1.id, testDataAnalyzeParams, MOCK_PROJECT_1.version)
            .subscribe((response: ProjectImportAnalyzeResource) =>
                expect(response).toBe(projectImportAnalyzeResponse));

        request = httpMock.expectOne(projectImportServiceAnalyzeUrl);
        request.flush(projectImportAnalyzeResponse);
    });

    it('should call import and return a response', () => {
        projectImportService.import(MOCK_PROJECT_1.id, MOCK_PROJECT_1.version)
            .subscribe((response: AbstractResource) =>
                expect(response).toBe(projectImportResponse));

        request = httpMock.expectOne(projectImportServiceImportUrl);
        request.flush(projectImportResponse);
    });
});
