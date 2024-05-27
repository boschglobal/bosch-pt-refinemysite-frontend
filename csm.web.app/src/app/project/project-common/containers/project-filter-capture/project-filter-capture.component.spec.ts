/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {omit} from 'lodash';
import * as moment from 'moment';

import {DateRange} from '../../../../shared/ui/forms/datepicker-calendar/datepicker-calendar.component';
import {MilestoneTypeEnum} from '../../enums/milestone-type.enum';
import {TaskStatusEnum} from '../../enums/task-status.enum';
import {TopicCriticalityEnum} from '../../enums/topic-criticality.enum';
import {MilestoneFilters} from '../../store/milestones/slice/milestone-filters';
import {MilestoneFiltersCriteria} from '../../store/milestones/slice/milestone-filters-criteria';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskFiltersCriteria} from '../../store/tasks/slice/project-task-filters-criteria';
import {
    CommonFilterCaptureComponent,
    CommonFilterFormData,
} from '../common-filter-capture/common-filter-capture.component';
import {
    MilestoneFilterCaptureComponent,
    MilestoneFilterFormData
} from '../milestone-filter-capture/milestone-filter-capture.component';
import {
    TASKS_FILTER_FORM_DEFAULT_VALUE,
    TasksFilterCaptureComponent,
    TasksFilterFormData
} from '../tasks-filter-capture/tasks-filter-capture.component';
import {
    ProjectFilterCaptureComponent,
    ProjectFilterFormData,
    ProjectFiltersCaptureContextEnum
} from './project-filter-capture.component';
import {ProjectFilterCaptureTestComponent} from './project-filter-capture.test.component';

