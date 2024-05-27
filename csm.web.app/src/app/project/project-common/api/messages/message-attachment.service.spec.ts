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
import {AttachmentResource} from '../attachments/resources/attachment.resource';
import {MessageAttachmentService} from './message-attachment.service';

describe('Message Attachments Service', () => {
    let messageAttachmentService: MessageAttachmentService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const messageId = '123';
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const uploadUrl = `${baseUrl}/projects/tasks/topics/messages/${messageId}/attachments`;
    const testFile: File = new File(['file'], 'file');

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        messageAttachmentService = TestBed.inject(MessageAttachmentService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should return the attachment resource from upload', waitForAsync(() => {
        messageAttachmentService
            .upload(messageId, testFile)
            .subscribe((response: AttachmentResource) =>
                expect(response).toBe(MOCK_MESSAGE_FILE_1));

        request = httpMock.expectOne(uploadUrl);
        request.flush(MOCK_MESSAGE_FILE_1);
    }));
});
