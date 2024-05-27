/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {MOCK_TASK} from '../../../../test/mocks/tasks';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../shared/rest/constants/date-format.constant';
import {Task} from '../models/tasks/task';
import {TaskSortHelper} from './task-sort.helper';

interface TaskCustomizableParams {
    id?: string;
    name?: string;
    craftName?: string;
    companyName?: string;
    startDate?: string;
    endDate?: string;
    workAreaId?: string;
}

describe('Task Sort Helper', () => {

    const currentDate = moment();

    const workarea1 = {
        id: 'workarea-1',
        position: 1,
    };

    const workarea2 = {
        id: 'workarea-2',
        position: 2,
    };

    const workarea3 = {
        id: 'workarea-3',
        position: 3,
    };

    const getCustomizedTask = (task: Task, taskCustomizableParams: TaskCustomizableParams): Task => {
        const {projectCraft, company, schedule, workArea} = task;
        const {id, name, craftName, companyName, startDate, endDate, workAreaId} = taskCustomizableParams;

        return {
            ...task,
            ...id !== undefined ? {id} : {},
            ...name !== undefined ? {name} : {},
            projectCraft: {
                ...projectCraft,
                ...craftName !== undefined ? {name: craftName} : {},
            },
            company: {
                ...company,
                ...companyName !== undefined ? {displayName: companyName} : {},
            },
            schedule: {
                ...schedule,
                ...startDate !== undefined ? {start: startDate} : {},
                ...endDate !== undefined ? {end: endDate} : {},
            },
            workArea: {
                ...workArea,
                ...workAreaId !== undefined ? {id: workAreaId} : {},
            },
        };
    };

    const baseTask = MOCK_TASK;

    const task1: Task = getCustomizedTask(baseTask, {
        id: 'task1',
        name: 'A',
        craftName: 'A',
        companyName: 'A',
        startDate: currentDate.clone().format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        endDate: currentDate.clone().add(1, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        workAreaId: workarea1.id,
    });

    const task2: Task = getCustomizedTask(baseTask, {
        id: 'task2',
        name: 'B',
        craftName: 'B',
        companyName: 'B',
        startDate: currentDate.clone().add(1, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        endDate: currentDate.clone().add(2, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        workAreaId: workarea2.id,
    });

    const task3: Task = getCustomizedTask(baseTask, {
        id: 'task3',
        name: 'C',
        craftName: 'C',
        companyName: 'C',
        startDate: currentDate.clone().add(2, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        endDate: currentDate.clone().add(3, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        workAreaId: workarea3.id,
    });

    const task4: Task = getCustomizedTask(baseTask, {
        id: 'task4',
        name: 'D',
        craftName: 'D',
        companyName: 'D',
        startDate: currentDate.clone().add(3, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        endDate: currentDate.clone().add(4, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        workAreaId: null,
    });

    const workareas: any[] = [workarea1, workarea2, workarea3];
    const tasks: Task[] = [task1, task2, task3, task4];

    it('should sort tasks for relation list primarily by task id when all other fields are the same', () => {
        const newTasks = tasks.map(task => getCustomizedTask(baseTask, {id: task.id}));
        const shiftedResult = [...newTasks].reverse();
        const expectedResult = newTasks;
        const sortedTasks = TaskSortHelper.sortForRelationList(shiftedResult, workareas);

        expect(sortedTasks).toEqual(expectedResult);
    });

    it('should sort tasks for relation list primarily by task name when all other fields are the same', () => {
        const newTasks = tasks.map(task => getCustomizedTask(baseTask, {name: task.name}));
        const shiftedResult = [...newTasks].reverse();
        const expectedResult = newTasks;
        const sortedTasks = TaskSortHelper.sortForRelationList(shiftedResult, workareas);

        expect(sortedTasks).toEqual(expectedResult);
    });

    it('should sort tasks for relation list primarily by craft name when all other fields are the same', () => {
        const newTasks = tasks.map(task => getCustomizedTask(baseTask, {craftName: task.projectCraft.name}));
        const shiftedResult = [...newTasks].reverse();
        const expectedResult = newTasks;
        const sortedTasks = TaskSortHelper.sortForRelationList(shiftedResult, workareas);

        expect(sortedTasks).toEqual(expectedResult);
    });

    it('should sort tasks for relation list primarily by company name when all other fields are the same', () => {
        const newTasks = tasks.map(task => getCustomizedTask(baseTask, {companyName: task.company.displayName}));
        const shiftedResult = [...newTasks].reverse();
        const expectedResult = newTasks;
        const sortedTasks = TaskSortHelper.sortForRelationList(shiftedResult, workareas);

        expect(sortedTasks).toEqual(expectedResult);
    });

    it('should sort tasks for relation list primarily by task schedule end when all other fields are the same', () => {
        const newTasks = tasks.map(task => getCustomizedTask(baseTask, {endDate: task.schedule.end}));
        const shiftedResult = [...newTasks].reverse();
        const expectedResult = newTasks;
        const sortedTasks = TaskSortHelper.sortForRelationList(shiftedResult, workareas);

        expect(sortedTasks).toEqual(expectedResult);
    });

    it('should sort tasks for relation list primarily by task schedule start when all other fields are the same', () => {
        const newTasks = tasks.map(task => getCustomizedTask(baseTask, {startDate: task.schedule.start}));
        const shiftedResult = [...newTasks].reverse();
        const expectedResult = newTasks;
        const sortedTasks = TaskSortHelper.sortForRelationList(shiftedResult, workareas);

        expect(sortedTasks).toEqual(expectedResult);
    });

    it('should sort tasks for relation list primarily by workarea placement when all other fields are the same', () => {
        const newTasks = tasks.map(task => getCustomizedTask(baseTask, {workAreaId: task.workArea.id}));
        const shiftedResult = [...newTasks].reverse();
        const expectedResult = newTasks;
        const sortedTasks = TaskSortHelper.sortForRelationList(shiftedResult, workareas);

        expect(sortedTasks).toEqual(expectedResult);
    });

    it('should sort tasks for relation list respecting the sorting criteria order', () => {
        const task = getCustomizedTask(baseTask, {
            startDate: currentDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            endDate: currentDate.clone().add(1, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            workAreaId: workarea2.id,
            companyName: '2',
            craftName: '2',
            name: '2',
            id: '2',
        });
        const expectedResult = [
            getCustomizedTask(task, {startDate: moment(task.schedule.start).subtract(1, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT)}),
            getCustomizedTask(task, {endDate: moment(task.schedule.end).subtract(1, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT)}),
            getCustomizedTask(task, {workAreaId: workarea1.id}),
            getCustomizedTask(task, {companyName: '1'}),
            getCustomizedTask(task, {craftName: '1'}),
            getCustomizedTask(task, {name: '1'}),
            getCustomizedTask(task, {id: '1'}),
        ];
        const shiftedResult = [...expectedResult].reverse();
        const sortedTasks = TaskSortHelper.sortForRelationList(shiftedResult, workareas);

        expect(sortedTasks).toEqual(expectedResult);
    });
});
