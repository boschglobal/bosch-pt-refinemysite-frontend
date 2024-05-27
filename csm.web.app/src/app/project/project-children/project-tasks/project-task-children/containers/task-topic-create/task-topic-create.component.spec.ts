/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {Store} from '@ngrx/store';
import {
    of,
    Subject,
} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {TEST_USER_RESOURCE_REGISTERED} from '../../../../../../../test/mocks/user';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {UserQueries} from '../../../../../../user/store/user/user.queries';
import {SaveTopicResource} from '../../../../../project-common/api/topics/resources/save-topic.resource';
import {TopicActions} from '../../../../../project-common/store/topics/topic.actions';
import {TopicQueries} from '../../../../../project-common/store/topics/topic.queries';
import {TaskTopicCreateComponent} from './task-topic-create.component';

describe('Task Topic Create Component', () => {
    let comp: TaskTopicCreateComponent;
    let fixture: ComponentFixture<TaskTopicCreateComponent>;
    let store: jasmine.SpyObj<Store>;

    const topicQueriesMock: TopicQueries = mock(TopicQueries);
    const userQueriesMock: UserQueries = mock(UserQueries);

    const taskId = 'foo';
    const observeCreateRequestStatusSubject = new Subject<RequestStatusEnum>();

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            TaskTopicCreateComponent,
        ],
        providers: [
            {
                provide: ModalService,
                useValue: {
                    currentModalData: {
                        taskId,
                    },
                },
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: TopicQueries,
                useValue: instance(topicQueriesMock),
            },
            {
                provide: UserQueries,
                useValue: instance(userQueriesMock),
            },
        ],
    };

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskTopicCreateComponent);
        comp = fixture.componentInstance;
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        when(topicQueriesMock.observeCreateRequestStatus()).thenReturn(observeCreateRequestStatusSubject);
        when(userQueriesMock.observeCurrentUser()).thenReturn(of(TEST_USER_RESOURCE_REGISTERED));
        fixture.detectChanges();

        store.dispatch.calls.reset();
    });

    it('should dispatch TopicActions.Create.One action when the capture is submitted', () => {
        const saveTopicResource = new SaveTopicResource('123', []);
        const expectedAction = new TopicActions.Create.One(saveTopicResource, taskId);

        comp.handleSubmit(saveTopicResource);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch TopicActions.Create.OneReset action when the capture is canceled', () => {
        const expectedAction = new TopicActions.Create.OneReset();

        comp.handleCancel();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should set isSubmitting to true when the topic is being created', () => {
        comp.isSubmitting = false;

        observeCreateRequestStatusSubject.next(RequestStatusEnum.progress);

        expect(comp.isSubmitting).toBe(true);
    });

    it('should set isSubmitting to false when the topic is not being created', () => {
        comp.isSubmitting = true;

        observeCreateRequestStatusSubject.next(RequestStatusEnum.success);

        expect(comp.isSubmitting).toBe(false);
    });

    it('should dispatch TopicActions.Create.OneReset action when the topic is created', () => {
        const expectedAction = new TopicActions.Create.OneReset();

        observeCreateRequestStatusSubject.next(RequestStatusEnum.success);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);

    });

    it('should emit the closed event when the topic is created', () => {
        spyOn(comp.closed, 'emit');

        observeCreateRequestStatusSubject.next(RequestStatusEnum.success);

        expect(comp.closed.emit).toHaveBeenCalled();
    });
});
