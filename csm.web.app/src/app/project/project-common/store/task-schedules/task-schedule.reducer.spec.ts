/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {Action} from '@ngrx/store';
import {
    cloneDeep,
    head,
    last
} from 'lodash';
import * as moment from 'moment';

import {
    MOCK_DAY_CARD_A,
    MOCK_DAY_CARD_RESOURCE_A,
    MOCK_DAY_CARD_RESOURCE_B
} from '../../../../../test/mocks/day-cards';
import {
    MOCK_TASK_SCHEDULE_ENTITY_WITHOUT_SLOTS,
    MOCK_TASK_SCHEDULE_RESOURCE_A,
    MOCK_TASK_SCHEDULE_RESOURCE_B,
} from '../../../../../test/mocks/task-schedules';
import {
    MOCK_TASK_RESOURCE,
    MOCK_TASK_RESOURCE_2
} from '../../../../../test/mocks/tasks';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TaskResource} from '../../api/tasks/resources/task.resource';
import {
    TaskScheduleLinks,
    TaskScheduleResource,
    TaskScheduleSlotResource,
} from '../../api/tasks/resources/task-schedule.resource';
import {TaskScheduleEntity} from '../../entities/task-schedule/task-schedule.entity';
import {DayCardActions} from '../day-cards/day-card.actions';
import {
    CreateOrUpdateTaskFulfilledPayload,
    ProjectTaskActions,
    ResizeTaskPayload
} from '../tasks/task.actions';
import {TaskScheduleActions} from './task-schedule.actions';
import {TASK_SCHEDULE_SLICE_INITIAL_STATE} from './task-schedule.initial-state';
import {TASK_SCHEDULE_REDUCER} from './task-schedule.reducer';
import {TaskScheduleSlice} from './task-schedule.slice';

