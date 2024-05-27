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
    MOCK_MESSAGE_1,
    MOCK_MESSAGE_LIST
} from '../../../../../test/mocks/messages';
import {MessageService} from './message.service';
import {MessageResource} from './resources/message.resource';
import {MessageListResource} from './resources/message-list.resource';

describe('Message Service', () => {
    let messageService: MessageService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const emptyResponseBody = {};
    const messageId: string = MOCK_MESSAGE_1.id;
    const testDataTopicId = '123';
    const testDataLastMessageId = '123';
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const findAllUrl = `${baseUrl}/projects/tasks/topics/${testDataTopicId}/messages?limit=2`;
    const findAllUrlWithLastMessageId = `${baseUrl}/projects/tasks/topics/${testDataTopicId}/messages?limit=10&before=${testDataLastMessageId}`;
    const findAllUrlWithLimit = `${baseUrl}/projects/tasks/topics/${testDataTopicId}/messages?limit=20`;
    const createUrl = `${baseUrl}/projects/tasks/topics/${testDataTopicId}/messages`;
    const findOneUrl = `${baseUrl}/projects/tasks/topics/messages/${messageId}`;
    const deleteUrl = `${baseUrl}/projects/tasks/topics/messages/${messageId}`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        messageService = TestBed.inject(MessageService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should validate the creation of message', waitForAsync(() => {
        messageService
            .create(testDataTopicId, MOCK_MESSAGE_1.content)
            .subscribe((response: MessageResource) =>
                expect(response).toEqual(MOCK_MESSAGE_1));

        req = httpMock.expectOne(createUrl);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_MESSAGE_1);
    }));

    it('should delete a message by id', waitForAsync(() => {
        messageService
            .delete(MOCK_MESSAGE_1.id)
            .subscribe((response: any) =>
                expect(response).toEqual(emptyResponseBody));

        req = httpMock.expectOne(deleteUrl);
        expect(req.request.method).toBe('DELETE');
        req.flush(emptyResponseBody);
    }));

    it('should call findAll and return a message list when lastMessageId is not passed as parameter', waitForAsync(() => {
        messageService
            .findAll(testDataTopicId)
            .subscribe((response: MessageListResource) =>
                expect(response).toEqual(MOCK_MESSAGE_LIST));

        req = httpMock.expectOne(findAllUrl);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_MESSAGE_LIST);
    }));

    it('should call findAll and return a message list when lastMessageId and limit are passed as parameter', waitForAsync(() => {
        messageService
            .findAll(testDataTopicId, testDataLastMessageId, 10)
            .subscribe((response: MessageListResource) =>
                expect(response).toEqual(MOCK_MESSAGE_LIST));

        req = httpMock.expectOne(findAllUrlWithLastMessageId);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_MESSAGE_LIST);
    }));

    it('should call findAll and return a message list when limit is passed as parameter', waitForAsync(() => {
        messageService
            .findAll(testDataTopicId, null, 20)
            .subscribe((response: MessageListResource) =>
                expect(response).toEqual(MOCK_MESSAGE_LIST));

        req = httpMock.expectOne(findAllUrlWithLimit);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_MESSAGE_LIST);
    }));

    it('should call findOne and return desired message', waitForAsync(() => {
        messageService
            .findOne(MOCK_MESSAGE_1.id)
            .subscribe((response: MessageResource) =>
                expect(response).toEqual(MOCK_MESSAGE_1));

        req = httpMock.expectOne(findOneUrl);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_MESSAGE_1);
    }));

    it('should call findOne for non existing message and return no message', waitForAsync(() => {
        messageService
            .findOne(MOCK_MESSAGE_1.id)
            .subscribe((response: MessageResource) =>
                expect(response).toBe(null));

        req = httpMock.expectOne(findOneUrl);
        expect(req.request.method).toBe('GET');
        req.flush(null);
    }));
});
