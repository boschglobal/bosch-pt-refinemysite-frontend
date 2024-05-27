/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
    MOCK_DAY_CARD_A,
    MOCK_DAY_CARD_RESOURCE_A
} from '../../../../../test/mocks/day-cards';
import {MockStore} from '../../../../../test/mocks/store';
import {
    MOCK_TASK_SCHEDULE_A,
    MOCK_TASK_SCHEDULE_ENTITY_A,
    MOCK_TASK_SCHEDULE_ENTITY_WITHOUT_SLOTS,
    MOCK_TASK_SCHEDULE_RESOURCE_A,
} from '../../../../../test/mocks/task-schedules';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TaskScheduleLinks} from '../../api/tasks/resources/task-schedule.resource';
import {TaskScheduleQueries} from './task-schedule.queries';
import {TaskScheduleSlice} from './task-schedule.slice';

describe('Task Schedule Queries', () => {
    let taskScheduleQueries: TaskScheduleQueries;

    const taskId = MOCK_TASK_SCHEDULE_RESOURCE_A.task.id;
    const taskScheduleId = MOCK_TASK_SCHEDULE_RESOURCE_A.id;

    const dayCardList: AbstractList<TaskScheduleLinks> = {
        ids: [MOCK_DAY_CARD_RESOURCE_A.id],
        requestStatus: RequestStatusEnum.success,
        version: 0,
        _links: {
            self: {
                href: '',
            },
            add: {
                href: '',
            },
        },
    };

    const taskScheduleSlice: TaskScheduleSlice = {
        items: [
            MOCK_TASK_SCHEDULE_ENTITY_A,
            MOCK_TASK_SCHEDULE_ENTITY_WITHOUT_SLOTS,
        ],
        lists: Object.assign(new Map(), {
            [taskId]: dayCardList,
        }),
    };

    const state: any = {
        projectModule: {
            taskScheduleSlice,
        },
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            TaskScheduleQueries,
            {
                provide: Store,
                useValue: new MockStore(state),
            },
            HttpClient,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => taskScheduleQueries = TestBed.inject(TaskScheduleQueries));

    it('should observe task schedule by id', () => {
        taskScheduleQueries
            .observeTaskScheduleById(taskScheduleId)
            .subscribe(result =>
                expect(result).toEqual(MOCK_TASK_SCHEDULE_A));
    });

    it('should observe task schedule by task id', () => {
        taskScheduleQueries
            .observeTaskScheduleByTaskId(taskId)
            .subscribe(result =>
                expect(result).toEqual(MOCK_TASK_SCHEDULE_A));
    });

    it('should retrieve the date of a daycard by daycard id', () => {
        expect(taskScheduleQueries.getDateForDaycard(MOCK_DAY_CARD_RESOURCE_A.id, MOCK_DAY_CARD_RESOURCE_A.task.id)(state))
            .toEqual(MOCK_DAY_CARD_A.date);
    });

    it('should not retrieve the date of a daycard when the schedule do not exist', () => {
        expect(taskScheduleQueries.getDateForDaycard('missingDayCardId', 'missingTaskId')(state)).toBeNull();
    });

    it('should observe task schedule request status by task id', () => {
        taskScheduleQueries
            .observeTaskScheduleRequestStatusByTask(taskId)
            .subscribe(result =>
                expect(result).toEqual(RequestStatusEnum.success));
    });

    it('should return true if task schedule exists', () => {
        expect(taskScheduleQueries.hasTaskScheduleById(taskScheduleId)).toBeTruthy();
    });

    it('should return false if task schedule does not exist', () => {
        expect(taskScheduleQueries.hasTaskScheduleById('NOT_EXISTING_TASK_SCHEDULE')).toBeFalsy();
    });
});
