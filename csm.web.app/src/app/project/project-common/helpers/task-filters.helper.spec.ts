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
import * as moment from 'moment/moment';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_TASK_SCHEDULE_A} from '../../../../test/mocks/task-schedules';
import {MOCK_TASK_ENTITY} from '../../../../test/mocks/tasks';
import {ResourceReference} from '../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {DateParserStrategy} from '../../../shared/ui/dates/date-parser.strategy';
import {WORKAREA_UUID_EMPTY} from '../constants/workarea.constant';
import {TaskStatusEnum} from '../enums/task-status.enum';
import {TopicCriticalityEnum} from '../enums/topic-criticality.enum';
import {Task} from '../models/tasks/task';
import {ProjectTaskFiltersCriteria} from '../store/tasks/slice/project-task-filters-criteria';
import {ProjectDateParserStrategy} from './project-date-parser.strategy';
import {TaskFiltersHelper} from './task-filters.helper';

describe('Task Filters Helper', () => {
    let taskFiltersHelper: TaskFiltersHelper;

    const dateParserStrategyMock: DateParserStrategy = mock(ProjectDateParserStrategy);

    const moduleDef: TestModuleMetadata = {
        providers: [
            TaskFiltersHelper,
            {
                provide: DateParserStrategy,
                useValue: instance(dateParserStrategyMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => taskFiltersHelper = TestBed.inject(TaskFiltersHelper));

    it('should match task with any status when the status filter criteria is empty', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.status = [];
        task.status = TaskStatusEnum.OPEN;

        expect(taskFiltersHelper.matchTaskStatus(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should match task with same status of the filter criteria', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.status = [TaskStatusEnum.OPEN];
        task.status = TaskStatusEnum.OPEN;

        expect(taskFiltersHelper.matchTaskStatus(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should not match task with different status from the filter criteria', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.status = [TaskStatusEnum.DRAFT];
        task.status = TaskStatusEnum.OPEN;

        expect(taskFiltersHelper.matchTaskStatus(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should match task with any craft when the craft filter criteria is empty', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.projectCraftIds = [];
        task.projectCraft = {id: 'foo', name: 'foo', color: '#FFF'};

        expect(taskFiltersHelper.matchTaskProjectCraft(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should match task with same craft of the filter criteria', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.projectCraftIds = ['foo'];
        task.projectCraft = {id: 'foo', name: 'foo', color: '#FFF'};

        expect(taskFiltersHelper.matchTaskProjectCraft(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should not match task with different craft from the filter criteria', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.projectCraftIds = ['bar'];
        task.projectCraft = {id: 'foo', name: 'foo', color: '#FFF'};

        expect(taskFiltersHelper.matchTaskProjectCraft(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should match task with any work area when the work area filter criteria is empty', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.workAreaIds = [];
        task.workArea = new ResourceReference('foo', 'Foo');

        expect(taskFiltersHelper.matchTaskWorkArea(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should match task with same work area of the filter criteria', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.workAreaIds = ['foo'];
        task.workArea = new ResourceReference('foo', 'Foo');

        expect(taskFiltersHelper.matchTaskWorkArea(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should match task without work area when the work area filter criteria is WORKAREA_UUID_EMPTY', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.workAreaIds = [WORKAREA_UUID_EMPTY];
        task.workArea = undefined;

        expect(taskFiltersHelper.matchTaskWorkArea(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should not match task with different work area from the filter criteria', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.workAreaIds = ['bar'];
        task.workArea = new ResourceReference('foo', 'Foo');

        expect(taskFiltersHelper.matchTaskWorkArea(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should match any task assigned or unassigned when the assignees filter criteria is empty', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.assignees.companyIds = [];
        taskFiltersCriteria.assignees.participantIds = [];

        expect(taskFiltersHelper.matchTaskAssignees(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should match task with same company of the filter criteria', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.assignees.companyIds = ['foo'];
        taskFiltersCriteria.assignees.participantIds = [];
        task.company = new ResourceReference('foo', 'Foo');

        expect(taskFiltersHelper.matchTaskAssignees(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should match task with same assignee of the filter criteria', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.assignees.companyIds = [];
        taskFiltersCriteria.assignees.participantIds = ['foo'];
        task.assignee = new ResourceReferenceWithPicture('foo', 'Foo', null);

        expect(taskFiltersHelper.matchTaskAssignees(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should not match task with different company from the filter criteria', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.assignees.companyIds = ['bar'];
        taskFiltersCriteria.assignees.participantIds = [];
        task.company = new ResourceReference('foo', 'Foo');

        expect(taskFiltersHelper.matchTaskAssignees(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should not match task with different assignee from the filter criteria', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.assignees.companyIds = [];
        taskFiltersCriteria.assignees.participantIds = ['bar'];
        task.assignee = new ResourceReferenceWithPicture('foo', 'Foo', null);

        expect(taskFiltersHelper.matchTaskAssignees(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should match task with any scope when scope filter criteria is empty', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.from = null;
        taskFiltersCriteria.to = null;

        expect(taskFiltersHelper.matchTaskScope(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should match task that ends on the same day or after the scope "from" of the filter criteria' +
        ' and allDaysInDateRange is false', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.allDaysInDateRange = false;
        taskFiltersCriteria.from = moment(MOCK_TASK_SCHEDULE_A.end);
        taskFiltersCriteria.to = null;

        when(dateParserStrategyMock.isSameOrAfter(anything(), taskFiltersCriteria.from, 'w')).thenReturn(true);

        expect(taskFiltersHelper.matchTaskScope(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should not match task that ends before the scope "from" of the filter criteria and allDaysInDateRange is false', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.allDaysInDateRange = false;
        taskFiltersCriteria.from = moment(MOCK_TASK_SCHEDULE_A.end).add(1, 'd');
        taskFiltersCriteria.to = null;

        when(dateParserStrategyMock.isSameOrAfter(anything(), taskFiltersCriteria.from, 'w')).thenReturn(false);

        expect(taskFiltersHelper.matchTaskScope(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should match task that starts on the same day or before the scope "to" of the filter criteria' +
        ' and allDaysInDateRange is false', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.allDaysInDateRange = false;
        taskFiltersCriteria.from = null;
        taskFiltersCriteria.to = moment(MOCK_TASK_SCHEDULE_A.start);

        when(dateParserStrategyMock.isSameOrBefore(anything(), taskFiltersCriteria.to, 'w')).thenReturn(true);

        expect(taskFiltersHelper.matchTaskScope(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should not match task that starts after the scope "to" of the filter criteria and allDaysInDateRange is false', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.allDaysInDateRange = false;
        taskFiltersCriteria.from = null;
        taskFiltersCriteria.to = moment(MOCK_TASK_SCHEDULE_A.start).subtract(1, 'd');

        when(dateParserStrategyMock.isSameOrBefore(anything(), taskFiltersCriteria.to, 'w')).thenReturn(false);

        expect(taskFiltersHelper.matchTaskScope(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should match task that is intercepted by the scope "from" and "to" of the filter criteria and allDaysInDateRange is false', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.allDaysInDateRange = false;
        taskFiltersCriteria.from = moment(MOCK_TASK_SCHEDULE_A.start);
        taskFiltersCriteria.to = moment(MOCK_TASK_SCHEDULE_A.end);

        when(dateParserStrategyMock.isSameOrAfter(anything(), taskFiltersCriteria.from, 'w')).thenReturn(true);
        when(dateParserStrategyMock.isSameOrBefore(anything(), taskFiltersCriteria.to, 'w')).thenReturn(true);

        expect(taskFiltersHelper.matchTaskScope(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should not match task that is not intercepted by the scope "from" and "to" of the filter criteria' +
        ' and allDaysInDateRange is false', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.allDaysInDateRange = false;
        taskFiltersCriteria.from = moment(MOCK_TASK_SCHEDULE_A.end).add(1, 'd');
        taskFiltersCriteria.to = moment(MOCK_TASK_SCHEDULE_A.end).add(5, 'd');

        when(dateParserStrategyMock.isSameOrAfter(anything(), taskFiltersCriteria.from, 'w')).thenReturn(false);
        when(dateParserStrategyMock.isSameOrBefore(anything(), taskFiltersCriteria.to, 'w')).thenReturn(false);

        expect(taskFiltersHelper.matchTaskScope(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should match task that starts on the same day or after the scope "from" of the filter criteria' +
        ' and allDaysInDateRange is true', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.allDaysInDateRange = true;
        taskFiltersCriteria.from = moment(MOCK_TASK_SCHEDULE_A.start);
        taskFiltersCriteria.to = null;

        expect(taskFiltersHelper.matchTaskScope(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should not match task that starts before the scope "from" of the filter criteria and allDaysInDateRange is true', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.allDaysInDateRange = true;
        taskFiltersCriteria.from = moment(MOCK_TASK_SCHEDULE_A.start).add(1, 'd');
        taskFiltersCriteria.to = null;

        expect(taskFiltersHelper.matchTaskScope(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should match task that ends on the same day or before the scope "to" of the filter criteria' +
        ' and allDaysInDateRange is true', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.allDaysInDateRange = true;
        taskFiltersCriteria.from = null;
        taskFiltersCriteria.to = moment(MOCK_TASK_SCHEDULE_A.end);

        expect(taskFiltersHelper.matchTaskScope(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should not match task that ends after the scope "to" of the filter criteria and allDaysInDateRange is true', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.allDaysInDateRange = true;
        taskFiltersCriteria.from = null;
        taskFiltersCriteria.to = moment(MOCK_TASK_SCHEDULE_A.end).subtract(1, 'd');

        expect(taskFiltersHelper.matchTaskScope(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should match task that starts and end between the scope "from" "to" of the filter criteria and allDaysInDateRange is true', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.allDaysInDateRange = true;
        taskFiltersCriteria.from = moment(MOCK_TASK_SCHEDULE_A.start);
        taskFiltersCriteria.to = moment(MOCK_TASK_SCHEDULE_A.end);

        expect(taskFiltersHelper.matchTaskScope(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should not match task that doesn\'t start and ends between the scope "from" "to" of the filter criteria' +
        ' and allDaysInDateRange is true', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.allDaysInDateRange = true;
        taskFiltersCriteria.from = moment(MOCK_TASK_SCHEDULE_A.start).add(1, 'd');
        taskFiltersCriteria.to = moment(MOCK_TASK_SCHEDULE_A.end).subtract(1, 'd');

        expect(taskFiltersHelper.matchTaskScope(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should match task without topics when the hasTopic filter criteria is disabled', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.hasTopics = false;

        expect(taskFiltersHelper.matchTaskTopics(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should match task with topics when the hasTopic filter criteria is enabled', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.hasTopics = true;
        task.statistics = {
            uncriticalTopics: 1,
            criticalTopics: 0,
        };

        expect(taskFiltersHelper.matchTaskTopics(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should match task with critical topics when the hasTopic filter criteria is enabled', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.hasTopics = true;
        task.statistics = {
            uncriticalTopics: 0,
            criticalTopics: 1,
        };

        expect(taskFiltersHelper.matchTaskTopics(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should match task without topics when the hasTopic filter criteria is enabled', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.hasTopics = true;
        task.statistics = {
            uncriticalTopics: 0,
            criticalTopics: 0,
        };

        expect(taskFiltersHelper.matchTaskTopics(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should match task without critical topics when the topicCriticality filter criteria is empty', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.topicCriticality = [];
        task.statistics = {
            uncriticalTopics: 0,
            criticalTopics: 0,
        };

        expect(taskFiltersHelper.matchTaskCriticalTopics(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should match task with critical topics when the topicCriticality filter criteria is enabled', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.topicCriticality = [TopicCriticalityEnum.CRITICAL];
        task.statistics = {
            uncriticalTopics: 0,
            criticalTopics: 1,
        };

        expect(taskFiltersHelper.matchTaskCriticalTopics(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should not match task without critical topics when the topicCriticality filter criteria is enabled', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.topicCriticality = [TopicCriticalityEnum.CRITICAL];
        task.statistics = {
            uncriticalTopics: 0,
            criticalTopics: 0,
        };

        expect(taskFiltersHelper.matchTaskCriticalTopics(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should not match task with only uncritical topics when the topicCriticality filter criteria is enabled', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.topicCriticality = [TopicCriticalityEnum.CRITICAL];
        task.statistics = {
            uncriticalTopics: 1,
            criticalTopics: 0,
        };

        expect(taskFiltersHelper.matchTaskCriticalTopics(task, taskFiltersCriteria)).toBeFalsy();
    });

    it('should match any task when the filter criteria is empty', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        expect(taskFiltersHelper.matchTask(task, taskFiltersCriteria)).toBeTruthy();
    });

    it('should match task if one of the criteria fails', () => {
        const taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        const task = Task.fromTaskEntity(MOCK_TASK_ENTITY, MOCK_TASK_SCHEDULE_A);

        taskFiltersCriteria.status = [TaskStatusEnum.DRAFT];
        task.status = TaskStatusEnum.OPEN;

        expect(taskFiltersHelper.matchTask(task, taskFiltersCriteria)).toBeFalsy();
    });
});