describe('Task Schedule Reducer', () => {
    let initialState: TaskScheduleSlice;
    let midState: TaskScheduleSlice;
    let nextState: TaskScheduleSlice;

    const slot: TaskScheduleSlotResource = {
        dayCard: new ResourceReference(MOCK_DAY_CARD_RESOURCE_A.id, 'Test'),
        date: '2023-01-01',
    };
    const slot2: TaskScheduleSlotResource = {
        dayCard: new ResourceReference('2', 'Test2'),
        date: '2023-04-04',
    };
    const slot3: TaskScheduleSlotResource = {
        dayCard: new ResourceReference(MOCK_DAY_CARD_RESOURCE_B.id, 'Test3'),
        date: '2023-04-04',
    };

    const taskSchedule: TaskScheduleResource = {
        ...MOCK_TASK_SCHEDULE_RESOURCE_A,
        slots: [slot, slot2],
    };
    const taskScheduleEntity: TaskScheduleEntity = TaskScheduleEntity.fromResource(taskSchedule);
    const taskSchedule2: TaskScheduleResource = {
        ...MOCK_TASK_SCHEDULE_RESOURCE_B,
        slots: [slot3],
        task: new ResourceReference('123', 'Do something!'),
    };
    const taskScheduleEntity2: TaskScheduleEntity = TaskScheduleEntity.fromResource(taskSchedule2);

    const taskScheduleWithSlotsReverse: TaskScheduleResource = {...taskSchedule, slots: [...taskSchedule.slots].reverse()};
    const taskScheduleWithSlotsReverse2: TaskScheduleResource = {...taskSchedule2, slots: [...taskSchedule2.slots].reverse()};

    const task: TaskResource = {...MOCK_TASK_RESOURCE, _embedded: {...MOCK_TASK_RESOURCE._embedded, schedule: taskSchedule}};
    const task2: TaskResource = {...MOCK_TASK_RESOURCE_2, _embedded: {...MOCK_TASK_RESOURCE_2._embedded, schedule: taskSchedule2}};
    const taskId = taskSchedule.task.id;
    const taskId2 = taskSchedule2.task.id;
    const dayCardId = slot.dayCard.id;
    const dayCardId3 = slot3.dayCard.id;
    const currentDate = moment(MOCK_DAY_CARD_A.date);
    const taskScheduleEntityFromTaskResource = TaskScheduleEntity.fromResource(task._embedded.schedule);
    const taskScheduleEntityFromTaskResource2 = TaskScheduleEntity.fromResource(task2._embedded.schedule);

    beforeEach(() => {
        initialState = TASK_SCHEDULE_SLICE_INITIAL_STATE;
        midState = cloneDeep(TASK_SCHEDULE_SLICE_INITIAL_STATE);
        nextState = cloneDeep(TASK_SCHEDULE_SLICE_INITIAL_STATE);
    });

    it('should handle TaskScheduleActions.Initialize.All', () => {
        const action = new TaskScheduleActions.Initialize.All();

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle DayCardActions.Request.AllByTask', () => {
        const action = new DayCardActions.Request.AllByTask(taskId);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.progress,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Request.AllByTaskFulfilled', () => {
        const action = new DayCardActions.Request.AllByTaskFulfilled(taskSchedule);

        nextState.items = [taskScheduleEntity];
        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskSchedule.task.id]: Object.assign(new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Request.AllByTaskRejected', () => {
        const action = new DayCardActions.Request.AllByTaskRejected(taskId);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.error,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Request.AllFromTasks', () => {
        const action = new DayCardActions.Request.AllFromTasks([taskId, taskId2]);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.progress,
            }),
            [taskId2]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.progress,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Request.AllFromTasksFulfilled', () => {
        const action = new DayCardActions.Request.AllFromTasksFulfilled([taskSchedule]);
        nextState.items = [taskScheduleEntity];
        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskSchedule.task.id]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Request.AllFromTasksRejected', () => {
        const action = new DayCardActions.Request.AllFromTasksRejected([taskId]);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.error,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Create.One', () => {
        const action = new DayCardActions.Create.One({taskId, saveDayCard: null});

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.progress,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Create.OneFulfilled', () => {
        const action = new DayCardActions.Create.OneFulfilled(taskSchedule);

        nextState.items = [taskScheduleEntity];
        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskSchedule.task.id]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Create.OneRejected', () => {
        const action = new DayCardActions.Create.OneRejected(taskId);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.error,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Delete.OneFulfilled', () => {
        const action = new DayCardActions.Delete.OneFulfilled(taskSchedule);

        nextState.items = [taskScheduleEntity];
        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskSchedule.task.id]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Update.OneWithScheduleFulfilled', () => {
        const action = new DayCardActions.Update.OneWithScheduleFulfilled(taskSchedule);

        nextState.items = [taskScheduleEntity];
        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskSchedule.task.id]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Update.Slots', () => {
        const action = new DayCardActions.Update.Slots({taskId, dayCardId, currentDate});

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.progress,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Update.SlotsFulfilled', () => {
        const action = new DayCardActions.Update.SlotsFulfilled(taskSchedule);

        nextState.items = [taskScheduleEntity];
        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskSchedule.task.id]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Update.SlotsRejected', () => {
        const action = new DayCardActions.Update.SlotsRejected(taskId);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.error,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.Request.OneTaskScheduleByTaskIdFulfilled', () => {
        const action = new ProjectTaskActions.Request.OneTaskScheduleByTaskIdFulfilled(taskSchedule);

        nextState.items = [taskScheduleEntity];
        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskSchedule.task.id]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.Start.OneFulfilled', () => {
        const action = new ProjectTaskActions.Start.OneFulfilled(task);

        nextState.items = [taskScheduleEntityFromTaskResource];

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.Close.OneFulfilled', () => {
        const action = new ProjectTaskActions.Close.OneFulfilled(task);

        nextState.items = [taskScheduleEntityFromTaskResource];

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.Request.OneFulfilled', () => {
        const action = new ProjectTaskActions.Request.OneFulfilled(task);

        nextState.items = [taskScheduleEntityFromTaskResource];

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.Request.AllFulfilled', () => {
        const payload = {
            tasks: [task, task2],
        };
        const action = new ProjectTaskActions.Request.AllFulfilled(payload);

        nextState.items = [
            taskScheduleEntityFromTaskResource,
            taskScheduleEntityFromTaskResource2,
        ];

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.Assign.AllFulfilled', () => {
        const payload: any = {
            tasks: [task, task2],
        };
        const action = new ProjectTaskActions.Assign.AllFulfilled(payload);

        nextState.items = [
            taskScheduleEntityFromTaskResource,
            taskScheduleEntityFromTaskResource2,
        ];

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.Send.AllFulfilled', () => {
        const payload: TaskResource[] = [task, task2];
        const action = new ProjectTaskActions.Send.AllFulfilled(payload);

        nextState.items = [
            taskScheduleEntityFromTaskResource,
            taskScheduleEntityFromTaskResource2,
        ];

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.Request.AllCalendarFulfilled', () => {
        const payload: any = {
            tasks: [task, task2],
        };
        const action = new ProjectTaskActions.Request.AllCalendarFulfilled(payload);

        nextState.items = [
            taskScheduleEntityFromTaskResource,
            taskScheduleEntityFromTaskResource2,
        ];

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.Delete.OneFulfilled', () => {
        const action = new ProjectTaskActions.Delete.OneFulfilled(taskSchedule.task.id);

        midState.items = [taskScheduleEntity, taskScheduleEntity2];

        nextState.items = [taskScheduleEntity2];

        expect(TASK_SCHEDULE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.Delete.AllFulfilled', () => {
        const listOfTasksSchedules: TaskScheduleResource[] = Array.from({length: 5}, (_, index): TaskScheduleResource => ({
            ...taskSchedule,
            task: {
                ...taskSchedule.task,
                id: index.toString(),
            },
        }));
        const listOfTaskScheduleEntities =
            listOfTasksSchedules.map(taskScheduleResource => TaskScheduleEntity.fromResource(taskScheduleResource));

        const idsToDelete: string[] = [head(listOfTasksSchedules).task.id, last(listOfTasksSchedules).task.id];
        const action = new ProjectTaskActions.Delete.AllFulfilled(idsToDelete);

        midState.items = listOfTaskScheduleEntities;

        nextState.items = listOfTaskScheduleEntities.slice(1, listOfTaskScheduleEntities.length - 1);

        expect(TASK_SCHEDULE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should replace a schedule if the new one is more recent', () => {
        const recentTask: TaskResource =
            {...task, _embedded: {...task._embedded, schedule: {...task._embedded.schedule, version: task._embedded.schedule.version + 1}}};
        const action = new ProjectTaskActions.Request.OneFulfilled(recentTask);
        const recentTaskSchedule = TaskScheduleEntity.fromResource(recentTask._embedded.schedule);

        midState.items = [taskScheduleEntityFromTaskResource];

        nextState.items = [recentTaskSchedule];

        expect(TASK_SCHEDULE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should remove a schedule if the task do not has a embedded schedule', () => {
        const recentTask: TaskResource = {...task, _embedded: {...task._embedded, schedule: null}};
        const action = new ProjectTaskActions.Request.OneFulfilled(recentTask);

        recentTask._embedded.schedule = null;

        midState.items = [taskScheduleEntityFromTaskResource];

        nextState.items = [];

        expect(TASK_SCHEDULE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle initial state', () => {
        const defaultAction: Action = {type: 'DEFAULT'};

        expect(TASK_SCHEDULE_REDUCER(undefined, defaultAction)).toEqual(initialState);
    });

    it('should handle ProjectTaskActions.MoveOne', () => {
        const action = new ProjectTaskActions.Move.One({
            taskId,
            end: null,
            start: null,
            workAreaId: null,
        });

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.progress,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.MoveOneFulfilled with a schedule update and sort slots', () => {
        const payload: CreateOrUpdateTaskFulfilledPayload = {
            taskId,
            schedule: taskScheduleWithSlotsReverse,
            task: null,
        };
        const action = new ProjectTaskActions.Move.OneFulfilled(payload);

        nextState.items = [taskScheduleEntity];
        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.MoveOneFulfilled without a schedule update', () => {
        const payload: CreateOrUpdateTaskFulfilledPayload = {
            taskId,
            schedule: null,
            task: null,
        };
        const action = new ProjectTaskActions.Move.OneFulfilled(payload);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.MoveOneRejected', () => {
        const action = new ProjectTaskActions.Move.OneRejected(taskId);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.error,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.ResizeOne', () => {
        const payload: ResizeTaskPayload = {
            taskId,
            start: moment(),
            end: moment(),
        };
        const action = new ProjectTaskActions.Resize.One(payload);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.progress,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.ResizeOneFulfilled and sort slots', () => {
        const action = new ProjectTaskActions.Resize.OneFulfilled(taskScheduleWithSlotsReverse);

        nextState.items = [taskScheduleEntity];
        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.ResizeOneRejected', () => {
        const action = new ProjectTaskActions.Resize.OneRejected(taskId);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.error,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.DeleteAllDayCardFulfilled', () => {
        const action = new DayCardActions.Delete.AllFulfilled([taskScheduleWithSlotsReverse, taskScheduleWithSlotsReverse2]);

        nextState.items = [taskScheduleEntity, taskScheduleEntity2];
        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
            [taskId2]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.ApproveAllDayCard', () => {
        const action = new DayCardActions.Approve.All([dayCardId, dayCardId3]);

        midState.items = [MOCK_TASK_SCHEDULE_ENTITY_WITHOUT_SLOTS, taskScheduleEntity, taskScheduleEntity2];

        nextState.items = [MOCK_TASK_SCHEDULE_ENTITY_WITHOUT_SLOTS, taskScheduleEntity, taskScheduleEntity2];
        nextState.lists = Object.assign(new Map(), midState.lists, {
            [taskId]: Object.assign(new AbstractList(), {requestStatus: RequestStatusEnum.progress}),
            [taskId2]: Object.assign(new AbstractList(), {requestStatus: RequestStatusEnum.progress}),
        });

        expect(TASK_SCHEDULE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.ApproveAllDayCardFulfilled', () => {
        const action = new DayCardActions.Approve.AllFulfilled([MOCK_DAY_CARD_RESOURCE_A, MOCK_DAY_CARD_RESOURCE_B]);

        midState.items = [MOCK_TASK_SCHEDULE_ENTITY_WITHOUT_SLOTS, taskScheduleEntity, taskScheduleEntity2];
        midState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), {requestStatus: RequestStatusEnum.progress}),
            [taskId2]: Object.assign(new AbstractList(), {requestStatus: RequestStatusEnum.progress}),
        });

        nextState.items = [MOCK_TASK_SCHEDULE_ENTITY_WITHOUT_SLOTS, taskScheduleEntity, taskScheduleEntity2];
        nextState.lists = Object.assign(new Map(), midState.lists, {
            [taskId]: Object.assign(new AbstractList(), {requestStatus: RequestStatusEnum.success}),
            [taskId2]: Object.assign(new AbstractList(), {requestStatus: RequestStatusEnum.success}),
        });

        expect(TASK_SCHEDULE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.ApproveAllDayCardRejected', () => {
        const action = new DayCardActions.Approve.AllRejected([dayCardId, dayCardId3]);

        midState.items = [MOCK_TASK_SCHEDULE_ENTITY_WITHOUT_SLOTS, taskScheduleEntity, taskScheduleEntity2];

        nextState.items = [MOCK_TASK_SCHEDULE_ENTITY_WITHOUT_SLOTS, taskScheduleEntity, taskScheduleEntity2];
        nextState.lists = Object.assign(new Map(), midState.lists, {
            [taskId]: Object.assign(new AbstractList(), {requestStatus: RequestStatusEnum.error}),
            [taskId2]: Object.assign(new AbstractList(), {requestStatus: RequestStatusEnum.error}),
        });

        expect(TASK_SCHEDULE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.MoveAll', () => {
        const action = new ProjectTaskActions.Move.All([{
            taskId,
            end: null,
            start: null,
            workAreaId: null,
        }, {
            taskId: taskId2,
            end: null,
            start: null,
            workAreaId: null,
        }]);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.progress,
            }),
            [taskId2]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.progress,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.MoveAllFulfilled with a schedule update', () => {
        const payload: CreateOrUpdateTaskFulfilledPayload[] = [{
            taskId,
            schedule: taskSchedule,
            task: null,
        }, {
            taskId: taskId2,
            schedule: taskSchedule2,
            task: null,
        }];
        const action = new ProjectTaskActions.Move.AllFulfilled(payload);

        nextState.items = [taskScheduleEntity, taskScheduleEntity2];
        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
            [taskId2]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.MoveAllFulfilled without a schedule update', () => {
        const payload: CreateOrUpdateTaskFulfilledPayload[] = [{
            taskId,
            schedule: null,
            task: null,
        }, {
            taskId: taskId2,
            schedule: null,
            task: null,
        }];
        const action = new ProjectTaskActions.Move.AllFulfilled(payload);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
            [taskId2]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.MoveAllRejected', () => {
        const action = new ProjectTaskActions.Move.AllRejected([taskId, taskId2]);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.error,
            }),
            [taskId2]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.error,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.CreateAllFulfilled with schedule and sort slots', () => {
        const payload: CreateOrUpdateTaskFulfilledPayload[] = [{
            taskId,
            schedule: taskScheduleWithSlotsReverse,
            task: null,
        }, {
            taskId: taskId2,
            schedule: taskScheduleWithSlotsReverse2,
            task: null,
        }];
        const action = new ProjectTaskActions.Create.AllFulfilled(payload);

        nextState.items = [taskScheduleEntity, taskScheduleEntity2];
        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
            [taskId2]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.CreateAllFulfilled without schedule', () => {
        const payload: CreateOrUpdateTaskFulfilledPayload[] = [{
            taskId,
            schedule: null,
            task: null,
        }, {
            taskId: taskId2,
            schedule: null,
            task: null,
        }];
        const action = new ProjectTaskActions.Create.AllFulfilled(payload);

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
            [taskId2]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.Request.AllByIdsFulfilled', () => {
        const action = new ProjectTaskActions.Request.AllByIdsFulfilled([task]);

        nextState.items = [taskScheduleEntityFromTaskResource];

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.Copy.AllFulfilled', () => {
        const action = new ProjectTaskActions.Copy.AllFulfilled([task]);

        nextState.items = [taskScheduleEntityFromTaskResource];

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DayCardActions.Request.AllFromTasksFulfilled and sort slots', () => {
        const payload: TaskScheduleResource[] = [taskScheduleWithSlotsReverse, taskScheduleWithSlotsReverse2];
        const action = new DayCardActions.Request.AllFromTasksFulfilled(payload);

        nextState.items = [taskScheduleEntity, taskScheduleEntity2];
        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [taskId]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
            [taskId2]: Object.assign(new AbstractList(), new AbstractList<TaskScheduleLinks>(), {
                requestStatus: RequestStatusEnum.success,
            }),
        });

        expect(TASK_SCHEDULE_REDUCER(initialState, action)).toEqual(nextState);
    });
});
