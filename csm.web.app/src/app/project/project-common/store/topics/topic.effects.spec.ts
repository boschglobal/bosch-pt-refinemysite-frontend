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
import {take} from 'rxjs/operators';

import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {
    MOCK_TOPIC_1,
    MOCK_TOPIC_LIST
} from '../../../../../test/mocks/task-topics';
import {MOCK_TOPIC_FILE} from '../../../../../test/mocks/topic-files';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {CriticalityChange} from '../../../project-children/project-tasks/project-task-children/presentationals/task-topic-card/project-task-topic-card.component';
import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {SaveTopicResource} from '../../api/topics/resources/save-topic.resource';
import {SaveTopicAttachmentResource} from '../../api/topics/resources/save-topic-attachment.resource';
import {TopicResource} from '../../api/topics/resources/topic.resource';
import {TopicListResource} from '../../api/topics/resources/topic-list.resource';
import {TopicService} from '../../api/topics/topic.service';
import {TopicAttachmentService} from '../../api/topics/topic-attachment.service';
import {TopicCriticalityEnum} from '../../enums/topic-criticality.enum';
import {AttachmentActions} from '../attachments/attachment.actions';
import {PROJECT_TASK_SLICE_INITIAL_STATE} from '../tasks/task.initial-state';
import {
    TopicActions,
    TopicAttachmentActions
} from './topic.actions';
import {TopicEffects} from './topic.effects';

