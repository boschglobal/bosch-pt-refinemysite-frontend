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
import {MOCK_MESSAGE_FILE_1} from '../../../../../test/mocks/message-files';
import {AttachmentService} from '../attachments/attachment.service';
import {AttachmentResource} from '../attachments/resources/attachment.resource';
import {TopicAttachmentService} from './topic-attachment.service';

describe('Project Task Topic File Service', () => {
    let topicFileService: TopicAttachmentService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const testDataTopicId = '123';
    const testDataFile: File = new File([''], 'filename');
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const uploadUrl = `${baseUrl}/projects/tasks/topics/${testDataTopicId}/attachments`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
        providers: [
            AttachmentService,
            TopicAttachmentService
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        topicFileService = TestBed.inject(TopicAttachmentService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should return the attachment resource from upload', waitForAsync(() => {
        topicFileService
            .upload(testDataTopicId, testDataFile)
            .subscribe((response: AttachmentResource) =>
                expect(response).toBe(MOCK_MESSAGE_FILE_1));

        request = httpMock.expectOne(uploadUrl);
        request.flush(MOCK_MESSAGE_FILE_1);
    }));
});