describe('Project Filter Capture Component', () => {
    let testHostComponent: ProjectFilterCaptureTestComponent;
    let component: ProjectFilterCaptureComponent;
    let fixture: ComponentFixture<ProjectFilterCaptureTestComponent>;
    let de: DebugElement;

    const commonFilterCaptureComponentSpy =
        jasmine.createSpyObj<CommonFilterCaptureComponent>('CommonFilterCaptureComponent', ['getFormValue']);
    const taskFilterCaptureComponentSpy =
        jasmine.createSpyObj<TasksFilterCaptureComponent>('TasksFilterCaptureComponent', ['getFormValue', 'getUseCriteria']);
    const milestoneFilterCaptureComponentSpy =
        jasmine.createSpyObj<MilestoneFilterCaptureComponent>('MilestoneFilterCaptureComponent', ['getFormValue', 'getUseCriteria']);

    const milestoneFilters: MilestoneFilters = new MilestoneFilters();
    const taskFilters: ProjectTaskFilters = new ProjectTaskFilters();
    const currentDay = moment();

    const defaultCommonFilterFormData: CommonFilterFormData = {
        range: {start: taskFilters.criteria.from, end: taskFilters.criteria.to},
        workArea: {
            workAreaIds: taskFilters.criteria.workAreaIds,
            header: milestoneFilters.criteria.workAreas.header,
        },
        wholeProjectDuration: false,
    };
    const defaultMilestoneFilterFormData: MilestoneFilterFormData = {
        types: milestoneFilters.criteria.types.types,
        projectCraftIds: milestoneFilters.criteria.types.projectCraftIds,
    };
    const defaultTaskFilterFormData: TasksFilterFormData = {
        ...omit(TASKS_FILTER_FORM_DEFAULT_VALUE, 'assigneeIds'),
        assignees: {
            participantIds: [],
            companyIds: [],
        },
    };

    const defaultRange: DateRange = {
        start: currentDay.clone(),
        end: currentDay.clone().add(1, 'w'),
    };

    const setupTaskAndMilestoneFiltersTestContext = () => {
        testHostComponent.testContext = 'task-and-milestone-filters';
        testHostComponent.milestoneFilters = milestoneFilters;
        testHostComponent.taskFilters = taskFilters;
        fixture.detectChanges();
        setupDefaultComponentHooksAndProperties();
        component.milestoneFilterCapture = milestoneFilterCaptureComponentSpy;
    };

    const setupTaskFiltersTestContext = () => {
        testHostComponent.testContext = 'task-filters';
        testHostComponent.taskFilters = taskFilters;
        fixture.detectChanges();
        setupDefaultComponentHooksAndProperties();
    };

    const setupDefaultComponentHooksAndProperties = () => {
        de = fixture.debugElement.query(By.css(projectFilterCaptureComponentSelector));
        component = de.componentInstance;
        component.commonFilterCapture = commonFilterCaptureComponentSpy;
        component.taskFilterCapture = taskFilterCaptureComponentSpy;
    };

    commonFilterCaptureComponentSpy.getFormValue.and.returnValue(defaultCommonFilterFormData);
    taskFilterCaptureComponentSpy.getFormValue.and.returnValue(defaultTaskFilterFormData);
    taskFilterCaptureComponentSpy.getUseCriteria.and.returnValue(taskFilters.useCriteria);
    milestoneFilterCaptureComponentSpy.getFormValue.and.returnValue(defaultMilestoneFilterFormData);
    milestoneFilterCaptureComponentSpy.getUseCriteria.and.returnValue(milestoneFilters.useCriteria);

    const projectFilterCaptureComponentSelector = 'ss-project-filter-capture';
    const dataAutomationCommonFilterCaptureSelector = '[data-automation="common-filter-capture"]';
    const dataAutomationMilestoneFilterCaptureSelector = '[data-automation="milestone-filter-capture"]';
    const dataAutomationTaskFilterCaptureSelector = '[data-automation="tasks-filter-capture"]';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const getDebugElement = (selector: string): DebugElement => de.query(By.css(selector));

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            ProjectFilterCaptureComponent,
            ProjectFilterCaptureTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectFilterCaptureTestComponent);

        testHostComponent = fixture.componentInstance;

        setupTaskAndMilestoneFiltersTestContext();
    });

    it(`should set showMilestoneFilterCapture to true and display capture when
        context is not ${ProjectFiltersCaptureContextEnum.TaskList}`, () => {
        expect(getElement(dataAutomationMilestoneFilterCaptureSelector)).toBeUndefined();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.Calendar;
        fixture.detectChanges();
        expect(component.showMilestoneFilterCapture).toBeTruthy();
        expect(getElement(dataAutomationMilestoneFilterCaptureSelector)).toBeDefined();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.QuickFilters;
        fixture.detectChanges();
        expect(component.showMilestoneFilterCapture).toBeTruthy();
        expect(getElement(dataAutomationMilestoneFilterCaptureSelector)).toBeDefined();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.Reschedule;
        fixture.detectChanges();
        expect(component.showMilestoneFilterCapture).toBeTruthy();
        expect(getElement(dataAutomationMilestoneFilterCaptureSelector)).toBeDefined();
    });

    it(`should set showMilestoneFilterCapture to false and not display capture when
        context is ${ProjectFiltersCaptureContextEnum.TaskList}`, () => {
        expect(getElement(dataAutomationMilestoneFilterCaptureSelector)).toBeUndefined();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.TaskList;
        fixture.detectChanges();
        expect(component.showMilestoneFilterCapture).toBeFalsy();
        expect(getElement(dataAutomationMilestoneFilterCaptureSelector)).toBeUndefined();
    });

    it(`should set showTopRowWorkAreaOption to true when context is not ${ProjectFiltersCaptureContextEnum.TaskList}`, () => {
        testHostComponent.context = ProjectFiltersCaptureContextEnum.Calendar;
        fixture.detectChanges();
        expect(component.showTopRowWorkAreaOption).toBeTruthy();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.QuickFilters;
        fixture.detectChanges();
        expect(component.showTopRowWorkAreaOption).toBeTruthy();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.Reschedule;
        fixture.detectChanges();
        expect(component.showTopRowWorkAreaOption).toBeTruthy();
    });

    it(`should set showTopRowWorkAreaOption to false when context is ${ProjectFiltersCaptureContextEnum.TaskList}`, () => {
        testHostComponent.context = ProjectFiltersCaptureContextEnum.TaskList;
        fixture.detectChanges();
        expect(component.showTopRowWorkAreaOption).toBeFalsy();
    });

    it('should set correct common filter form data default values derived from task filters', () => {
        const {start, end} = defaultRange;
        const workAreaIds = ['foo'];
        const newCriteria: ProjectTaskFiltersCriteria = {
            ...taskFilters.criteria,
            workAreaIds,
            from: start,
            to: end,
        };
        const newTaskFilters: ProjectTaskFilters = new ProjectTaskFilters(newCriteria);
        const expectedResult: CommonFilterFormData = {
            range: {start, end},
            workArea: {workAreaIds, header: false},
            wholeProjectDuration: false,
        };

        testHostComponent.taskFilters = newTaskFilters;
        fixture.detectChanges();

        expect(component.commonFiltersDefaultValues).toEqual(expectedResult);
    });

    it('should set correct common filter form data default values derived from milestone filters', () => {
        const {start, end} = defaultRange;
        const workAreaIds = ['foo'];
        const newCriteria: MilestoneFiltersCriteria = {
            ...milestoneFilters.criteria,
            workAreas: {
                ...milestoneFilters.criteria.workAreas,
                workAreaIds,
            },
            from: start,
            to: end,
        };
        const newMilestoneFilters: MilestoneFilters = new MilestoneFilters(newCriteria);
        const expectedResult: CommonFilterFormData = {
            range: {start, end},
            workArea: {workAreaIds, header: false},
            wholeProjectDuration: false,
        };

        testHostComponent.milestoneFilters = newMilestoneFilters;
        fixture.detectChanges();

        expect(component.commonFiltersDefaultValues).toEqual(expectedResult);
    });

    it('should set correct common filter form data default values when milestone filters have header criteria set to true', () => {
        const workAreaIds = milestoneFilters.criteria.workAreas.workAreaIds;
        const newCriteria: MilestoneFiltersCriteria = {
            ...milestoneFilters.criteria,
            workAreas: {
                ...milestoneFilters.criteria.workAreas,
                header: true,
            },
        };
        const newMilestoneFilters: MilestoneFilters = new MilestoneFilters(newCriteria);
        const expectedResult: CommonFilterFormData = {
            range: {start: null, end: null},
            workArea: {workAreaIds, header: true},
            wholeProjectDuration: false,
        };

        testHostComponent.milestoneFilters = newMilestoneFilters;
        fixture.detectChanges();

        expect(component.commonFiltersDefaultValues).toEqual(expectedResult);
    });

    it('should set correct common filter form data default values when milestone filters have header criteria set to false', () => {
        const workAreaIds = [];
        const newCriteria: MilestoneFiltersCriteria = {
            ...milestoneFilters.criteria,
            workAreas: {
                ...milestoneFilters.criteria.workAreas,
                header: false,
            },
        };
        const newMilestoneFilters: MilestoneFilters = new MilestoneFilters(newCriteria);
        const expectedResult: CommonFilterFormData = {
            range: {start: null, end: null},
            workArea: {workAreaIds, header: false},
            wholeProjectDuration: false,
        };

        testHostComponent.milestoneFilters = newMilestoneFilters;
        fixture.detectChanges();

        expect(component.commonFiltersDefaultValues).toEqual(expectedResult);
    });

    it('should set common filter form data default values with wholeProjectDuration', () => {
        const wholeProjectDuration = true;
        const expectedResult: CommonFilterFormData = {
            wholeProjectDuration,
            range: {start: null, end: null},
            workArea: {workAreaIds: [], header: false},
        };

        testHostComponent.wholeProjectDuration = wholeProjectDuration;
        fixture.detectChanges();

        expect(component.commonFiltersDefaultValues).toEqual(expectedResult);
    });

    it('should set the correct milestone filter form data default values', () => {
        const projectCraftIds = ['FOO'];
        const types: MilestoneTypeEnum[] = [
            MilestoneTypeEnum.Project,
            MilestoneTypeEnum.Craft,
        ];
        const newCriteria: MilestoneFiltersCriteria = {
            ...milestoneFilters.criteria,
            types: {
                types,
                projectCraftIds,
            },
        };
        const newMilestoneFilters: MilestoneFilters = new MilestoneFilters(newCriteria);
        const expectedResult: MilestoneFilterFormData = {types, projectCraftIds};

        testHostComponent.milestoneFilters = newMilestoneFilters;
        fixture.detectChanges();

        expect(component.milestoneFiltersDefaultValues).toEqual(expectedResult);
    });

    it('should set the correct task filter form data default values', () => {
        const newCriteria: ProjectTaskFiltersCriteria = {
            ...taskFilters.criteria,
            status: [TaskStatusEnum.OPEN, TaskStatusEnum.CLOSED],
            topicCriticality: [TopicCriticalityEnum.CRITICAL],
        };
        const newTaskFilters: ProjectTaskFilters = new ProjectTaskFilters(newCriteria);
        const {assignees, projectCraftIds, hasTopics, allDaysInDateRange} = newCriteria;
        const expectedResult: TasksFilterFormData = {
            assignees,
            projectCraftIds,
            hasTopics,
            allDaysInDateRange,
            status: {
                [TaskStatusEnum.OPEN]: true,
                [TaskStatusEnum.CLOSED]: true,
                [TaskStatusEnum.STARTED]: false,
                [TaskStatusEnum.DRAFT]: false,
                [TaskStatusEnum.ACCEPTED]: false,
            },
            topicCriticality: {
                [TopicCriticalityEnum.CRITICAL]: true,
            },
        };

        testHostComponent.taskFilters = newTaskFilters;
        fixture.detectChanges();

        expect(component.taskFiltersDefaultValues).toEqual(expectedResult);
    });

    it('should retrieve the correct project filter form data when milestone capture exists', () => {
        const expectedResult: ProjectFilterFormData = {
            task: taskFilters,
            milestone: milestoneFilters,
            wholeProjectDuration: false,
        };

        expect(component.getFormValue()).toEqual(expectedResult);
    });

    it('should retrieve the correct project filter form data when milestone capture does not exist', () => {
        const expectedResult: ProjectFilterFormData = {
            task: taskFilters,
            wholeProjectDuration: false,
        };

        setupTaskFiltersTestContext();

        expect(component.getFormValue()).toEqual(expectedResult);
    });

    it('should emit form validity with true when handleFormValidityChange is called with true', () => {
        spyOn(component.formValidity, 'emit');

        component.handleFormValidityChange(true);

        expect(component.formValidity.emit).toHaveBeenCalledWith(true);
    });

    it('should emit form validity with false when handleFormValidityChange is called with false', () => {
        spyOn(component.formValidity, 'emit');

        component.handleFormValidityChange(false);

        expect(component.formValidity.emit).toHaveBeenCalledWith(false);
    });

    it('should set allDaysInDateRangeDisabled to false when handleRangeChange is called with valid date range fields', () => {
        const range: DateRange = {
            start: currentDay,
            end: currentDay,
        };

        component.handleRangeChange(range);

        expect(component.allDaysInDateRangeDisabled).toBeFalsy();
    });

    it('should set allDaysInDateRangeDisabled to true when handleRangeChange is called with empty date range fields', () => {
        const rangeEmpty: DateRange = {
            start: null,
            end: null,
        };
        const rangeWithStart: DateRange = {
            start: currentDay,
            end: null,
        };
        const rangeWithEnd: DateRange = {
            start: null,
            end: currentDay,
        };

        component.handleRangeChange(rangeEmpty);
        expect(component.allDaysInDateRangeDisabled).toBeTruthy();

        component.handleRangeChange(rangeWithStart);
        expect(component.allDaysInDateRangeDisabled).toBeTruthy();

        component.handleRangeChange(rangeWithEnd);
        expect(component.allDaysInDateRangeDisabled).toBeTruthy();
    });

    it('should emit a valueChanged event when the common filter capture emits a new valueChanged event', () => {
        spyOn(component.valueChanged, 'emit');

        getDebugElement(dataAutomationCommonFilterCaptureSelector).triggerEventHandler('valueChanged');

        expect(component.valueChanged.emit).toHaveBeenCalled();
    });

    it('should emit a valueChanged event when the milestone filter capture emits a new valueChanged event', () => {
        spyOn(component.valueChanged, 'emit');

        testHostComponent.context = ProjectFiltersCaptureContextEnum.Calendar;
        fixture.detectChanges();

        getDebugElement(dataAutomationMilestoneFilterCaptureSelector).triggerEventHandler('valueChanged');

        expect(component.valueChanged.emit).toHaveBeenCalled();
    });

    it('should emit a valueChanged event when the tasks filter capture emits a new valueChanged event', () => {
        spyOn(component.valueChanged, 'emit');

        getDebugElement(dataAutomationTaskFilterCaptureSelector).triggerEventHandler('valueChanged');

        expect(component.valueChanged.emit).toHaveBeenCalled();
    });
});
