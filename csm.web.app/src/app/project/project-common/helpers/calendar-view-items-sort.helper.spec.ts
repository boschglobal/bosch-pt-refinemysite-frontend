/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {MOCK_MILESTONE_CRAFT} from '../../../../test/mocks/milestones';
import {MOCK_TASK} from '../../../../test/mocks/tasks';
import {
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B,
    MOCK_WORKAREA_C,
} from '../../../../test/mocks/workareas';
import {ObjectTypeEnum} from '../../../shared/misc/enums/object-type.enum';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../shared/rest/constants/date-format.constant';
import {WorkareaResource} from '../api/workareas/resources/workarea.resource';
import {Milestone} from '../models/milestones/milestone';
import {Task} from '../models/tasks/task';
import {
    CalendarViewItem,
    CalendarViewItemsSortHelper
} from './calendar-view-items-sort.helper';

interface MilestoneCustomizableParams {
    id: string;
    date?: moment.Moment;
    workAreaId?: string;
    header?: boolean;
}

interface TaskCustomizableParams {
    id: string;
    startDate?: string;
    workAreaId?: string;
}

describe('Calendar View Items Sort Helper', () => {

    const currentDate = moment().startOf('day');

    const getCustomizedTask = (task: Task, taskCustomizableParams: TaskCustomizableParams): Task => {
        const {schedule, workArea} = task;
        const {id, startDate, workAreaId} = taskCustomizableParams;

        return {
            ...task,
            id,
            schedule: {
                ...schedule,
                ...startDate !== undefined ? {start: startDate} : {},
            },
            workArea: {
                ...workArea,
                ...workAreaId !== undefined ? {id: workAreaId} : {},
            },
        };
    };
    const getCustomizedMilestone = (milestone: Milestone, milestoneCustomizableParams: MilestoneCustomizableParams): Milestone => {
        const {id, date, workAreaId, header} = milestoneCustomizableParams;

        return {
            ...milestone,
            id,
            ...date !== undefined ? {date} : {},
            ...header !== undefined ? {header} : {},
            ...workAreaId !== undefined ? {workArea: {id: workAreaId, displayName: workAreaId}} : {},
        };
    };

    const baseTask = MOCK_TASK;
    const baseMilestone = MOCK_MILESTONE_CRAFT;
    const workareas: WorkareaResource[] = [
        MOCK_WORKAREA_A,
        MOCK_WORKAREA_B,
        MOCK_WORKAREA_C,
    ];

    it('should sort tasks and milestones when they all have different dates', () => {
        const startDateTask1 = currentDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const startDateTask2 = currentDate.clone().add(3, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const task1: Task = getCustomizedTask(baseTask, {id: 'task1', startDate: startDateTask1});
        const task2: Task = getCustomizedTask(baseTask, {id: 'task2', startDate: startDateTask2});
        const milestone1: Milestone = getCustomizedMilestone(baseMilestone, {id: 'milestone1', date: currentDate.clone().add(1, 'd')});
        const milestone2: Milestone = getCustomizedMilestone(baseMilestone, {id: 'milestone2', date: currentDate.clone().add(2, 'd')});
        const expectedResult: CalendarViewItem[] = [
            {resource: task1, type: ObjectTypeEnum.Task},
            {resource: milestone1, type: ObjectTypeEnum.Milestone},
            {resource: milestone2, type: ObjectTypeEnum.Milestone},
            {resource: task2, type: ObjectTypeEnum.Task},
        ];
        const shiftedResult = [...expectedResult].reverse();
        const sortedItems = CalendarViewItemsSortHelper.sort(shiftedResult, workareas);

        expect(sortedItems).toEqual(expectedResult);
    });

    it('should sort tasks and milestones when they all have the same dates, but different workareas', () => {
        const startDate = currentDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const task1: Task = getCustomizedTask(baseTask, {startDate, id: 'task1', workAreaId: workareas[0].id});
        const task2: Task = getCustomizedTask(baseTask, {startDate, id: 'task2', workAreaId: null});
        const milestone1: Milestone = getCustomizedMilestone(baseMilestone, {
            id: 'milestone1',
            date: currentDate,
            workAreaId: null,
            header: true,
        });
        const milestone2: Milestone = getCustomizedMilestone(baseMilestone, {
            id: 'milestone2',
            date: currentDate,
            workAreaId: workareas[1].id,
        });
        const expectedResult = [
            {resource: milestone1, type: ObjectTypeEnum.Milestone},
            {resource: task1, type: ObjectTypeEnum.Task},
            {resource: milestone2, type: ObjectTypeEnum.Milestone},
            {resource: task2, type: ObjectTypeEnum.Task},
        ];
        const shiftedResult = [...expectedResult].reverse();
        const sortedItems = CalendarViewItemsSortHelper.sort(shiftedResult, workareas);

        expect(sortedItems).toEqual(expectedResult);
    });

    it('should sort tasks and milestones with milestones at the top when they all have the same dates and same workareas', () => {
        const startDate = currentDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const task1: Task = getCustomizedTask(baseTask, {startDate, id: 'task1', workAreaId: workareas[0].id});
        const milestone1: Milestone = getCustomizedMilestone(baseMilestone, {
            id: 'milestone1',
            date: currentDate,
            workAreaId: workareas[0].id,
        });
        const expectedResult = [
            {resource: milestone1, type: ObjectTypeEnum.Milestone},
            {resource: task1, type: ObjectTypeEnum.Task},
        ];
        const shiftedResult = [...expectedResult].reverse();
        const sortedItems = CalendarViewItemsSortHelper.sort(shiftedResult, workareas);

        expect(sortedItems).toEqual(expectedResult);
    });
});
