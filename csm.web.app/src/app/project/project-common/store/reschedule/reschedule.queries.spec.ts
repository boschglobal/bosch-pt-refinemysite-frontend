/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    MockStore,
    provideMockStore
} from '@ngrx/store/testing';
import {cloneDeep} from 'lodash';
import {Subject} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_MILESTONE_CRAFT} from '../../../../../test/mocks/milestones';
import {
    MOCK_RESCHEDULE_RESOURCE,
    MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONE,
    MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONES_AND_TASKS,
    MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_TASKS
} from '../../../../../test/mocks/project-reschedule';
import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {RescheduleResource} from '../../api/reschedule/resources/reschedule.resource';
import {Milestone} from '../../models/milestones/milestone';
import {Reschedule} from '../../models/reschedule/reschedule';
import {Task} from '../../models/tasks/task';
import {MilestoneQueries} from '../milestones/milestone.queries';
import {PROJECT_MODULE_INITIAL_STATE} from '../project-module.initial-state';
import {ProjectTaskQueries} from '../tasks/task-queries';
import {RESCHEDULE_SLICE_INITIAL_STATE} from './reschedule.initial-state';
import {RescheduleQueries} from './reschedule.queries';

describe('Reschedule Queries', () => {
    let rescheduleQueries: RescheduleQueries;
    let store: MockStore;

    const milestoneSubject = new Subject<Milestone>();
    const taskSubject = new Subject<Task>();

    const milestoneQueriesMock = mock(MilestoneQueries);
    const projectTaskQueriesMock = mock(ProjectTaskQueries);

    const initialState: Pick<State, 'projectModule'> = {
        projectModule: {
            ...PROJECT_MODULE_INITIAL_STATE,
            rescheduleSlice: {
                ...RESCHEDULE_SLICE_INITIAL_STATE,
                requestStatus: RequestStatusEnum.success,
                item: MOCK_RESCHEDULE_RESOURCE,
            },
        },
    };

    const setStoreState = (newState): void => {
        store.setState(newState);
        store.refreshState();
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockStore({initialState}),
            {
                provide: MilestoneQueries,
                useValue: instance(milestoneQueriesMock),
            },
            {
                provide: ProjectTaskQueries,
                useValue: instance(projectTaskQueriesMock),
            },
        ],
    };

    when(milestoneQueriesMock.observeMilestoneById(anything())).thenReturn(milestoneSubject);
    when(projectTaskQueriesMock.observeTaskById(anything())).thenReturn(taskSubject);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        rescheduleQueries = TestBed.inject(RescheduleQueries);
        store = TestBed.inject(MockStore);
    });

    it('should observe reschedule request status', () => {
        rescheduleQueries
            .observeRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe reschedule current resource item', () => {
        rescheduleQueries
            .observeCurrentItem()
            .subscribe((item: RescheduleResource) =>
                expect(item).toEqual(MOCK_RESCHEDULE_RESOURCE));
    });

    it('should observe reschedule without failed milestones or tasks', (done) => {
        const expectedReschedule = Reschedule.fromRescheduleResource(MOCK_RESCHEDULE_RESOURCE);
        rescheduleQueries
            .observeRescheduleWithResources()
            .subscribe((item: Reschedule) => {
                expect(item).toEqual(expectedReschedule);
                done();
            });
    });

    it('should observe reschedule with failed milestones', (done) => {
        const expectedReschedule = Reschedule.fromRescheduleResource(
            MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONE, [], [MOCK_MILESTONE_CRAFT]);
        const newState = cloneDeep(initialState);

        newState.projectModule.rescheduleSlice.item = MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONE;
        setStoreState(newState);

        rescheduleQueries
            .observeRescheduleWithResources()
            .subscribe((item: Reschedule) => {
                expect(item).toEqual(expectedReschedule);
                done();
            });

        milestoneSubject.next(MOCK_MILESTONE_CRAFT);
    });

    it('should observe reschedule with failed tasks', (done) => {
        const expectedReschedule = Reschedule.fromRescheduleResource(
            MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_TASKS, [MOCK_TASK], []);
        const newState = cloneDeep(initialState);

        newState.projectModule.rescheduleSlice.item = MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_TASKS;
        setStoreState(newState);

        rescheduleQueries
            .observeRescheduleWithResources()
            .subscribe((item: Reschedule) => {
                expect(item).toEqual(expectedReschedule);
                done();
            });

        taskSubject.next(MOCK_TASK);
    });

    it('should observe reschedule with failed tasks and wait for the task schedule to be present', () => {
        const expectedReschedule = Reschedule.fromRescheduleResource(
            MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_TASKS, [MOCK_TASK], []);
        const newState = cloneDeep(initialState);
        const results = [];
        const taskWithoutSchedule: Task = {
            ...MOCK_TASK,
            schedule: null,
        };

        newState.projectModule.rescheduleSlice.item = MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_TASKS;
        setStoreState(newState);

        rescheduleQueries
            .observeRescheduleWithResources()
            .subscribe((item: Reschedule) => {
                results.push(item);
            });

        taskSubject.next(taskWithoutSchedule);

        expect(results.length).toBe(0);

        taskSubject.next(MOCK_TASK);

        expect(results[0]).toEqual(expectedReschedule);
    });

    it('should observe reschedule with failed milestones and tasks', (done) => {
        const expectedReschedule = Reschedule.fromRescheduleResource(
            MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONES_AND_TASKS, [MOCK_TASK], [MOCK_MILESTONE_CRAFT]);
        const newState = cloneDeep(initialState);

        newState.projectModule.rescheduleSlice.item = MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONES_AND_TASKS;
        setStoreState(newState);

        rescheduleQueries
            .observeRescheduleWithResources()
            .subscribe((item: Reschedule) => {
                expect(item).toEqual(expectedReschedule);
                done();
            });

        milestoneSubject.next(MOCK_MILESTONE_CRAFT);
        taskSubject.next(MOCK_TASK);
    });
});
