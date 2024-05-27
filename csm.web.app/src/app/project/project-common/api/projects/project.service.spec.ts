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
import {TEST_PROJECT_LIST} from '../../../../../test/mocks/project-list';
import {
    MOCK_PROJECT_1,
    MOCK_SAVE_PROJECT
} from '../../../../../test/mocks/projects';
import {ProjectService} from './project.service';
import {ProjectResource} from './resources/project.resource';
import {ProjectListResource} from './resources/project-list.resource';
import {SaveProjectResource} from './resources/save-project.resource';

describe('Project Service', () => {
    let projectService: ProjectService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const project: ProjectResource = MOCK_PROJECT_1;
    const projectVersion: number = project.version;
    const projectId: string = project.id;
    const projectList: ProjectListResource = TEST_PROJECT_LIST;
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const projectServiceFindAllUrl = `${baseUrl}/projects`;
    const projectServiceFindOneUrl = `${baseUrl}/projects/${projectId}`;
    const projectServiceCreateUrl = `${baseUrl}/projects`;
    const projectServiceUpdateUrl = `${baseUrl}/projects/${projectId}`;
    const projectSave: SaveProjectResource = MOCK_SAVE_PROJECT;

    const findAllParamUrl = (pageNumber: number, size: number) => `${projectServiceFindAllUrl}?page=${pageNumber}&size=${size}`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectService = TestBed.inject(ProjectService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findOne and return a project', () => {
        projectService.findOne(projectId)
            .subscribe((response: ProjectResource) =>
                expect(response).toBe(project));

        request = httpMock.expectOne(projectServiceFindOneUrl);
        request.flush(project);
    });

    it('should call findAll and return a project list', () => {
        const pageNumber = 1;
        const pageSize = 20;

        projectService.findAll(pageNumber, pageSize)
            .subscribe((response: ProjectListResource) =>
                expect(response).toBe(projectList));

        request = httpMock.expectOne(findAllParamUrl(pageNumber, pageSize));
        request.flush(projectList);
    });

    it('should call create project and return a project', waitForAsync(() => {
        projectService.create(projectSave)
            .subscribe((response: ProjectResource) =>
                expect(response).toEqual(project));

        request = httpMock.expectOne(projectServiceCreateUrl);
        request.flush(project);
    }));

    it('should call update project and return project', waitForAsync(() => {
        projectService.update(projectSave, projectId, projectVersion)
            .subscribe((response: ProjectResource) =>
                expect(response).toEqual(project));

        request = httpMock.expectOne(projectServiceUpdateUrl);
        request.flush(project);
    }));
});
