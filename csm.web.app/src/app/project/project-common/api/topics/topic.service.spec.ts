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
    MOCK_TOPIC_1,
    MOCK_TOPIC_LIST
} from '../../../../../test/mocks/task-topics';
import {TopicCriticalityEnum} from '../../enums/topic-criticality.enum';
import {SaveTopicResource} from './resources/save-topic.resource';
import {TopicResource} from './resources/topic.resource';
import {TopicListResource} from './resources/topic-list.resource';
import {TopicService} from './topic.service';

describe('Project Task Topic Service', () => {
    let topicService: TopicService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const taskId = '123';
    const lastTopicId = '456';
    const topicId = '789';
    const topic: TopicResource = MOCK_TOPIC_1;
    const topicList: TopicListResource = MOCK_TOPIC_LIST;
    const emptyResponseBody = {};
    const saveTopic: SaveTopicResource = {
        description: 'abc',
        files: []
    };
    const limit = 10;

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const findAllUrl = `${baseUrl}/projects/tasks/${taskId}/topics?limit=5`;
    const createUrl = `${baseUrl}/projects/tasks/${taskId}/topics`;
    const findAllUrlWithMoreTopics = `${baseUrl}/projects/tasks/${taskId}/topics?limit=${limit}&before=${lastTopicId}`;
    const findOneUrl = `${baseUrl}/projects/tasks/topics/${topicId}`;
    const deleteUrl = `${baseUrl}/projects/tasks/topics/${topicId}`;
    const escalateUrl = `${baseUrl}/projects/tasks/topics/${topicId}/escalate`;
    const deescalateUrl = `${baseUrl}/projects/tasks/topics/${topicId}/deescalate`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        topicService = TestBed.inject(TopicService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call create and return topic from task', waitForAsync(() => {
        topicService
            .create(saveTopic, taskId)
            .subscribe((response: TopicResource) =>
                expect(response).toBe(topic));

        req = httpMock.expectOne(createUrl);
        expect(req.request.method).toBe('POST');
        req.flush(topic);
    }));

    it('should call delete and delete a topic', waitForAsync(() => {
        topicService
            .delete(topicId)
            .subscribe((response: {}) =>
                expect(response).toBe(emptyResponseBody));

        req = httpMock.expectOne(deleteUrl);
        expect(req.request.method).toBe('DELETE');
        req.flush(emptyResponseBody);
    }));

    it('should call findAll and return topics from task', waitForAsync(() => {
        topicService
            .findAll(taskId)
            .subscribe((response: TopicListResource) =>
                expect(response).toBe(topicList));

        req = httpMock.expectOne(findAllUrl);
        expect(req.request.method).toBe('GET');
        req.flush(topicList);
    }));

    it('should call findAll url case have more topics', async () => {
        topicService
            .findAll(taskId, lastTopicId, limit)
            .subscribe((response: TopicListResource) =>
                expect(response).toBe(topicList));

        req = httpMock.expectOne(findAllUrlWithMoreTopics);
        expect(req.request.method).toBe('GET');
        req.flush(topicList);
    });

    it('should call findOne and return one topic from task', waitForAsync(() => {
        topicService
            .findOne(topicId)
            .subscribe((response: TopicResource) =>
                expect(response).toBe(topic));

        req = httpMock.expectOne(findOneUrl);
        expect(req.request.method).toBe('GET');
        req.flush(topic);
    }));

    it('should set correct default updateCriticality url with escalate', async () => {
        const criticality: TopicCriticalityEnum = TopicCriticalityEnum.CRITICAL;

        topicService
            .updateCriticality(topicId, criticality)
            .subscribe((response: TopicResource) =>
                expect(response).toBe(topic));

        req = httpMock.expectOne(escalateUrl);
        expect(req.request.method).toBe('POST');
        req.flush(topic);
    });

    it('should set correct default updateCriticality url with de-escalate', async () => {
        const criticality: TopicCriticalityEnum = TopicCriticalityEnum.UNCRITICAL;

        topicService
            .updateCriticality(topicId, criticality)
            .subscribe((response: TopicResource) =>
                expect(response).toBe(topic));

        req = httpMock.expectOne(deescalateUrl);
        expect(req.request.method).toBe('POST');
        req.flush(topic);
    });
});
