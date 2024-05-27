/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {
    Action,
    Store
} from '@ngrx/store';
import {
    Observable,
    of,
    ReplaySubject,
    throwError
} from 'rxjs';

import {
    MOCK_MESSAGE_1,
    MOCK_MESSAGE_2,
    MOCK_MESSAGE_LIST
} from '../../../../../test/mocks/messages';
import {MockStore} from '../../../../../test/mocks/store';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {MessageService} from '../../api/messages/message.service';
import {MessageAttachmentService} from '../../api/messages/message-attachment.service';
import {MessageResource} from '../../api/messages/resources/message.resource';
import {MessageListResource} from '../../api/messages/resources/message-list.resource';
import {SaveMessageResource} from '../../api/messages/resources/save-message.resource';
import {SaveMessageFileResource} from '../../api/messages/resources/save-message-file.resource';
import {AttachmentActions} from '../attachments/attachment.actions';
import {
    MessageActions,
    MessageAttachmentActions
} from './message.actions';
import {MessageEffects} from './message.effects';

describe('Message Effects', () => {
    let messageEffects: MessageEffects;
    let messageService: any;
    let messageAttachmentService: any;
    let actions: ReplaySubject<any>;

    const testDataTopicId = '123';
    const testDataRequestAllMessagesFulfilledPayload = {
        messageList: MOCK_MESSAGE_LIST,
        topicId: testDataTopicId
    };
    const testDataRequestAllMessagesPayload = {
        topicId: testDataTopicId
    };
    const testDataMessage: MessageResource = MOCK_MESSAGE_1;
    const saveMessage: SaveMessageResource = {
        topicId: testDataTopicId,
        content: 'content'
    };
    const files: File[] = [new File(['file'], 'file')];

    const saveMessageFileResource: SaveMessageFileResource = new SaveMessageFileResource(MOCK_MESSAGE_1.id, files, testDataTopicId);
    const saveMessageFiles: SaveMessageResource = new SaveMessageResource(testDataTopicId, '', files);

    const deleteMessageResponse: Observable<{}> = of({});
    const errorResponse: Observable<any> = throwError('error');
    const findAllResponse: Observable<MessageListResource> = of(MOCK_MESSAGE_LIST);
    const createResponse: Observable<MessageResource> = of(MOCK_MESSAGE_1);

    const moduleDef: TestModuleMetadata = {
        providers: [
            MessageEffects,
            provideMockActions(() => actions),
            {
                provide: MessageService,
                useValue: jasmine.createSpyObj('MessageService', ['findAll', 'findOne', 'create', 'delete'])
            },
            {
                provide: MessageAttachmentService,
                useValue: jasmine.createSpyObj('MessageAttachmentService', ['upload'])
            },
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
                                    }
                                }
                            }
                        }
                    }
                )
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        messageEffects = TestBed.inject(MessageEffects);
        messageService = TestBed.inject(MessageService);
        messageAttachmentService = TestBed.inject(MessageAttachmentService);
        actions = new ReplaySubject(1);
    });

    it('should trigger a MessageActions.Request.AllFulfilled action after requesting messages successfully', () => {
        const expectedResult = new MessageActions.Request.AllFulfilled(testDataRequestAllMessagesFulfilledPayload);

        messageService.findAll.and.returnValue(findAllResponse);
        actions.next(new MessageActions.Request.All(testDataRequestAllMessagesPayload));
        messageEffects.requestAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MessageActions.Request.AllRejected action after requesting messages has failed', () => {
        const expectedResult = new MessageActions.Request.AllRejected(testDataTopicId);

        messageService.findAll.and.returnValue(errorResponse);
        actions.next(new MessageActions.Request.All(testDataRequestAllMessagesPayload));
        messageEffects.requestAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MessageActions.Create.OneFulfilled action after creating messages successfully', () => {
        const expectedResult = new MessageActions.Create.OneFulfilled(testDataMessage);

        messageService.create.and.returnValue(createResponse);
        actions.next(new MessageActions.Create.One(saveMessage));

        messageEffects.create$.subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should trigger a MessageActions.Create.OneRejected action after creating messages has failed', () => {
        const topicId = saveMessage.topicId;
        const expectedResult = new MessageActions.Create.OneRejected(topicId);

        messageService.create.and.returnValue(errorResponse);
        actions.next(new MessageActions.Create.One(saveMessage));

        messageEffects.create$.subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a MessageActions.Create.OneFulfilled action is triggered', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(null);

        actions.next(new MessageActions.Create.OneFulfilled(null));

        messageEffects.createSuccess$.subscribe(result => expect(result.type).toEqual(expectedResult.type));
    });

    it('should trigger a MessageAttachmentActions.Create.All action after creating message with file', () => {
        const expectedResult = new MessageAttachmentActions.Create.All(saveMessageFileResource);

        messageService.create.and.returnValue(createResponse);
        actions.next(new MessageActions.Create.One(saveMessageFiles));

        messageEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MessageActions.Create.OneFulfilled action after create message with files', () => {
        const expectedResult = new MessageActions.Create.OneFulfilled(testDataMessage);

        messageAttachmentService.upload.and.returnValue(createResponse);
        messageService.findOne.and.returnValue(of(MOCK_MESSAGE_1));

        actions.next(new MessageAttachmentActions.Create.All(saveMessageFileResource));
        messageEffects.uploadMessageFile$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MessageActions.Create.OneRejected action after create message with files has failed', () => {
        const topicId = saveMessageFileResource.topicId;
        const expectedResult = new MessageActions.Create.OneRejected(topicId);

        messageAttachmentService.upload.and.returnValue(of(errorResponse));
        messageService.findOne.and.returnValue(errorResponse);

        actions.next(new MessageAttachmentActions.Create.All(saveMessageFileResource));
        messageEffects.uploadMessageFile$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MessageActions.Delete.OneFulfilled and AttachmentActions.Remove.AllByMessage actions after deleting message successfully', () => {
        const resultFromEffect: Action[] = [];
        const payload = {
            topicId: testDataTopicId,
            messageId: MOCK_MESSAGE_1.id
        };
        const expectedResult = [
            new MessageActions.Delete.OneFulfilled(payload),
            new AttachmentActions.Remove.AllByMessage(MOCK_MESSAGE_1.id)
        ];

        messageService.delete.and.returnValue(deleteMessageResponse);
        actions.next(new MessageActions.Delete.One(payload)
        );
        messageEffects.delete$.subscribe(result => {
            resultFromEffect.push(result);
        });

        expect(resultFromEffect).toEqual(expectedResult);
    });

    it('should trigger a MessageActions.Delete.OneRejected action after deleting message has failed', () => {
        const expectedResult = new MessageActions.Delete.OneRejected(testDataTopicId);

        messageService.delete.and.returnValue(errorResponse);
        actions.next(new MessageActions.Delete.One({
                topicId: testDataTopicId,
                messageId: MOCK_MESSAGE_1.id
            })
        );
        messageEffects.delete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after deleting message successfully', () => {
        const key = 'Reply_Delete_SuccessMessage';
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});

        actions.next(new MessageActions.Delete.OneFulfilled(
            {
                topicId: testDataTopicId,
                messageId: MOCK_MESSAGE_1.id
            })
        );

        messageEffects.deleteSuccess$.subscribe((result: AlertActions.Add.SuccessAlert) => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });
});
