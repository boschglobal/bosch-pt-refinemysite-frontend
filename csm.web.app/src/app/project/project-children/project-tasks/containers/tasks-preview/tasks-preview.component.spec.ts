/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {
    BehaviorSubject,
    NEVER,
    of
} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_NEWS_ITEMS} from '../../../../../../test/mocks/news';
import {MOCK_RELATION_RESOURCE_2} from '../../../../../../test/mocks/relations';
import {
    MOCK_TASK_2,
    MOCK_TASK_3,
} from '../../../../../../test/mocks/tasks';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {
    CRAFT_COLORS,
    CraftColor
} from '../../../../../shared/ui/constants/colors.constant';
import {CalendarUserSettings} from '../../../../project-common/api/calendar/resources/calendar-user-settings';
import {RelationResource} from '../../../../project-common/api/relations/resources/relation.resource';
import {TaskCalendarSortingModeEnum} from '../../../../project-common/enums/task-calendar-sorting-mode.enum';
import {TaskCalendarTaskViewModeEnum} from '../../../../project-common/enums/task-calendar-task-view-mode.enum';
import {TaskCardDescriptionTypeEnum} from '../../../../project-common/enums/task-card-description-type.enum';
import {Task} from '../../../../project-common/models/tasks/task';
import {TaskShiftAmountPipe} from '../../../../project-common/pipes/task-shift-amount/task-shift-amount.pipe';
import {CalendarQueries} from '../../../../project-common/store/calendar/calendar/calendar.queries';
import {NewsQueries} from '../../../../project-common/store/news/news.queries';
import {RelationQueries} from '../../../../project-common/store/relations/relation.queries';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';
import {
    TasksPreviewComponent,
    TasksPreviewModeEnum,
    TasksPreviewModel
} from './tasks-preview.component';

