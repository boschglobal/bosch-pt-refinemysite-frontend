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

import {
    MOCK_MESSAGE_1,
    MOCK_MESSAGE_2
} from '../../../../../test/mocks/messages';
import {MockStore} from '../../../../../test/mocks/store';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {MessageResource} from '../../api/messages/resources/message.resource';
import {MessageQueries} from './message.queries';

describe('Message Queries', () => {
    let messageQueries: MessageQueries;

    const testDataTopicId = '123';

    const moduleDef: TestModuleMetadata = {
        providers: [
            MessageQueries,
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            messageSlice: {
                                items: [MOCK_MESSAGE_1, MOCK_MESSAGE_2],
                                lists: {
                                    [testDataTopicId]: {
                                        ids: [MOCK_MESSAGE_1.id, MOCK_MESSAGE_2.id],
                                        requestStatus: RequestStatusEnum.success,
                                        _links: {
                                            prev: {
                                                href: ''
                                            }
                                        }
                                    }
                                }
                            }
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

    beforeEach(() => messageQueries = TestBed.inject(MessageQueries));

    it('should observe messages by topic', () => {
        messageQueries
            .observeMessagesByTopic(testDataTopicId)
            .subscribe((result: MessageResource[]) =>
                expect(result).toEqual([MOCK_MESSAGE_1, MOCK_MESSAGE_2]));
    });

    it('should observe messages by topic request status', () => {
        messageQueries
            .observeMessagesByTopicRequestStatus(testDataTopicId)
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe messages by topic has more items', () => {
        messageQueries
            .observeMessagesByTopicHasMoreItems(testDataTopicId)
            .subscribe((result: boolean) =>
                expect(result).toBeTruthy());
    });
});
