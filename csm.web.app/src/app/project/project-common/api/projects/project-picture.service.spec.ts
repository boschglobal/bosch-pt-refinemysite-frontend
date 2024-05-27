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
import {PROJECT_PICTURE_1} from '../../../../../test/mocks/project-picture';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {ProjectPictureService} from './project-picture.service';
import {ProjectResource} from './resources/project.resource';
import {ProjectPictureResource} from './resources/project-picture.resource';

describe('Project Picture Service', () => {
    let projectPictureService: ProjectPictureService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const project: ProjectResource = MOCK_PROJECT_1;
    const projectPicture: ProjectPictureResource = PROJECT_PICTURE_1;

    const picture: File = new File([''], 'filename');
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const projectPictureServiceUrl = `${baseUrl}/projects/${project.id}/picture`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectPictureService = TestBed.inject(ProjectPictureService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call upload and return a project picture', waitForAsync(() => {
        projectPictureService
            .upload(project.id, picture)
            .subscribe((response: ProjectPictureResource) =>
                expect(response).toEqual(projectPicture));

        request = httpMock.expectOne(projectPictureServiceUrl);
        request.flush(projectPicture);
    }));

    it('should call findByProjectId and return a project picture', waitForAsync(() => {
        projectPictureService
            .findByProjectId(project.id)
            .subscribe((response: ProjectPictureResource) =>
                expect(response).toEqual(projectPicture));

        request = httpMock.expectOne(projectPictureServiceUrl);
        request.flush(projectPicture);
    }));

    it('should call remove and return a project picture', waitForAsync(() => {
        projectPictureService
            .remove(project.id)
            .subscribe((response: ProjectPictureResource) =>
                expect(response).toEqual(projectPicture));

        request = httpMock.expectOne(projectPictureServiceUrl);
        request.flush(projectPicture);
    }));
});
