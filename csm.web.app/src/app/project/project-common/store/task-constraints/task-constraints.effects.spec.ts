/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
    Observable,
    ReplaySubject,
    throwError
} from 'rxjs';
import {of} from 'rxjs/index';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_SAVE_TASK_CONSTRAINTS_RESOURCE,
    MOCK_TASK_CONSTRAINTS_RESOURCE
} from '../../../../../test/mocks/task-constraints';
import {TaskConstraintsResource} from '../../api/task-constraints/resources/task-constraints.resource';
import {TaskConstraintsService} from '../../api/task-constraints/task-constraints.service';
import {ProjectSliceService} from '../projects/project-slice.service';
import {TaskConstraintsActions} from './task-constraints.actions';
import {TaskConstraintsEffects} from './task-constraints.effects';
import {TaskConstraintsQueries} from './task-constraints.queries';

describe('Task Constraints Effects', () => {
    let actions: ReplaySubject<any>;
    let taskConstraintsEffects: TaskConstraintsEffects;
    let taskConstraintsService: any;

    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const taskConstraintsQueriesMock: TaskConstraintsQueries = mock(TaskConstraintsQueries);

    const projectId = 'foo';
    const taskId = 'bar';

    const errorResponse: Observable<any> = throwError('error');
    const getTaskConstraintsResponse: Observable<TaskConstraintsResource> = of(MOCK_TASK_CONSTRAINTS_RESOURCE);
    const taskConstraintVersion = MOCK_TASK_CONSTRAINTS_RESOURCE.version;

    const moduleDef: TestModuleMetadata = {
        providers: [
            TaskConstraintsEffects,
            provideMockActions(() => actions),
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: TaskConstraintsQueries,
                useFactory: () => instance(taskConstraintsQueriesMock),
            },
            {
                provide: TaskConstraintsService,
                useValue: jasmine.createSpyObj('TaskConstraintsService', ['findOne', 'updateOne']),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(projectId));
        when(taskConstraintsQueriesMock.observeTaskConstraintsVersionByTaskId(taskId)).thenReturn(of(taskConstraintVersion));

        taskConstraintsEffects = TestBed.inject(TaskConstraintsEffects);
        taskConstraintsService = TestBed.inject(TaskConstraintsService);

        actions = new ReplaySubject(1);

        taskConstraintsService.findOne.calls.reset();
        taskConstraintsService.updateOne.calls.reset();
    });

    it('should trigger a TaskConstraintsActions.Request.OneFulfilled after a successful request', () => {
        const expectedResult = new TaskConstraintsActions.Request.OneFulfilled(taskId, MOCK_TASK_CONSTRAINTS_RESOURCE);

        taskConstraintsService.findOne.and.returnValue(getTaskConstraintsResponse);
        actions.next(new TaskConstraintsActions.Request.One(taskId));
        taskConstraintsEffects.requestOne$.subscribe(result => {
            expect(taskConstraintsService.findOne).toHaveBeenCalledTimes(1);
            expect(taskConstraintsService.findOne).toHaveBeenCalledWith(...[projectId, taskId]);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TaskConstraintsActions.Request.OneRejected after a unsuccessful request', () => {
        const expectedResult = new TaskConstraintsActions.Request.OneRejected(taskId);

        taskConstraintsService.findOne.and.returnValue(errorResponse);
        actions.next(new TaskConstraintsActions.Request.One(taskId));
        taskConstraintsEffects.requestOne$.subscribe(result => {
            expect(taskConstraintsService.findOne).toHaveBeenCalledTimes(1);
            expect(taskConstraintsService.findOne).toHaveBeenCalledWith(...[projectId, taskId]);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TaskConstraintsActions.Update.OneFulfilled after a successful request', () => {
        const expectedResult = new TaskConstraintsActions.Update.OneFulfilled(taskId, MOCK_TASK_CONSTRAINTS_RESOURCE);

        taskConstraintsService.updateOne.and.returnValue(getTaskConstraintsResponse);
        actions.next(new TaskConstraintsActions.Update.One(taskId, MOCK_SAVE_TASK_CONSTRAINTS_RESOURCE));
        taskConstraintsEffects.updateOne$.subscribe(result => {
            expect(taskConstraintsService.updateOne).toHaveBeenCalledTimes(1);
            expect(taskConstraintsService.updateOne).toHaveBeenCalledWith(...[
                projectId,
                taskId,
                MOCK_SAVE_TASK_CONSTRAINTS_RESOURCE,
                taskConstraintVersion,
            ]);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a TaskConstraintsActions.Update.OneRejected after a unsuccessful request', () => {
        const expectedResult = new TaskConstraintsActions.Update.OneRejected(taskId);

        taskConstraintsService.updateOne.and.returnValue(errorResponse);
        actions.next(new TaskConstraintsActions.Update.One(taskId, MOCK_SAVE_TASK_CONSTRAINTS_RESOURCE));
        taskConstraintsEffects.updateOne$.subscribe(result => {
            expect(taskConstraintsService.updateOne).toHaveBeenCalledTimes(1);
            expect(taskConstraintsService.updateOne).toHaveBeenCalledWith(...[
                projectId,
                taskId,
                MOCK_SAVE_TASK_CONSTRAINTS_RESOURCE,
                taskConstraintVersion,
            ]);
            expect(result).toEqual(expectedResult);
        });
    });
});
