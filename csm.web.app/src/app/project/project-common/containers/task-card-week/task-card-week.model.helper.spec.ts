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
import * as moment from 'moment';

import {MOCK_NEWS_ITEMS} from '../../../../../test/mocks/news';
import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {TimeScope} from '../../../../shared/misc/api/datatypes/time-scope.datatype';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {CRAFT_COLORS} from '../../../../shared/ui/constants/colors.constant';
import {DateParserStrategy} from '../../../../shared/ui/dates/date-parser.strategy';
import {TaskCardDescriptionTypeEnum} from '../../enums/task-card-description-type.enum';
import {Task} from '../../models/tasks/task';
import {
    TaskCardWeekModel,
    TaskCardWeekModelHelper
} from './task-card-week.model.helper';
import SpyObj = jasmine.SpyObj;

describe('Task Card Week Model', () => {
    let taskCardWeekModelHelper: TaskCardWeekModelHelper;
    let dateParserStrategySpy: SpyObj<DateParserStrategy>;

    const task = MOCK_TASK;
    const taskStart = moment(task.schedule.start);
    const taskEnd = moment(task.schedule.end);
    const start = taskStart;
    const end = taskEnd;
    const scope: TimeScope = {start, end};
    const taskCardDescriptionType: TaskCardDescriptionTypeEnum = TaskCardDescriptionTypeEnum.Company;
    const fallbackTaskDescription = '---';

    const moduleDef: TestModuleMetadata = {
        providers: [
            TaskCardWeekModel,
            {
                provide: DateParserStrategy,
                useValue: jasmine.createSpyObj('DateParserStrategy', ['startOfWeek', 'endOfWeek']),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        dateParserStrategySpy = TestBed.inject(DateParserStrategy) as jasmine.SpyObj<DateParserStrategy>;
        taskCardWeekModelHelper = TestBed.inject(TaskCardWeekModelHelper);

        dateParserStrategySpy.startOfWeek.and.returnValue(start);
        dateParserStrategySpy.endOfWeek.and.returnValue(end);
    });

    afterEach(() => {
        dateParserStrategySpy.startOfWeek.calls.reset();
        dateParserStrategySpy.endOfWeek.calls.reset();
    });

    it('should return a Task Card Week Model from a Task and Calendar Scope', () => {
        const {id, name: title, status, constraints, statistics, schedule: {permissions}, company: {displayName: description}} = task;
        const {solid: solidColor, light: lightColor} = CRAFT_COLORS.find(color => color.solid === task.projectCraft.color) || {};
        const expectedCardStart = start;
        const expectedCardEnd = end;
        const taskCardModel = taskCardWeekModelHelper.fromTaskWithScopeNewsAndDescriptionType(task, scope, taskCardDescriptionType);

        expect(taskCardModel.id).toEqual(id);
        expect(taskCardModel.title).toEqual(title);
        expect(taskCardModel.status).toEqual(status);
        expect(taskCardModel.description).toEqual(description);
        expect(taskCardModel.solidColor).toEqual(solidColor);
        expect(taskCardModel.lightColor).toEqual(lightColor);
        expect(taskCardModel.permissions).toEqual(permissions);
        expect(taskCardModel.constraints).toEqual(constraints);
        expect(taskCardModel.statistics).toEqual(statistics);
        expect(taskCardModel.start.isSame(taskStart, 'd')).toBeTruthy();
        expect(taskCardModel.end.isSame(taskEnd, 'd')).toBeTruthy();
        expect(taskCardModel.calendarStart.isSame(start, 'd')).toBeTruthy();
        expect(taskCardModel.calendarEnd.isSame(end, 'd')).toBeTruthy();
        expect(taskCardModel.cardStart.isSame(expectedCardStart, 'd')).toBeTruthy();
        expect(taskCardModel.cardEnd.isSame(expectedCardEnd, 'd')).toBeTruthy();
    });

    it('should return a Task Card Week Model with the correct description when Task Card Description Type is ' +
        `${TaskCardDescriptionTypeEnum.Company} and Task does not have a company`, () => {
        const taskWithoutCompany: Task = {...task, company: null};
        const descriptionTypeAsCompany = TaskCardDescriptionTypeEnum.Company;
        const taskCardModel = taskCardWeekModelHelper
            .fromTaskWithScopeNewsAndDescriptionType(taskWithoutCompany, scope, descriptionTypeAsCompany);

        expect(taskCardModel.description).toEqual(fallbackTaskDescription);
    });

    it('should return a Task Card Week Model with company name as description when Task Card Description Type is ' +
        `${TaskCardDescriptionTypeEnum.Company} and Task has a company`, () => {
        const descriptionTypeAsCompany = TaskCardDescriptionTypeEnum.Company;
        const taskCardModel = taskCardWeekModelHelper.fromTaskWithScopeNewsAndDescriptionType(task, scope, descriptionTypeAsCompany);

        expect(taskCardModel.description).toEqual(task.company.displayName);
    });

    it('should return a Task Card Week Model with assignee as description when Task Card Description Type is ' +
        `${TaskCardDescriptionTypeEnum.Assignee} and Task has a assignee`, () => {
        const descriptionTypeAsAssignee = TaskCardDescriptionTypeEnum.Assignee;
        const taskCardModel = taskCardWeekModelHelper.fromTaskWithScopeNewsAndDescriptionType(task, scope, descriptionTypeAsAssignee);

        expect(taskCardModel.description).toEqual(task.assignee.displayName);
    });

    it('should return a Task Card Week Model with the correct description when Task Card Description Type is ' +
        `${TaskCardDescriptionTypeEnum.Assignee} and Task does not have a assignee`, () => {
        const taskWithoutAssignee: Task = {...task, assignee: null};
        const descriptionTypeAsAssignee = TaskCardDescriptionTypeEnum.Assignee;
        const taskCardModel = taskCardWeekModelHelper
            .fromTaskWithScopeNewsAndDescriptionType(taskWithoutAssignee, scope, descriptionTypeAsAssignee);

        expect(taskCardModel.description).toEqual(fallbackTaskDescription);
    });

    it('should return a Task Card Week Model with discipline name as description when Task Card Description Type is ' +
        `${TaskCardDescriptionTypeEnum.Craft}`, () => {
        const descriptionTypeAsCrafts = TaskCardDescriptionTypeEnum.Craft;
        const taskCardModel = taskCardWeekModelHelper.fromTaskWithScopeNewsAndDescriptionType(task, scope, descriptionTypeAsCrafts);

        expect(taskCardModel.description).toEqual(task.projectCraft.name);
    });

    it('should return a Task Card Week Model with the correct solid and light colors', () => {
        const {
            solid: expectedSolidColor,
            light: expectedLightColor,
        } = CRAFT_COLORS.find(color => color.solid === task.projectCraft.color) || {};
        const taskCardModel = taskCardWeekModelHelper.fromTaskWithScopeNewsAndDescriptionType(task, scope, taskCardDescriptionType);

        expect(taskCardModel.solidColor).toEqual(expectedSolidColor);
        expect(taskCardModel.lightColor).toEqual(expectedLightColor);
    });

    it('should return a Task Card Week Model with undefined solid and light colors when craft color is unknown', () => {
        const taskWithoutCraftColor: Task = {...task, projectCraft: {...task.projectCraft, color: 'UNKNOWN'}};
        const taskCardModel = taskCardWeekModelHelper
            .fromTaskWithScopeNewsAndDescriptionType(taskWithoutCraftColor, scope, taskCardDescriptionType);

        expect(taskCardModel.solidColor).toBeUndefined();
        expect(taskCardModel.lightColor).toBeUndefined();
    });

    it('should return a Task Card Week Model with news when then task has news', () => {
        const taskCardModel: TaskCardWeekModel = taskCardWeekModelHelper
            .fromTaskWithScopeNewsAndDescriptionType(task, scope, taskCardDescriptionType, MOCK_NEWS_ITEMS);

        expect(taskCardModel.hasNews).toBe(true);
    });

    it('should return a Task Card Week Model without news when then task doesn\'t have news', () => {
        const taskCardModel: TaskCardWeekModel = taskCardWeekModelHelper
            .fromTaskWithScopeNewsAndDescriptionType(task, scope, taskCardDescriptionType, []);

        expect(taskCardModel.hasNews).toBe(false);
    });

    it('should not call Date Parser startOfWeek with calendar start when task start is after calendar start', () => {
        const taskStartAfterCalendarStart: Task = {
            ...task,
            schedule: {...task.schedule, start: start.clone().add(1, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT)},
        };

        taskCardWeekModelHelper.fromTaskWithScopeNewsAndDescriptionType(taskStartAfterCalendarStart, scope, taskCardDescriptionType);

        expect(dateParserStrategySpy.startOfWeek).not.toHaveBeenCalledWith(start);
    });

    it('should call Date Parser startOfWeek with calendar start when task start is before calendar start', () => {
        const taskStartBeforeCalendarStart: Task = {
            ...task,
            schedule: {...task.schedule, start: start.clone().subtract(1, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT)},
        };

        taskCardWeekModelHelper.fromTaskWithScopeNewsAndDescriptionType(taskStartBeforeCalendarStart, scope, taskCardDescriptionType);

        expect(dateParserStrategySpy.startOfWeek).toHaveBeenCalledWith(start);
    });

    it('should not call Date Parser endOfWeek with calendar end when task end is before calendar end', () => {
        const taskEndBeforeCalendarEnd: Task = {
            ...task,
            schedule: {...task.schedule, end: end.clone().subtract(1, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT)},
        };

        taskCardWeekModelHelper.fromTaskWithScopeNewsAndDescriptionType(taskEndBeforeCalendarEnd, scope, taskCardDescriptionType);

        expect(dateParserStrategySpy.endOfWeek).not.toHaveBeenCalledWith(end);
    });

    it('should call Date Parser endOfWeek with calendar end when task end is after calendar end', () => {
        const taskEndAfterCalendarEnd: Task = {
            ...task,
            schedule: {...task.schedule, end: end.clone().add(1, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT)},
        };

        taskCardWeekModelHelper.fromTaskWithScopeNewsAndDescriptionType(taskEndAfterCalendarEnd, scope, taskCardDescriptionType);

        expect(dateParserStrategySpy.endOfWeek).toHaveBeenCalledWith(end);
    });
});