describe('Tasks Preview Component', () => {
    let component: TasksPreviewComponent;
    let fixture: ComponentFixture<TasksPreviewComponent>;
    let de: DebugElement;
    let changeDetectorRef: ChangeDetectorRef;

    const amount = 0;
    const dataAutomationTasksPreview = '[data-automation="tasks-preview"]';
    const dataAutomationTasksStackedPreview = '[data-automation="tasks-stacked-preview"]';
    const dataAutomationTasksCardPreview = '[data-automation="tasks-card-preview"]';
    const relations = [MOCK_RELATION_RESOURCE_2];
    const taskList = [MOCK_TASK_2, MOCK_TASK_3];
    const taskIds: string[] = taskList.map((task: Task) => task.id);
    const taskWithoutCompany: Task = {
        ...MOCK_TASK_3,
        company: null,
    };
    const taskWithoutAssignee: Task = {
        ...MOCK_TASK_3,
        assignee: null,
    };
    const projectTaskQueriesMock: ProjectTaskQueries = mock(ProjectTaskQueries);
    const relationQueriesMock: RelationQueries = mock(RelationQueries);
    const newsQueriesMock: NewsQueries = mock(NewsQueries);
    const calendarQueriesMock: CalendarQueries = mock(CalendarQueries);
    const taskPredecessorRelationsSubject = new BehaviorSubject<RelationResource[]>([]);
    const taskSuccessorRelationsSubject = new BehaviorSubject<RelationResource[]>([]);

    const isTaskSelected = () => true;
    const getElement = (selector: string): DebugElement => de.query(By.css(selector));
    const getCraftColor = (solidColor: string): CraftColor => CRAFT_COLORS.find(color => color.solid === solidColor);
    const calendarUserSettingsDisabled: CalendarUserSettings = {
        taskCardDescriptionType: TaskCardDescriptionTypeEnum.Company,
        showDayCardIndicators: false,
        showDependencyLines: false,
        sortingMode: TaskCalendarSortingModeEnum.Default,
        showUnreadNews: false,
        taskViewMode : TaskCalendarTaskViewModeEnum.Week,
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [
            TasksPreviewComponent,
            TaskShiftAmountPipe,
        ],
        providers: [
            {
                provide: ProjectTaskQueries,
                useValue: instance(projectTaskQueriesMock),
            },
            {
                provide: RelationQueries,
                useValue: instance(relationQueriesMock),
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            {
                provide: NewsQueries,
                useValue: instance(newsQueriesMock),
            },
            {
                provide: CalendarQueries,
                useValue: instance(calendarQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TasksPreviewComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);

        when(projectTaskQueriesMock.observeTaskById(MOCK_TASK_2.id)).thenReturn(of(MOCK_TASK_2));
        when(projectTaskQueriesMock.observeTaskById(MOCK_TASK_3.id)).thenReturn(of(MOCK_TASK_3));
        when(relationQueriesMock.observeFinishToStartSuccessorRelationsByTaskId(MOCK_TASK_3.id)).thenReturn(taskSuccessorRelationsSubject);
        when(relationQueriesMock.observeFinishToStartPredecessorRelationsByTaskId(MOCK_TASK_3.id))
            .thenReturn(taskPredecessorRelationsSubject);
        when(newsQueriesMock.observeItemsByIdentifierPair(anything())).thenReturn(of([]));
        when(calendarQueriesMock.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingsDisabled));

        component.isTaskSelected = isTaskSelected;
        component.shiftMode = 'move';
        component.shiftAmount = amount;
        component.taskIds = taskIds;

        changeDetectorRef.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should render component if tasks exist in store', () => {
        expect(component.showPreview).toBeTruthy();
        expect(getElement(dataAutomationTasksPreview)).not.toBeNull();
    });

    it('should not display preview if tasks do not exist in store', () => {
        when(projectTaskQueriesMock.observeTaskById(MOCK_TASK_2.id)).thenReturn(NEVER);
        when(projectTaskQueriesMock.observeTaskById(MOCK_TASK_3.id)).thenReturn(NEVER);

        component.showPreview = false;

        changeDetectorRef.detectChanges();

        component.taskIds = [...taskIds];

        changeDetectorRef.detectChanges();

        expect(component.showPreview).toBeFalsy();
        expect(getElement(dataAutomationTasksPreview)).toBeNull();
    });

    it('should display the tasks stacked preview when multiple taskIds are provided', () => {
        component.taskIds = taskIds;

        changeDetectorRef.detectChanges();

        expect(component.tasksPreviewMode).toBe(TasksPreviewModeEnum.Stacked);
        expect(getElement(dataAutomationTasksStackedPreview)).not.toBeNull();
        expect(getElement(dataAutomationTasksCardPreview)).toBeNull();
    });

    it('should display the tasks card preview when a single taskId is provided', () => {
        component.taskIds = [MOCK_TASK_3.id];

        changeDetectorRef.detectChanges();

        expect(component.tasksPreviewMode).toBe(TasksPreviewModeEnum.Simple);
        expect(getElement(dataAutomationTasksCardPreview)).not.toBeNull();
        expect(getElement(dataAutomationTasksStackedPreview)).toBeNull();
    });

    it('should set tasksCount to the length of the taskIds array', () => {
        expect(component.tasksCount).toEqual(taskIds.length);
    });

    it('should set last task provided as the mainTask if more than one taskId is provided', () => {
        const lastTask = taskList[taskList.length - 1];
        const expectedMainTask: TasksPreviewModel = {
            constraints: lastTask.constraints,
            color: getCraftColor(lastTask.projectCraft.color),
            description: lastTask.company.displayName,
            selected: true,
            focused: false,
            dimmed: false,
            statistics: lastTask.statistics,
            status: lastTask.status,
            title: lastTask.name,
        };

        expect(component.mainTask).toEqual(expectedMainTask);
    });

    it('should set last but one task provided as the backgroundTask if more than one taskId is provided', () => {
        const lastButOneTask = taskList[taskList.length - 2];
        const expectedMainTask: TasksPreviewModel = {
            constraints: lastButOneTask.constraints,
            color: getCraftColor(lastButOneTask.projectCraft.color),
            description: lastButOneTask.company.displayName,
            selected: true,
            focused: false,
            dimmed: false,
            statistics: lastButOneTask.statistics,
            status: lastButOneTask.status,
            title: lastButOneTask.name,
        };

        expect(component.backgroundTask).toEqual(expectedMainTask);
    });

    it('should create the TasksPreviewModel based on a task with company name when Task Card Description Type is ' +
        `${TaskCardDescriptionTypeEnum.Company} and Task has a company`, () => {
        const expectedResult: TasksPreviewModel = {
            constraints: MOCK_TASK_3.constraints,
            color: getCraftColor(MOCK_TASK_3.projectCraft.color),
            description: MOCK_TASK_3.company.displayName,
            selected: true,
            focused: false,
            dimmed: false,
            statistics: MOCK_TASK_3.statistics,
            status: MOCK_TASK_3.status,
            title: MOCK_TASK_3.name,
        };
        const calendarUserSettingWithCompany: CalendarUserSettings = {
            ...calendarUserSettingsDisabled,
            taskCardDescriptionType: TaskCardDescriptionTypeEnum.Company,
        };

        when(calendarQueriesMock.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingWithCompany));

        component.taskIds = [MOCK_TASK_3.id];

        changeDetectorRef.detectChanges();

        expect(component.mainTask).toEqual(expectedResult);
    });

    it('should create the TasksPreviewModel based on a task without company name when Task Card Description Type is ' +
        `${TaskCardDescriptionTypeEnum.Company} and Task does not have a company`, () => {
        const expectedResult: TasksPreviewModel = {
            constraints: taskWithoutCompany.constraints,
            color: getCraftColor(taskWithoutCompany.projectCraft.color),
            description: '---',
            selected: true,
            focused: false,
            dimmed: false,
            statistics: taskWithoutCompany.statistics,
            status: taskWithoutCompany.status,
            title: taskWithoutCompany.name,
        };
        const calendarUserSettingWithCompany: CalendarUserSettings = {
            ...calendarUserSettingsDisabled,
            taskCardDescriptionType: TaskCardDescriptionTypeEnum.Company,
        };

        when(calendarQueriesMock.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingWithCompany));
        when(projectTaskQueriesMock.observeTaskById(taskWithoutCompany.id)).thenReturn(of(taskWithoutCompany));

        component.taskIds = [taskWithoutCompany.id];

        changeDetectorRef.detectChanges();

        expect(component.mainTask).toEqual(expectedResult);
    });

    it('should create the TasksPreviewModel based on a task with assignee name when Task Card Description Type is ' +
        `${TaskCardDescriptionTypeEnum.Assignee} and Task has a assignee`, () => {
        const expectedResult: TasksPreviewModel = {
            constraints: MOCK_TASK_3.constraints,
            color: getCraftColor(MOCK_TASK_3.projectCraft.color),
            description: MOCK_TASK_3.assignee.displayName,
            selected: true,
            focused: false,
            dimmed: false,
            statistics: MOCK_TASK_3.statistics,
            status: MOCK_TASK_3.status,
            title: MOCK_TASK_3.name,
        };
        const calendarUserSettingWithAssignee: CalendarUserSettings = {
            ...calendarUserSettingsDisabled,
            taskCardDescriptionType: TaskCardDescriptionTypeEnum.Assignee,
        };

        when(calendarQueriesMock.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingWithAssignee));

        component.taskIds = [MOCK_TASK_3.id];

        changeDetectorRef.detectChanges();

        expect(component.mainTask).toEqual(expectedResult);
    });

    it('should create the TasksPreviewModel based on a task without assignee name when Task Card Description Type is ' +
        `${TaskCardDescriptionTypeEnum.Assignee} and Task does not have a assignee`, () => {
        const expectedResult: TasksPreviewModel = {
            constraints: taskWithoutAssignee.constraints,
            color: getCraftColor(taskWithoutAssignee.projectCraft.color),
            description: '---',
            selected: true,
            focused: false,
            dimmed: false,
            statistics: taskWithoutAssignee.statistics,
            status: taskWithoutAssignee.status,
            title: taskWithoutAssignee.name,
        };
        const calendarUserSettingWithAssignee: CalendarUserSettings = {
            ...calendarUserSettingsDisabled,
            taskCardDescriptionType: TaskCardDescriptionTypeEnum.Assignee,
        };

        when(calendarQueriesMock.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingWithAssignee));
        when(projectTaskQueriesMock.observeTaskById(taskWithoutAssignee.id)).thenReturn(of(taskWithoutAssignee));

        component.taskIds = [taskWithoutAssignee.id];

        changeDetectorRef.detectChanges();

        expect(component.mainTask).toEqual(expectedResult);
    });

    it('should create the TasksPreviewModel based on a task with craft when Task Card Description Type is ' +
        `${TaskCardDescriptionTypeEnum.Craft}`, () => {
        const expectedResult: TasksPreviewModel = {
            constraints: MOCK_TASK_3.constraints,
            color: getCraftColor(MOCK_TASK_3.projectCraft.color),
            description: MOCK_TASK_3.projectCraft.name,
            selected: true,
            focused: false,
            dimmed: false,
            statistics: MOCK_TASK_3.statistics,
            status: MOCK_TASK_3.status,
            title: MOCK_TASK_3.name,
        };
        const calendarUserSettingWithCrafts: CalendarUserSettings = {
            ...calendarUserSettingsDisabled,
            taskCardDescriptionType: TaskCardDescriptionTypeEnum.Craft,
        };

        when(calendarQueriesMock.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingWithCrafts));

        component.taskIds = [MOCK_TASK_3.id];

        changeDetectorRef.detectChanges();

        expect(component.mainTask).toEqual(expectedResult);
    });

    it('should set backgroundTask to null when when a single taskId is provided', () => {
        component.taskIds = [MOCK_TASK_3.id];

        changeDetectorRef.detectChanges();

        expect(component.backgroundTask).toBeNull();
    });

    it('should mark task as selected when the provided predicate return true', () => {
        component.isTaskSelected = () => true;
        component.taskIds = [MOCK_TASK_3.id];

        changeDetectorRef.detectChanges();

        expect(component.mainTask.selected).toBeTruthy();
    });
    it('should mark task as not selected when the provided predicate return false', () => {
        component.isTaskSelected = () => false;
        component.taskIds = [MOCK_TASK_3.id];

        changeDetectorRef.detectChanges();

        expect(component.mainTask.selected).toBeFalsy();
    });

    it('should mark task as focused when the provided predicate return true', () => {
        component.isTaskFocused = () => true;
        component.taskIds = [MOCK_TASK_3.id];

        changeDetectorRef.detectChanges();

        expect(component.mainTask.focused).toBeTruthy();
    });
    it('should mark task as not focused when the provided predicate return false', () => {
        component.isTaskFocused = () => false;
        component.taskIds = [MOCK_TASK_3.id];

        changeDetectorRef.detectChanges();

        expect(component.mainTask.focused).toBeFalsy();
    });

    it('should mark task as dimmed out when the provided predicate return true', () => {
        component.isTaskDimmedOut = () => true;
        component.taskIds = [MOCK_TASK_3.id];

        changeDetectorRef.detectChanges();

        expect(component.mainTask.dimmed).toBeTruthy();
    });
    it('should mark task as not dimmed out when the provided predicate return false', () => {
        component.isTaskDimmedOut = () => false;
        component.taskIds = [MOCK_TASK_3.id];

        changeDetectorRef.detectChanges();

        expect(component.mainTask.dimmed).toBeFalsy();
    });

    it('should update predecessorRelations when observeFinishToStartPredecessorRelationsByTaskId emits', () => {
        component.taskIds = [MOCK_TASK_3.id];
        changeDetectorRef.detectChanges();

        taskPredecessorRelationsSubject.next(relations);

        expect(component.predecessorRelations).toBe(relations);
    });

    it('should update successorRelations when observeFinishToStartSuccessorRelationsByTaskId emits', () => {
        component.taskIds = [MOCK_TASK_3.id];
        changeDetectorRef.detectChanges();

        taskSuccessorRelationsSubject.next(relations);

        expect(component.successorRelations).toBe(relations);
    });

    it('should set news on taskId change', () => {
        when(newsQueriesMock.observeItemsByIdentifierPair(anything())).thenReturn(of(MOCK_NEWS_ITEMS));
        component.taskIds = [MOCK_TASK_3.id];
        changeDetectorRef.detectChanges();

        expect(component.news).toBe(MOCK_NEWS_ITEMS);
    });

    it('should set showUnreadNews with true when Calendar user settings have showUnreadNews as true', () => {
        when(calendarQueriesMock.observeCalendarUserSettings()).thenReturn(of(
            {
                ...calendarUserSettingsDisabled, showUnreadNews: true,
            }));
        component.taskIds = [MOCK_TASK_3.id];
        changeDetectorRef.detectChanges();

        expect(component.showUnreadNews).toEqual(true);
    });

    it('should set showUnreadNews with false when Calendar user settings have showUnreadNews as false', () => {
        when(calendarQueriesMock.observeCalendarUserSettings()).thenReturn(of(
            {
                ...calendarUserSettingsDisabled, showUnreadNews: false,
            }));
        component.taskIds = [MOCK_TASK_3.id];
        changeDetectorRef.detectChanges();

        expect(component.showUnreadNews).toEqual(false);
    });

    it('should render the ss-tasks-card-preview component with hasNews as true when there are news and showUnreadNews is true', () => {
        when(newsQueriesMock.observeItemsByIdentifierPair(anything())).thenReturn(of(MOCK_NEWS_ITEMS));
        when(calendarQueriesMock.observeCalendarUserSettings()).thenReturn(of(
            {
                ...calendarUserSettingsDisabled, showUnreadNews: true,
            }));
        component.taskIds = [MOCK_TASK_3.id];
        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationTasksCardPreview).properties.hasNews).toEqual(true);
    });

    it('should render the ss-tasks-card-preview component with hasNews as false when there are news but showUnreadNews is false', () => {
        when(newsQueriesMock.observeItemsByIdentifierPair(anything())).thenReturn(of(MOCK_NEWS_ITEMS));
        when(calendarQueriesMock.observeCalendarUserSettings()).thenReturn(of(
            {
                ...calendarUserSettingsDisabled, showUnreadNews: false,
            }));
        component.taskIds = [MOCK_TASK_3.id];
        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationTasksCardPreview).properties.hasNews).toEqual(false);
    });

    it('should render the ss-tasks-card-preview component with hasNews as false when there no are news', () => {
        component.taskIds = [MOCK_TASK_3.id];
        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationTasksCardPreview).properties.hasNews).toEqual(false);
    });
});
