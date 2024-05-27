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

import {MOCK_ATTACHMENTS_LIST} from '../../../../../test/mocks/attachments';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ObjectListIdentifierPair} from '../../../../shared/misc/api/datatypes/object-list-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {AttachmentListResource} from '../../api/attachments/resources/attachment-list.resource';
import {TaskAttachmentService} from '../../api/tasks/task-attachment.service';
import {PROJECT_TASK_SLICE_INITIAL_STATE} from '../tasks/task.initial-state';
import {
    AttachmentActions,
    RequestAllAttachmentsPayload
} from './attachment.actions';
import {AttachmentEffects} from './attachment.effects';

describe('Attachment Effects', () => {
    let attachmentEffects: AttachmentEffects;
    let actions: ReplaySubject<any>;
    let taskAttachmentService: jasmine.SpyObj<TaskAttachmentService>;

    const testDataTaskObjectIdentifier = new ObjectListIdentifierPair(ObjectTypeEnum.Task, '123', true);
    const testDataRequestAllAttachmentsPayload = {
        objectIdentifier: testDataTaskObjectIdentifier,
    };

    const testDataRequestAllAttachmentsFulfilledPayload = {
        attachmentList: MOCK_ATTACHMENTS_LIST,
        objectIdentifier: testDataTaskObjectIdentifier,
    };

    const testDataDeleteOneAttachmentPayload = MOCK_ATTACHMENTS_LIST.attachments[0].id;

    const errorResponse: Observable<any> = throwError('error');
    const deleteAttachmentSuccessResponse: Observable<{}> = of({});
    const findAllAttachmentsResponse: Observable<AttachmentListResource> = of(MOCK_ATTACHMENTS_LIST);

    const moduleDef: TestModuleMetadata = {
        providers: [
            AttachmentEffects,
            provideMockActions(() => actions),
            {
                provide: TaskAttachmentService,
                useValue: jasmine.createSpyObj('TaskAttachmentService', ['getAll', 'delete']),
            },
            {
                provide: Store,
                useValue: new MockStore(
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

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        attachmentEffects = TestBed.inject(AttachmentEffects);
        taskAttachmentService = TestBed.inject(TaskAttachmentService) as jasmine.SpyObj<TaskAttachmentService>;
        actions = new ReplaySubject(1);
    });

    afterEach(() => taskAttachmentService.getAll.calls.reset());

    it('should trigger a REQUEST_ALL_ATTACHMENTS_BY_TASK_FULFILLED action after request attachments successfully and ' +
        'call task attachment service with the correct arguments', () => {
        const resultsFromEffects: Action[] = [];
        const expectedResultsFromEffects = [
            new AttachmentActions.Request.AllByTaskFulfilled(testDataRequestAllAttachmentsFulfilledPayload),
        ];
        const actionPayloadWithoutChildren: RequestAllAttachmentsPayload = {
            ...testDataRequestAllAttachmentsPayload,
            includeChildren: false,
        };

        taskAttachmentService.getAll.and.returnValue(findAllAttachmentsResponse);
        actions.next(new AttachmentActions.Request.AllByTask(actionPayloadWithoutChildren));
        attachmentEffects.requestAllTaskAttachments$.subscribe(result => resultsFromEffects.push(result));

        expect(resultsFromEffects.length).toBe(1);
        expect(resultsFromEffects).toEqual(expectedResultsFromEffects);
        expect(taskAttachmentService.getAll).toHaveBeenCalledWith(testDataRequestAllAttachmentsFulfilledPayload.objectIdentifier.id, false);
    });

    it('should trigger a REQUEST_ALL_ATTACHMENTS_BY_TASK_REJECTED action after request attachments fails', () => {
        const expectedResult = new AttachmentActions.Request.AllByTaskRejected(testDataTaskObjectIdentifier.stringify());

        taskAttachmentService.getAll.and.returnValue(errorResponse);
        actions.next(new AttachmentActions.Request.AllByTask(testDataRequestAllAttachmentsPayload));
        attachmentEffects.requestAllTaskAttachments$.subscribe(result =>
            expect(result).toEqual(expectedResult));
    });

    it('should trigger a AttachmentActions.Delete.OneFulfilled action after deleting one attachment successfully', () => {
        const expectedResult = new AttachmentActions.Delete.OneFulfilled(testDataDeleteOneAttachmentPayload);

        taskAttachmentService.delete.and.returnValue(deleteAttachmentSuccessResponse);
        actions.next(new AttachmentActions.Delete.One(testDataDeleteOneAttachmentPayload));
        attachmentEffects.delete$.subscribe(result =>
            expect(result).toEqual(expectedResult));
    });

    it('should trigger a AttachmentActions.Delete.OneRejected action after deleting one attachment fails', () => {
        const expectedResult = new AttachmentActions.Delete.OneRejected();

        taskAttachmentService.delete.and.returnValue(errorResponse);
        actions.next(new AttachmentActions.Delete.One(testDataDeleteOneAttachmentPayload));
        attachmentEffects.delete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after deleting an attachment successfully', () => {
        const key = 'Attachment_Delete_SuccessMessage';
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});

        actions.next(new AttachmentActions.Delete.OneFulfilled(testDataDeleteOneAttachmentPayload));
        attachmentEffects.deleteSuccess$.subscribe((result: AlertActions.Add.SuccessAlert) => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });
});