describe('Topic Effects', () => {
    let topicEffects: TopicEffects;
    let actions: ReplaySubject<any>;
    let projectTaskTopicService: any;
    let projectTaskTopicFileService: any;

    const errorResponse: Observable<any> = throwError('error');
    const findAllTaskTopicsResponse: Observable<TopicListResource> = of(MOCK_TOPIC_LIST);
    const findOneTaskTopicResponse: Observable<TopicResource> = of(MOCK_TOPIC_1);
    const createTopicResponse: Observable<TopicResource> = of(MOCK_TOPIC_1);
    const deleteTopicResponse: Observable<{}> = of({});
    const uploadTaskTopicFileResponse: Observable<AttachmentResource> = of(MOCK_TOPIC_FILE);
    const topicId = '123';
    const updateCriticalityPayload: any = {topicId, isCritical: true};
    const saveTopicResourceWithFiles: SaveTopicResource = {
        description: '',
        files: [new File([''], ''), new File([''], '')],
    };
    const saveTopicAttachmentResource: SaveTopicAttachmentResource = {
        id: MOCK_TOPIC_1.id,
        files: [new File([''], '')],
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            TopicEffects,
            provideMockActions(() => actions),
            {
                provide: TopicService,
                useValue: jasmine.createSpyObj('TopicService', ['create', 'delete', 'findAll', 'findOne', 'updateCriticality']),
            },
            {
                provide: TopicAttachmentService,
                useValue: jasmine.createSpyObj('TopicFileService', ['upload']),
            },
            {
                provide: Store,
                useValue:
                    new MockStore(
                        {
                            projectModule: {
                                projectSlice: {
                                    currentItem: {
                                        id: MOCK_PROJECT_1.id,
                                    },
                                },
                                projectTaskSlice: PROJECT_TASK_SLICE_INITIAL_STATE,
                            },
                        }
                    ),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        topicEffects = TestBed.inject(TopicEffects);
        projectTaskTopicService = TestBed.inject(TopicService);
        projectTaskTopicFileService = TestBed.inject(TopicAttachmentService);
        actions = new ReplaySubject(1);

        projectTaskTopicService.findAll.calls.reset();
        projectTaskTopicService.create.calls.reset();
    });

    it('should trigger a TopicActions.Request.AllFulfilled action after requesting current task topics successfully', () => {
        const limit = 2;
        const currentTaskId = PROJECT_TASK_SLICE_INITIAL_STATE.currentItem.id;
        const expectedResult = new TopicActions.Request.AllFulfilled(MOCK_TOPIC_LIST);

        projectTaskTopicService.findAll.and.returnValue(findAllTaskTopicsResponse);
        actions.next(new TopicActions.Request.All(topicId, limit));
        topicEffects.requestCurrentTopics$.subscribe(result => {
            expect(projectTaskTopicService.findAll).toHaveBeenCalledWith(currentTaskId, topicId, limit);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TopicActions.Request.AllRejected action after requesting current task topics has failed', () => {
        const expectedResult = new TopicActions.Request.AllRejected();

        projectTaskTopicService.findAll.and.returnValue(errorResponse);
        actions.next(new TopicActions.Request.All());
        topicEffects.requestCurrentTopics$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TopicActions.Request.OneFulfilled action after requesting current task topic successfully', () => {
        const expectedResult = new TopicActions.Request.OneFulfilled(MOCK_TOPIC_1);

        projectTaskTopicService.findOne.and.returnValue(findOneTaskTopicResponse);
        actions.next(new TopicActions.Request.One(topicId));

        topicEffects.requestTaskTopic$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TopicActions.Request.OneRejected action after requesting current task topic has failed', () => {
        const expectedResult = new TopicActions.Request.OneRejected();

        projectTaskTopicService.findOne.and.returnValue(errorResponse);
        actions.next(new TopicActions.Request.One(MOCK_TOPIC_1.id));
        topicEffects.requestTaskTopic$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TopicActions.Update.CriticalityFulfilled action after requesting current task topic successfully', () => {
        const expectedResult = new TopicActions.Update.CriticalityFulfilled(MOCK_TOPIC_1);

        projectTaskTopicService.updateCriticality.and.returnValue(findOneTaskTopicResponse);
        actions.next(new TopicActions.Update.Criticality(updateCriticalityPayload));

        topicEffects.updateCurrentTaskTopicCriticality$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TopicActions.Request.One action after changing criticality has failed', () => {
        const expectedResult = new TopicActions.Request.One(MOCK_TOPIC_1.id);
        const criticality: CriticalityChange = {
            id: MOCK_TOPIC_1.id,
            criticality: TopicCriticalityEnum.CRITICAL,
        };

        projectTaskTopicService.updateCriticality.and.returnValue(errorResponse);
        actions.next(new TopicActions.Update.Criticality(criticality));
        topicEffects.updateCurrentTaskTopicCriticality$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TopicActions.Create.OneFulfilled action after creating a task topic successfully', () => {
        const expectedResult = new TopicActions.Create.OneFulfilled(MOCK_TOPIC_1.id);
        const saveTopicResourceMock: SaveTopicResource = {
            description: '',
            files: [],
        };
        projectTaskTopicService.create.and.returnValue(createTopicResponse);
        actions.next(new TopicActions.Create.One(saveTopicResourceMock));
        topicEffects.createTopic$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TopicAttachmentActions.Create.All action after creating a task topic with files', () => {
        const saveTaskTopicFileResource = new SaveTopicAttachmentResource(MOCK_TOPIC_1.id, [new File([''], ''), new File([''], '')]);
        const expectedResult = new TopicAttachmentActions.Create.All(saveTaskTopicFileResource);

        projectTaskTopicService.create.and.returnValue(createTopicResponse);
        actions.next(new TopicActions.Create.One(saveTopicResourceWithFiles));
        topicEffects.createTopic$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TopicActions.Create.OneRejected action after creating task topic has failed', () => {
        const expectedResult = new TopicActions.Create.OneRejected();

        projectTaskTopicService.create.and.returnValue(errorResponse);
        actions.next(new TopicActions.Create.One(saveTopicResourceWithFiles));
        topicEffects.createTopic$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TopicActions.Create.OneFulfilled action after create a task topic successfully', () => {
        const id = '123';
        const expectedResult = new TopicActions.Create.OneFulfilled(id);
        const saveTaskTopicFileResource: SaveTopicAttachmentResource = {
            id: '123',
            files: [new File([''], '')],
        };

        projectTaskTopicFileService.upload.and.returnValue(uploadTaskTopicFileResponse);
        actions.next(new TopicAttachmentActions.Create.All(saveTaskTopicFileResource));
        topicEffects.uploadTopicFile$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TopicActions.Update.List action after create a full task topic successfully', () => {
        const expectedResult = new TopicActions.Update.List(MOCK_TOPIC_1.id);

        projectTaskTopicService.findOne.and.returnValue(findOneTaskTopicResponse);
        actions.next(new TopicActions.Create.OneFulfilled(MOCK_TOPIC_1.id));
        topicEffects.createTopicSuccess$.pipe(take(1)).subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TopicActions.Request.OneRejected action after the creation of a task topic has failed', () => {
        const expectedResult = new TopicActions.Request.OneRejected();

        projectTaskTopicService.findOne.and.returnValue(errorResponse);
        actions.next(new TopicActions.Create.OneFulfilled(MOCK_TOPIC_1.id));
        topicEffects.createTopicSuccess$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TopicActions.Create.OneRejected action after uploading a task topic picture has failed', () => {
        const expectedResult = new TopicActions.Create.OneRejected();

        projectTaskTopicFileService.upload.and.returnValue(errorResponse);
        actions.next(new TopicAttachmentActions.Create.All(saveTopicAttachmentResource));
        topicEffects.uploadTopicFile$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TopicActions.Delete.OneFulfilled action after deleting topic successfully', () => {
        const resultFromEffect: Action[] = [];
        const expectedResult = [
            new TopicActions.Delete.OneFulfilled(topicId),
            new AttachmentActions.Remove.AllByTopic(topicId),
        ];

        projectTaskTopicService.delete.and.returnValue(deleteTopicResponse);
        actions.next(new TopicActions.Delete.One(topicId));
        topicEffects.delete$.subscribe(result => {
            resultFromEffect.push(result);
        });

        expect(resultFromEffect).toEqual(expectedResult);
    });

    it('should trigger a TopicActions.Delete.OneRejected action after deleting topic has failed', () => {
        const expectedResult = new TopicActions.Delete.OneRejected();

        projectTaskTopicService.delete.and.returnValue(errorResponse);
        actions.next(new TopicActions.Delete.One(topicId));
        topicEffects.delete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after deleting topic successfully', () => {
        const key = 'Topic_Delete_SuccessMessage';
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});

        actions.next(new TopicActions.Delete.OneFulfilled(topicId));
        topicEffects.deleteSuccess$.subscribe((result: AlertActions.Add.SuccessAlert) => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    it('should call the findAll topics for the taskId provided in the action', (done) => {
        const limit = 2;
        const taskId = 'provided-task-id';

        actions.next(new TopicActions.Request.All(topicId, limit, taskId));
        topicEffects.requestCurrentTopics$.subscribe(() => {
            expect(projectTaskTopicService.findAll).toHaveBeenCalledWith(taskId, topicId, limit);
            done();
        });
    });

    it('should call the create topic for the taskId provided in the action', (done) => {
        const taskId = 'provided-task-id';
        const saveTopicResourceMock: SaveTopicResource = {
            description: null,
            criticality: TopicCriticalityEnum.CRITICAL,
        };

        actions.next(new TopicActions.Create.One(saveTopicResourceMock, taskId));
        topicEffects.createTopic$.subscribe(() => {
            expect(projectTaskTopicService.create).toHaveBeenCalledWith(saveTopicResourceMock, taskId);
            done();
        });
    });
});
