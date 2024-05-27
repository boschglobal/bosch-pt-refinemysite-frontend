/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';

import {MockStore} from '../../../../../test/mocks/store';
import {
    MOCK_TOPIC_1,
    MOCK_TOPIC_2
} from '../../../../../test/mocks/task-topics';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TopicResource} from '../../api/topics/resources/topic.resource';
import {TopicQueries} from './topic.queries';

describe('Topic Queries', () => {
    let topicQueries: TopicQueries;

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: Store,
                useValue:
                    new MockStore(
                        {
                            projectModule: {
                                topicSlice: {
                                    currentItem: {
                                        requestStatus: RequestStatusEnum.success
                                    },
                                    list: {
                                        ids: [MOCK_TOPIC_1.id, MOCK_TOPIC_2.id],
                                        requestStatus: RequestStatusEnum.success,
                                        _links: {
                                            prev: {
                                                href: ''
                                            }
                                        },
                                    },
                                    items: [MOCK_TOPIC_1, MOCK_TOPIC_2]
                                },
                            }
                        }
                    )
            },
            HttpClient,
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        topicQueries = TestBed.inject(TopicQueries);
    });

    it('should observe topics by task', () => {
        topicQueries
            .observeTopicsByTask()
            .subscribe((result: TopicResource[]) =>
                expect(result).toEqual([MOCK_TOPIC_1, MOCK_TOPIC_2]));
    });

    it('should observe topics by task request status', () => {
        topicQueries
            .observeTopicsByTaskRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe topics by task has more items', () => {
        topicQueries
            .observeTopicsByTaskHasMoreItems()
            .subscribe((result: boolean) =>
                expect(result).toBeTruthy());
    });

    it('should observe create topic by task request status', () => {
        topicQueries
            .observeCreateRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });
});
