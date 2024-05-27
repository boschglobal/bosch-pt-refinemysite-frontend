/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
    MOCK_SAVE_TASK_CONSTRAINTS_RESOURCE,
    MOCK_TASK_CONSTRAINTS_RESOURCE
} from '../../../../../test/mocks/task-constraints';
import {TaskConstraintsService} from './task-constraints.service';

describe('Task Constraints Service', () => {
    let taskConstraintsService: TaskConstraintsService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const projectId = 'project-id';
    const taskId = 'task-id';
    const version = 1;

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const updateOne = `${baseUrl}/projects/${projectId}/tasks/${taskId}/constraints`;
    const findOne = `${baseUrl}/projects/${projectId}/tasks/${taskId}/constraints`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        taskConstraintsService = TestBed.inject(TaskConstraintsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should call findOne and return a Task Constraint Resource', waitForAsync(() => {
        taskConstraintsService.findOne(projectId, taskId)
            .subscribe(response => expect(response).toEqual(MOCK_TASK_CONSTRAINTS_RESOURCE));

        req = httpMock.expectOne(findOne);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_TASK_CONSTRAINTS_RESOURCE);
    }));

    it('should call updateOne and return a Task Constraint Resource', waitForAsync(() => {
        taskConstraintsService.updateOne(projectId, taskId, MOCK_SAVE_TASK_CONSTRAINTS_RESOURCE, version)
            .subscribe(response => expect(response).toEqual(MOCK_TASK_CONSTRAINTS_RESOURCE));

        req = httpMock.expectOne(updateOne);
        expect(req.request.method).toBe('PUT');
        req.flush(MOCK_TASK_CONSTRAINTS_RESOURCE);
    }));
});
