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
    MOCK_TASK_FILE_1,
    MOCK_TASK_FILE_LIST
} from '../../../../../test/mocks/task-files';
import {AttachmentService} from '../attachments/attachment.service';
import {AttachmentResource} from '../attachments/resources/attachment.resource';
import {AttachmentListResource} from '../attachments/resources/attachment-list.resource';
import {TaskAttachmentService} from './task-attachment.service';

describe('Task Attachment Service', () => {
    let taskAttachmentService: TaskAttachmentService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const emptyResponseBody = {};
    const testDataAttachmentId = '159';
    const testDataTaskId = '456';
    const testDataFile: File = new File([''], 'filename');
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const deleteUrl = `${baseUrl}/projects/tasks/attachments/${testDataAttachmentId}`;
    const uploadUrl = `${baseUrl}/projects/tasks/${testDataTaskId}/attachments`;
    const getAllIncludingChildrenUrl = `${baseUrl}/projects/tasks/${testDataTaskId}/attachments?includeChildren=true`;
    const getAllNotIncludingChildrenUrl = `${baseUrl}/projects/tasks/${testDataTaskId}/attachments?includeChildren=false`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
        providers: [
            AttachmentService,
            TaskAttachmentService
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        taskAttachmentService = TestBed.inject(TaskAttachmentService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should delete an attachment by id', waitForAsync(() => {
        taskAttachmentService
            .delete(testDataAttachmentId)
            .subscribe((response: any) =>
                expect(response).toBe(emptyResponseBody));

        req = httpMock.expectOne(deleteUrl);
        expect(req.request.method).toBe('DELETE');
        req.flush(emptyResponseBody);
    }));

    it('should return the attachment resource from upload', waitForAsync(() => {
        taskAttachmentService
            .upload(testDataTaskId, testDataFile)
            .subscribe((response: AttachmentResource) =>
                expect(response).toBe(MOCK_TASK_FILE_1));

        req = httpMock.expectOne(uploadUrl);
        req.flush(MOCK_TASK_FILE_1);
    }));

    it('should call getAll and return attachments from task', waitForAsync(() => {
        taskAttachmentService
            .getAll(testDataTaskId)
            .subscribe((response: AttachmentListResource) =>
                expect(response).toBe(MOCK_TASK_FILE_LIST));

        req = httpMock.expectOne(getAllIncludingChildrenUrl);
        req.flush(MOCK_TASK_FILE_LIST);
    }));

    it('should call getAll and return attachments from task, with include children false', waitForAsync(() => {

        taskAttachmentService
            .getAll(testDataTaskId, false)
            .subscribe((response: AttachmentListResource) =>
                expect(response).toBe(MOCK_TASK_FILE_LIST));

        req = httpMock.expectOne(getAllNotIncludingChildrenUrl);
        req.flush(MOCK_TASK_FILE_LIST);
    }));
});
