/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {DragDropModule} from '@angular/cdk/drag-drop';
import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    flatten,
    uniqBy,
} from 'lodash';
import * as moment from 'moment';
import {Moment} from 'moment';
import {
    BehaviorSubject,
    of,
    Subject,
} from 'rxjs';
import {
    anyString,
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {setEventKey} from '../../../../../../test/helpers';
import {MOCK_DAY_CARD_A} from '../../../../../../test/mocks/day-cards';
import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_HEADER,
    MOCK_MILESTONE_WITHOUT_PERMISSIONS,
    MOCK_MILESTONE_WORKAREA,
} from '../../../../../../test/mocks/milestones';
import {
    MOCK_PROJECT_1,
    MOCK_PROJECT_2
} from '../../../../../../test/mocks/projects';
import {
    MOCK_RELATION_RESOURCE_1,
    MOCK_RELATION_RESOURCE_2,
    MOCK_RELATION_RESOURCE_3,
} from '../../../../../../test/mocks/relations';
import {MockStore} from '../../../../../../test/mocks/store';
import {MOCK_SCHEDULE_ITEM_A} from '../../../../../../test/mocks/task-schedules';
import {
    MOCK_TASK_2,
    MOCK_TASK_3,
    MOCK_TASK_4,
    MOCK_TASK_RESOURCE,
    MOCK_TASK_RESOURCE_4,
} from '../../../../../../test/mocks/tasks';
import {
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B
} from '../../../../../../test/mocks/workareas';
import {MOCK_WORK_DAYS} from '../../../../../../test/mocks/workdays';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {TimeScope} from '../../../../../shared/misc/api/datatypes/time-scope.datatype';
import {KeyEnum} from '../../../../../shared/misc/enums/key.enum';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {WeekDaysEnum} from '../../../../../shared/misc/enums/weekDays.enum';
import {Point} from '../../../../../shared/misc/generic-types/point.type';
import {BreakpointHelper} from '../../../../../shared/misc/helpers/breakpoint.helper';
import {CalendarScopeHelper} from '../../../../../shared/misc/helpers/calendar-scope.helper';
import {FeatureToggleHelper} from '../../../../../shared/misc/helpers/feature-toggle.helper';
import {
    KeyboardHelper,
    KeyboardShortcutEnum,
} from '../../../../../shared/misc/helpers/keyboard.helper';
import {ResizeHelper} from '../../../../../shared/misc/helpers/resize.helper';
import {MonitoringHelper} from '../../../../../shared/monitoring/helpers/monitoring.helper';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/rest/constants/date-format.constant';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {
    CalendarDependency,
    CalendarDrawingStrategy,
    CalendarMilestones,
    CalendarNavigateToElement,
    CalendarRecordGridUnit,
    CalendarRow,
    CreateRecordPayload,
    MoveRecordPayload,
    NUMBER_OF_DAYS_PER_WEEK
} from '../../../../../shared/ui/calendar/calendar/calendar.component';
import {MoveMilestonePayload} from '../../../../../shared/ui/calendar/milestone-slots/milestone-slots.component';
import {COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {DateParserStrategy} from '../../../../../shared/ui/dates/date-parser.strategy';
import {DrawerService} from '../../../../../shared/ui/drawer/api/drawer.service';
import {FlyoutService} from '../../../../../shared/ui/flyout/service/flyout.service';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {SelectListComponent} from '../../../../../shared/ui/select-list/select-list.component';
import {CalendarUserSettings} from '../../../../project-common/api/calendar/resources/calendar-user-settings';
import {SaveMilestoneResource} from '../../../../project-common/api/milestones/resources/save-milestone.resource';
import {RelationResource} from '../../../../project-common/api/relations/resources/relation.resource';
import {SaveCopyTaskResource} from '../../../../project-common/api/tasks/resources/save-copy-task.resource';
import {WorkDaysHoliday} from '../../../../project-common/api/work-days/resources/work-days.resource';
import {WorkareaResource} from '../../../../project-common/api/workareas/resources/workarea.resource';
import {WORKAREA_UUID_EMPTY} from '../../../../project-common/constants/workarea.constant';
import {CommonFilterFormData} from '../../../../project-common/containers/common-filter-capture/common-filter-capture.component';
import {MilestoneDetailDrawerComponent} from '../../../../project-common/containers/milestone-detail-drawer/milestone-detail-drawer.component';
import {ProjectFiltersCaptureContextEnum} from '../../../../project-common/containers/project-filter-capture/project-filter-capture.component';
import {ProjectFilterDrawerComponent} from '../../../../project-common/containers/project-filter-drawer/project-filter-drawer.component';
import {ProjectRescheduleDrawerComponent} from '../../../../project-common/containers/project-reschedule-drawer/project-reschedule-drawer.component';
import {QuickFilterDrawerComponent} from '../../../../project-common/containers/quick-filter-drawer/quick-filter-drawer.component';
import {TasksFilterFormData} from '../../../../project-common/containers/tasks-filter-capture/tasks-filter-capture.component';
import {CalendarSelectionActionEnum} from '../../../../project-common/enums/calendar-selection-action.enum';
import {CalendarSelectionContextEnum} from '../../../../project-common/enums/calendar-selection-context.enum';
import {MilestoneTypeEnum} from '../../../../project-common/enums/milestone-type.enum';
import {RelationTypeEnum} from '../../../../project-common/enums/relation-type.enum';
import {TaskCalendarSortingModeEnum} from '../../../../project-common/enums/task-calendar-sorting-mode.enum';
import {TaskCalendarTaskViewModeEnum} from '../../../../project-common/enums/task-calendar-task-view-mode.enum';
import {TaskCardDescriptionTypeEnum} from '../../../../project-common/enums/task-card-description-type.enum';
import {TaskStatusEnum} from '../../../../project-common/enums/task-status.enum';
import {TasksCalendarModeEnum} from '../../../../project-common/enums/tasks-calendar-mode.enum';
import {TopicCriticalityEnum} from '../../../../project-common/enums/topic-criticality.enum';
import {CalendarSelectionHelper} from '../../../../project-common/helpers/calendar-selection.helper';
import {DayCardDragHelper} from '../../../../project-common/helpers/day-card-drag.helper';
import {MilestoneAnchor} from '../../../../project-common/helpers/milestone-anchor.helper';
import {ProjectDateParserStrategy} from '../../../../project-common/helpers/project-date-parser.strategy';
import {TaskCardWeekAnchor} from '../../../../project-common/helpers/task-card-week-anchor.helper';
import {TaskCardWeekPlaceholderAnchor} from '../../../../project-common/helpers/task-card-week-placeholder-anchor.helper';
import {TaskFiltersHelper} from '../../../../project-common/helpers/task-filters.helper';
import {TasksCalendarUrlQueryParamsHelper} from '../../../../project-common/helpers/tasks-calendar-url-query-params.helper';
import {Milestone} from '../../../../project-common/models/milestones/milestone';
import {Task} from '../../../../project-common/models/tasks/task';
import {TaskShiftAmountUnit} from '../../../../project-common/pipes/task-shift-amount/task-shift-amount.pipe';
import {CalendarActions} from '../../../../project-common/store/calendar/calendar/calendar.actions';
import {CalendarQueries} from '../../../../project-common/store/calendar/calendar/calendar.queries';
import {CalendarScopeActions} from '../../../../project-common/store/calendar/calendar-scope/calendar-scope.actions';
import {CalendarScopeQueries} from '../../../../project-common/store/calendar/calendar-scope/calendar-scope.queries';
import {CalendarSelectionActions} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.actions';
import {CALENDAR_SELECTION_SLICE_INITIAL_STATE} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.initial-state';
import {CalendarSelectionQueries} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.queries';
import {CalendarSelectionSlice} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.slice';
import {CalendarScopeParameters} from '../../../../project-common/store/calendar/slice/calendar.scope-parameters';
import {DayCardQueries} from '../../../../project-common/store/day-cards/day-card.queries';
import {MilestoneActions} from '../../../../project-common/store/milestones/milestone.actions';
import {MilestoneQueries} from '../../../../project-common/store/milestones/milestone.queries';
import {MilestoneFilters} from '../../../../project-common/store/milestones/slice/milestone-filters';
import {MilestoneFiltersCriteria} from '../../../../project-common/store/milestones/slice/milestone-filters-criteria';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';
import {RelationQueries} from '../../../../project-common/store/relations/relation.queries';
import {ProjectTaskFilters} from '../../../../project-common/store/tasks/slice/project-task-filters';
import {
    MoveTaskPayload,
    ProjectTaskActions,
} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';
import {WorkDaysQueries} from '../../../../project-common/store/work-days/work-days.queries';
import {WorkareaActions} from '../../../../project-common/store/workareas/workarea.actions';
import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';
import {
    CalendarWorkareaRowHeaderComponent,
    CalendarWorkareaRowHeaderModel
} from '../../presentationals/calendar-workarea-row-header/calendar-workarea-row-header.component';
import {TasksDetailDrawerComponent} from '../tasks-detail-drawer/tasks-detail-drawer.component';
import {
    DRAWING_MODE_MAP,
    TASK_ANCHOR_POINT_CONTEXT_SELECTOR,
    TASK_VIEW_MODE_MAP,
    TASK_VIEW_MODE_SHIFT_UNIT_MAP,
    TASKS_CALENDAR_WAIT_FOR_CALENDAR_NAVIGATE_FINISH_DELAY,
    TASKS_CALENDAR_WAIT_FOR_CALENDAR_RENDERING_BEFORE_NAVIGATE_DELAY,
    TasksCalendarComponent,
} from './tasks-calendar.component';

describe('Tasks Calendar Component', () => {
    let fixture: ComponentFixture<TasksCalendarComponent>;
    let comp: TasksCalendarComponent;
    let de: DebugElement;
    let modalService: ModalService;
    let store: any;
    let projectIdObservable: Subject<string>;
    let drawerService: any;
    let resizeHelper: any;
    let flyoutService: FlyoutService;
    let milestoneAnchor: jasmine.SpyObj<MilestoneAnchor>;
    let taskCardWeekAnchor: jasmine.SpyObj<TaskCardWeekAnchor>;
    let taskCardWeekPlaceholderAnchor: jasmine.SpyObj<TaskCardWeekPlaceholderAnchor>;

    const milestoneCreationSlotsSelector = 'ss-milestone-creation-slots';
    const multipleSelectionToolbarSelector = '[data-automation="tasks-calendar-multiple-selection-toolbar"]';
    const flyoutSelector = 'flyout';
    const mouseUpEvent: Event = new Event('mouseup');
    const touchEndEvent: Event = new Event('touchend');
    const keyUpEvent: KeyboardEvent = new KeyboardEvent('keyup');

    const keyboardHelperMock: KeyboardHelper = mock(KeyboardHelper);
    const breakpointHelperMock: BreakpointHelper = mock(BreakpointHelper);
    const calendarScopeHelperMock: CalendarScopeHelper = mock(CalendarScopeHelper);
    const dateParserStrategyMock: ProjectDateParserStrategy = mock(ProjectDateParserStrategy);
    const projectTaskQueries: ProjectTaskQueries = mock(ProjectTaskQueries);
    const calendarQueries: CalendarQueries = mock(CalendarQueries);
    const calendarSelectionQueries: CalendarSelectionQueries = mock(CalendarSelectionQueries);
    const workareaQueries: WorkareaQueries = mock(WorkareaQueries);
    const projectQueries: ProjectSliceService = mock(ProjectSliceService);
    const dayCardDragHelper: DayCardDragHelper = mock(DayCardDragHelper);
    const dayCardQueries: DayCardQueries = mock(DayCardQueries);
    const milestoneQueries: MilestoneQueries = mock(MilestoneQueries);
    const relationQueries: RelationQueries = mock(RelationQueries);
    const calendarScopeQueries: CalendarScopeQueries = mock(CalendarScopeQueries);
    const tasksCalendarUrlQueryParamsHelperMock: TasksCalendarUrlQueryParamsHelper = mock(TasksCalendarUrlQueryParamsHelper);
    const taskFiltersHelperMock: TaskFiltersHelper = mock(TaskFiltersHelper);
    const workDaysQueriesMock: WorkDaysQueries = mock(WorkDaysQueries);
    const featureToggleHelperMock: FeatureToggleHelper = mock(FeatureToggleHelper);
    const monitoringHelperMock: MonitoringHelper = mock(MonitoringHelper);

    const calendarSelectionHelperSpy: jasmine.SpyObj<CalendarSelectionHelper> = jasmine
        .createSpyObj('CalendarSelectionHelper', ['canSelectItemType', 'toggleSelectionItem']);

    const getCalendarRecordsIds = () => flatten(comp.rows.map(row => row.records)).map(record => record.id);
    const getCalendarRecords = () => flatten(comp.rows.map(row => row.records));
    const getElement = (selector): HTMLElement => de.query((By.css(selector)))?.nativeElement;

    const sendKeyUp = (key: KeyEnum) => {
        setEventKey(keyUpEvent, key);
        window.dispatchEvent(keyUpEvent);
    };

    const startDate: Moment = moment('2018-12-10');

    const taskWithUpdatePermission = MOCK_TASK_2;

    const taskWithoutUpdatePermission = Object.assign({}, MOCK_TASK_3, {
        permissions: {
            canUpdate: false,
            canAssign: false,
            canSend: false,
            canDelete: false,
            canStart: false,
            canClose: false,
        },
    });

    const calendarTasks: Task[] = [
        taskWithUpdatePermission,
        taskWithoutUpdatePermission,
        MOCK_TASK_4,
    ];

    const calendarScopeParameters: CalendarScopeParameters = {
        start: startDate,
        mode: TasksCalendarModeEnum.SixWeeks,
    };

    const calendarUserSettingsDisabled: CalendarUserSettings = {
        taskCardDescriptionType: TaskCardDescriptionTypeEnum.Company,
        showDayCardIndicators: false,
        showDependencyLines: false,
        sortingMode: TaskCalendarSortingModeEnum.Default,
        showUnreadNews: false,
        taskViewMode : TaskCalendarTaskViewModeEnum.Week,
    };

    const calendarUserSettingsEnabled: CalendarUserSettings = {
        taskCardDescriptionType: TaskCardDescriptionTypeEnum.Company,
        showDayCardIndicators: true,
        showDependencyLines: true,
        sortingMode: TaskCalendarSortingModeEnum.Default,
        showUnreadNews: true,
        taskViewMode : TaskCalendarTaskViewModeEnum.Week,
    };

    const calendarWorkareas: WorkareaResource[] = [
        MOCK_WORKAREA_A,
        MOCK_WORKAREA_B,
    ];

    const sixWeeksScope: TimeScope = {
        start: moment('2018-11-26'),
        end: moment('2019-01-13'),
    };

    const roadmapScope: TimeScope = {
        start: moment('2018-11-26'),
        end: moment('2019-03-31'),
    };

    const oneWeekScope: TimeScope = {
        start: moment('2018-12-10'),
        end: moment('2018-12-16'),
    };

    const milestones = [
        MOCK_MILESTONE_HEADER,
        MOCK_MILESTONE_WORKAREA,
        MOCK_MILESTONE_CRAFT,
        MOCK_MILESTONE_WITHOUT_PERMISSIONS,
    ];

    const defaultTasksFilterFormData: TasksFilterFormData = {
        assignees: {
            participantIds: [],
            companyIds: [],
        },
        projectCraftIds: [],
        hasTopics: null,
        topicCriticality: {
            [TopicCriticalityEnum.CRITICAL]: false,
        },
        status: {
            [TaskStatusEnum.CLOSED]: false,
            [TaskStatusEnum.DRAFT]: false,
            [TaskStatusEnum.OPEN]: false,
            [TaskStatusEnum.STARTED]: false,
        },
        allDaysInDateRange: false,
    };
    const defaultCommonFilterFormData: CommonFilterFormData = {
        range: {
            start: startDate,
            end: startDate,
        },
        workArea: {
            workAreaIds: [],
            header: false,
        },
    };

    const relations: RelationResource[] = [
        MOCK_RELATION_RESOURCE_1,
        MOCK_RELATION_RESOURCE_2,
    ];

    const criticalRelations: RelationResource[] = relations
        .filter(relation => relation.critical);

    const finishToStartRelations: RelationResource[] = relations
        .filter(relation => relation.type === RelationTypeEnum.FinishToStart);

    const taskCalendarFilters = ProjectTaskFilters.fromFormData(defaultTasksFilterFormData, defaultCommonFilterFormData);
    const calendarSelectionTaskItemsSubject$: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([]);
    const calendarTasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([]);
    const calendarSelectionActionSubject$: BehaviorSubject<CalendarSelectionActionEnum> = new BehaviorSubject<CalendarSelectionActionEnum>
    (null);
    const calendarSelectionItemsIdsByTaskSubject$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    const calendarSelectionItemsIdsByMilestoneSubject$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    const copyKeyPressedState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    const taskFilters$: BehaviorSubject<ProjectTaskFilters> = new BehaviorSubject(taskCalendarFilters);
    const finishToStartRelationsSubject = new Subject<RelationResource[]>();
    const criticalRelationsSubject = new Subject<RelationResource[]>();
    const milestoneFiltersSubject = new Subject<MilestoneFilters>();
    const milestoneSubtasksSubject = new Subject<RelationResource[]>();
    const milestoneSuccessorRelationsSubject = new Subject<RelationResource[]>();
    const milestonePredecessorRelationsSubject = new Subject<RelationResource[]>();
    const taskSuccessorRelationsSubject = new Subject<RelationResource[]>();
    const taskPredecessorRelationsSubject = new Subject<RelationResource[]>();
    const calendarSelectionSliceSubject = new BehaviorSubject<CalendarSelectionSlice>(CALENDAR_SELECTION_SLICE_INITIAL_STATE);
    const expandedWeeksSubject = new Subject<moment.Moment[]>();
    const navigateToElementSubject = new Subject<ObjectIdentifierPair>();
    const focusSubject = new Subject<ObjectIdentifierPair>();
    const calendarScopeParametersSubject = new BehaviorSubject<CalendarScopeParameters>(calendarScopeParameters);

    const mapTasksToRecords = (tasks: Task[]) => tasks.map(({id, projectCraft: {id: groupId}, schedule: {start, end}}) => ({
        id,
        groupId,
        start: moment(start),
        end: moment(end),
        position: null,
    }));

    const shiftTask = (task: Task, start: moment.Moment, end: moment.Moment, keepWorkarea = true, versionBump = 0): Task => ({
        ...task,
        workArea: keepWorkarea ? task.workArea : null,
        version: task.version + versionBump,
        schedule: {
            ...task.schedule,
            start: start.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            end: end.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        },
    });

    const setFocusedTask = (taskId: string) => focusSubject.next(new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId));
    const setFocusedMilestone = (milestoneId: string) => focusSubject.next(new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId));

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule,
            DragDropModule,
            ReactiveFormsModule,
            RouterTestingModule,
        ],
        declarations: [
            TasksCalendarComponent,
            CalendarWorkareaRowHeaderComponent,
            SelectListComponent,
        ],
        providers: [
            {
                provide: DateParserStrategy,
                useValue: instance(dateParserStrategyMock),
            },
            {
                provide: BreakpointHelper,
                useFactory: () => instance(breakpointHelperMock),
            },
            {
                provide: CalendarScopeHelper,
                useValue: instance(calendarScopeHelperMock),
            },
            {
                provide: ProjectTaskQueries,
                useFactory: () => instance(projectTaskQueries),
            },
            {
                provide: RelationQueries,
                useFactory: () => instance(relationQueries),
            },
            {
                provide: CalendarQueries,
                useFactory: () => instance(calendarQueries),
            },
            {
                provide: CalendarSelectionQueries,
                useFactory: () => instance(calendarSelectionQueries),
            },
            {
                provide: WorkareaQueries,
                useFactory: () => instance(workareaQueries),
            },
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectQueries),
            },
            {
                provide: DayCardDragHelper,
                useFactory: () => instance(dayCardDragHelper),
            },
            {
                provide: DayCardQueries,
                useFactory: () => instance(dayCardQueries),
            },
            {
                provide: MilestoneQueries,
                useFactory: () => instance(milestoneQueries),
            },
            {
                provide: KeyboardHelper,
                useValue: instance(keyboardHelperMock),
            },
            {
                provide: FeatureToggleHelper,
                useValue: instance(featureToggleHelperMock),
            },
            {
                provide: WorkDaysQueries,
                useFactory: () => instance(workDaysQueriesMock),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
            {
                provide: MilestoneAnchor,
                useValue: jasmine.createSpyObj('MilestoneAnchor', ['source', 'target', 'getYBaseByCalendarLineStrategy']),
            },
            {
                provide: MonitoringHelper,
                useValue: instance(monitoringHelperMock),
            },
            {
                provide: CalendarScopeQueries,
                useValue: instance(calendarScopeQueries),
            },
            {
                provide: TaskCardWeekAnchor,
                useValue: jasmine.createSpyObj('TaskCardWeekAnchor', ['source', 'target', 'getYBaseByCalendarLineStrategy']),
            },
            {
                provide: TaskCardWeekPlaceholderAnchor,
                useValue: jasmine.createSpyObj('TaskCardWeekPlaceholderAnchor', ['source', 'target']),
            },
            {
                provide: TaskFiltersHelper,
                useValue: instance(taskFiltersHelperMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed
            .configureTestingModule(moduleDef)
            .overrideComponent(TasksCalendarComponent, {
                set: {
                    providers: [
                        {
                            provide: CalendarSelectionHelper,
                            useValue: calendarSelectionHelperSpy,
                        },
                        {
                            provide: TasksCalendarUrlQueryParamsHelper,
                            useFactory: () => instance(tasksCalendarUrlQueryParamsHelperMock),
                        },
                    ],
                },
            })
            .compileComponents();
    }));

    beforeEach(() => {
        when(breakpointHelperMock.currentBreakpoint()).thenReturn('xl');
        fixture = TestBed.createComponent(TasksCalendarComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        modalService = TestBed.inject(ModalService);
        store = TestBed.inject(Store);
        drawerService = TestBed.inject(DrawerService);
        resizeHelper = TestBed.inject(ResizeHelper);
        flyoutService = TestBed.inject(FlyoutService);
        milestoneAnchor = TestBed.inject(MilestoneAnchor) as jasmine.SpyObj<MilestoneAnchor>;
        taskCardWeekAnchor = TestBed.inject(TaskCardWeekAnchor) as jasmine.SpyObj<TaskCardWeekAnchor>;
        taskCardWeekPlaceholderAnchor = TestBed.inject(TaskCardWeekPlaceholderAnchor) as jasmine.SpyObj<TaskCardWeekPlaceholderAnchor>;
        projectIdObservable = new BehaviorSubject(MOCK_PROJECT_1.id);

        comp.calendar = jasmine.createSpyObj('CalendarComponent', ['elementsDimensionsChanged', 'scrollTo']);

        when(calendarScopeHelperMock.getCalendarScope(anything())).thenReturn(sixWeeksScope);
        when(projectTaskQueries.observeCalendarTasks()).thenReturn(calendarTasksSubject);
        when(projectTaskQueries.observeCurrentTaskRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(projectTaskQueries.observeCalendarRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(projectTaskQueries.observeCalendarFilters())
            .thenReturn(of(ProjectTaskFilters.fromFormData(defaultTasksFilterFormData, defaultCommonFilterFormData)));
        when(projectTaskQueries.hasCalendarFiltersApplied()).thenReturn(of(false));
        when(calendarSelectionQueries.observeCalendarSelectionAction()).thenReturn(calendarSelectionActionSubject$);
        when(calendarSelectionQueries.observeTaskCalendarSelectionItems()).thenReturn(calendarSelectionTaskItemsSubject$);
        when(calendarScopeQueries.observeCalendarScopeParameters()).thenReturn(calendarScopeParametersSubject);
        when(calendarQueries.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingsDisabled));
        when(workareaQueries.observeWorkareas()).thenReturn(of(calendarWorkareas));
        when(projectQueries.observeCurrentProjectId()).thenReturn(projectIdObservable);
        when(dayCardDragHelper.getRecordBeingDragged()).thenReturn(MOCK_DAY_CARD_A);
        when(dayCardQueries.dayCardExists(MOCK_SCHEDULE_ITEM_A.dayCard.id)).thenReturn(true);
        when(dayCardQueries.getDayCardById(anyString())).thenReturn(MOCK_DAY_CARD_A);
        when(milestoneQueries.observeMilestoneListByMilestoneFilters()).thenReturn(of(milestones));
        when(milestoneQueries.observeMilestoneById(MOCK_MILESTONE_HEADER.id)).thenReturn(of(MOCK_MILESTONE_HEADER));
        when(milestoneQueries.observeMilestoneListRequestStatus()).thenReturn(of(RequestStatusEnum.empty));
        when(milestoneQueries.observeHasFiltersApplied()).thenReturn(of(false));
        when(milestoneQueries.observeFilters()).thenReturn(milestoneFiltersSubject);
        when(relationQueries.observeCriticalRelations()).thenReturn(criticalRelationsSubject);
        when(relationQueries.observeFinishToStartRelations()).thenReturn(finishToStartRelationsSubject);
        when(relationQueries.observePartOfRelationsByMilestoneId(MOCK_MILESTONE_HEADER.id)).thenReturn(milestoneSubtasksSubject);
        when(relationQueries.observePartOfRelationsByMilestoneId(MOCK_MILESTONE_WORKAREA.id)).thenReturn(milestoneSubtasksSubject);
        when(calendarSelectionQueries.observeCalendarSelectionSlice()).thenReturn(calendarSelectionSliceSubject);
        when(calendarScopeQueries.observeFocus()).thenReturn(focusSubject);
        when(calendarScopeQueries.observeFocusResolveStatus()).thenReturn(of(RequestStatusEnum.empty));
        when(calendarScopeQueries.observeExpandedWeeks()).thenReturn(expandedWeeksSubject);
        when(calendarScopeQueries.observeNavigateToElement()).thenReturn(navigateToElementSubject);
        when(calendarSelectionQueries.observeCalendarSelectionItemsIdsByType(ObjectTypeEnum.Task))
            .thenReturn(calendarSelectionItemsIdsByTaskSubject$);
        when(calendarSelectionQueries.observeCalendarSelectionItemsIdsByType(ObjectTypeEnum.Milestone))
            .thenReturn(calendarSelectionItemsIdsByMilestoneSubject$);
        when(relationQueries.observeFinishToStartPredecessorRelationsByMilestoneId(anyString()))
            .thenReturn(milestonePredecessorRelationsSubject);
        when(relationQueries.observeFinishToStartSuccessorRelationsByMilestoneId(anyString()))
            .thenReturn(milestoneSuccessorRelationsSubject);
        when(relationQueries.observeFinishToStartPredecessorRelationsByTaskId(anyString()))
            .thenReturn(taskPredecessorRelationsSubject);
        when(relationQueries.observeFinishToStartSuccessorRelationsByTaskId(anyString()))
            .thenReturn(taskSuccessorRelationsSubject);
        when(keyboardHelperMock.getShortcutPressedState(KeyboardShortcutEnum.Copy)).thenReturn(copyKeyPressedState$);
        when(workDaysQueriesMock.observeWorkingDays()).thenReturn(new BehaviorSubject<WeekDaysEnum[]>(MOCK_WORK_DAYS.workingDays));
        when(workDaysQueriesMock.observeHolidays()).thenReturn(new BehaviorSubject<WorkDaysHoliday[]>(MOCK_WORK_DAYS.holidays));

        calendarSelectionHelperSpy.canSelectItemType.and.returnValue(true);
        calendarSelectionHelperSpy.toggleSelectionItem.calls.reset();

        fixture.detectChanges();
    });

    afterEach(() => {
        calendarSelectionTaskItemsSubject$.next([]);
        calendarSelectionItemsIdsByTaskSubject$.next([]);
        calendarSelectionSliceSubject.next(CALENDAR_SELECTION_SLICE_INITIAL_STATE);
        calendarTasksSubject.next(calendarTasks);
        comp.ngOnDestroy();
    });

    afterAll(() => {
        fixture.destroy();
    });

    it('should return a CalendarWorkareaRowHeaderModel when getWorkareaHeader is called', () => {
        const row: CalendarRow = {
            id: '123',
            name: 'task',
            position: 1,
            records: [],
        };
        const {id, name, position} = row;
        const result: CalendarWorkareaRowHeaderModel = {
            id,
            name,
            position,
        };

        comp.expandedWeeks = [moment()];

        expect(comp.getWorkareaHeader(row)).toEqual(result);
    });

    it('should dispatch action to set new expanded weeks when handleExpandedWeeks is called', () => {
        const expandedWeeks = [moment()];
        const expectedResult = new CalendarScopeActions.Set.ExpandedWeeks(expandedWeeks);

        spyOn(store, 'dispatch').and.callThrough();

        comp.handleExpandedWeeks(expandedWeeks);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should return the currently focused milestone id when accessing focusedElementId', () => {
        const mockedMilestoneId = 'milestone-1';
        comp.focusedMilestoneId = mockedMilestoneId;
        expect(comp.focusedElementId).toEqual(mockedMilestoneId);
    });

    it('should return the currently focused task id when accessing focusedElementId', () => {
        const mockedTaskId = 'task-1';
        comp.focusedTaskId = mockedTaskId;
        expect(comp.focusedElementId).toEqual(mockedTaskId);
    });

    it('should set defaultValues to true when openModal is triggered', () => {
        const taskCalendarRecord: CreateRecordPayload = {
            end: moment(),
            rowId: '123',
            start: moment(),
        };

        comp.defaultValues = false;
        comp.openModal(taskCalendarRecord);

        expect(comp.defaultValues).toBeTruthy();
    });

    it('should close modal when modalClose is triggered', () => {
        spyOn(modalService, 'close');

        comp.closeModal();

        expect(modalService.close).toHaveBeenCalled();
    });

    it('should allow move when user has permission to update the task, the calendar in collapsed and has more than one column', () => {
        comp.calendarScope = sixWeeksScope;
        comp.expandedWeeks = [];

        expect(comp.moveTaskPermissionFunction(taskWithUpdatePermission.id)).toBeTruthy();
    });

    it('should not allow move when calendar has just one column', () => {
        comp.calendarScope = oneWeekScope;

        expect(comp.moveTaskPermissionFunction(taskWithUpdatePermission.id)).toBeFalsy();
    });

    it('should not allow move when calendar is expanded', () => {
        comp.calendarScope = sixWeeksScope;
        comp.expandedWeeks = [moment()];

        expect(comp.moveTaskPermissionFunction(taskWithUpdatePermission.id)).toBeFalsy();
    });

    it('should not allow move when user hasn\'t permission to update the task', () => {
        comp.calendarScope = sixWeeksScope;
        comp.expandedWeeks = [];

        expect(comp.moveTaskPermissionFunction(taskWithoutUpdatePermission.id)).toBeFalsy();
    });

    it('should allow drag when no task is selected and calendarSelectionEnabled is FALSE', () => {
        comp.calendarSelectionEnabled = false;

        comp.selectedTaskIds = [];

        expect(comp.canDragTaskFunction(taskWithUpdatePermission.id)).toBeTruthy();
    });

    it('should allow drag when the task is selected and calendarSelectionEnabled is FALSE', () => {
        comp.calendarSelectionEnabled = false;

        comp.selectedTaskIds = [taskWithUpdatePermission.id];

        expect(comp.canDragTaskFunction(taskWithUpdatePermission.id)).toBeTruthy();
    });

    it('should not allow drag when task is not included in the selected tasks and calendarSelectionEnabled is FALSE', () => {
        comp.calendarSelectionEnabled = false;

        comp.selectedTaskIds = [MOCK_TASK_4.id];

        expect(comp.canDragTaskFunction(taskWithUpdatePermission.id)).toBeFalsy();
    });

    it('should not allow drag when current calendar selection context is set to DEPENDENCIES', () => {
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        comp.selectedTaskIds = [];

        expect(comp.canDragTaskFunction(taskWithUpdatePermission.id)).toBeFalsy();
    });

    it('should not allow drag when current calendar selection context is set to TASKS_OF_MILESTONES', () => {
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.TasksOfMilestones,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        comp.selectedTaskIds = [];

        expect(comp.canDragTaskFunction(taskWithUpdatePermission.id)).toBeFalsy();
    });

    it('should not allow drag when current calendar selection context is set to RESCHEDULE', () => {
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Reschedule,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        comp.selectedTaskIds = [];

        expect(comp.canDragTaskFunction(taskWithUpdatePermission.id)).toBeFalsy();
    });

    it('should allow drag when current calendar selection context is set to null', () => {
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        comp.selectedTaskIds = [];

        expect(comp.canDragTaskFunction(taskWithUpdatePermission.id)).toBeTruthy();
    });

    it('should allow tasks to be dragged when these are from the same workarea', () => {
        const taskA: Task = {...MOCK_TASK_2, id: 'foo'};
        const taskB: Task = {...MOCK_TASK_2, id: 'bar'};

        when(calendarSelectionQueries.observeTaskCalendarSelectionItems()).thenReturn(of([taskA, taskB]));

        comp.selectedTaskIds = [taskA.id, taskB.id];

        comp.ngOnInit();

        expect(comp.canDragTaskFunction(taskA.id)).toBeTruthy();
        expect(comp.canDragTaskFunction(taskB.id)).toBeTruthy();
    });

    it('should not allow tasks to be dragged when these are from different workareas', () => {
        const taskA: Task = {...MOCK_TASK_2, id: 'foo', workArea: {...MOCK_TASK_2.workArea, id: 'foo'}};
        const taskB: Task = {...MOCK_TASK_2, id: 'bar', workArea: {...MOCK_TASK_2.workArea, id: 'bar'}};

        when(calendarSelectionQueries.observeTaskCalendarSelectionItems()).thenReturn(of([taskA, taskB]));

        comp.selectedTaskIds = [taskA.id, taskB.id];

        comp.ngOnInit();

        expect(comp.canDragTaskFunction(taskA.id)).toBeFalsy();
        expect(comp.canDragTaskFunction(taskB.id)).toBeFalsy();
    });

    it('should not allow tasks to be dragged when at least one task has no workarea', () => {
        const taskA: Task = {...MOCK_TASK_2, id: 'foo', workArea: {...MOCK_TASK_2.workArea, id: 'foo'}};
        const taskB: Task = {...MOCK_TASK_2, id: 'bar', workArea: undefined};

        when(calendarSelectionQueries.observeTaskCalendarSelectionItems()).thenReturn(of([taskA, taskB]));

        comp.selectedTaskIds = [taskA.id, taskB.id];

        comp.ngOnInit();

        expect(comp.canDragTaskFunction(taskA.id)).toBeFalsy();
        expect(comp.canDragTaskFunction(taskB.id)).toBeFalsy();
    });

    it('should dispatch MoveOne action when handleMoveRecords is called with one task', () => {
        spyOn(store, 'dispatch').and.callThrough();
        const eventId = taskWithUpdatePermission.id;
        const {schedule: {start, end}} = taskWithoutUpdatePermission;
        const rowId = taskWithUpdatePermission.workArea.id;
        const shiftDays = 5 * NUMBER_OF_DAYS_PER_WEEK;
        const updateRecordPayload: MoveRecordPayload[] = [{
            id: eventId,
            rowId,
            shiftDays,
        }];
        const updateTaskPayload: MoveTaskPayload = {
            taskId: eventId,
            workAreaId: rowId,
            start: moment(start).add(shiftDays, 'd'),
            end: moment(end).add(shiftDays, 'd'),
        };
        const action = new ProjectTaskActions.Move.One(updateTaskPayload);

        comp.handleMoveRecords(updateRecordPayload);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch MoveAll action when handleMoveRecords is called with multiple tasks', () => {
        spyOn(store, 'dispatch').and.callThrough();
        const tasks = [taskWithUpdatePermission, MOCK_TASK_4];
        const shiftDays = 2 * NUMBER_OF_DAYS_PER_WEEK;
        const updateRecordPayload: MoveRecordPayload[] = tasks.map(task => ({
            id: task.id,
            rowId: task.workArea.id,
            shiftDays,
        }));
        const updateTaskPayload: MoveTaskPayload[] = updateRecordPayload.map((task, index) => {
            const {schedule: {start, end}} = tasks[index];

            return {
                taskId: task.id,
                workAreaId: task.rowId,
                start: moment(start).add(shiftDays, 'd'),
                end: moment(end).add(shiftDays, 'd'),
            }
        });
        const action = new ProjectTaskActions.Move.All(updateTaskPayload);

        comp.handleMoveRecords(updateRecordPayload);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch ProjectTaskActions.Copy.All action when handleCopyRecords is called with tasks with workarea', () => {
        spyOn(store, 'dispatch').and.callThrough();
        const tasks = [taskWithUpdatePermission, MOCK_TASK_4];
        const shiftDays = 0;
        const updateRecordPayload: MoveRecordPayload[] = tasks.map(task => ({
            id: task.id,
            rowId: task.workArea.id,
            shiftDays,
        }));
        const copyTaskPayload: SaveCopyTaskResource[] = tasks.map((task) => {
            return {
                id: task.id,
                shiftDays: shiftDays,
                includeDayCards: true,
                parametersOverride: {
                    workAreaId: task.workArea.id,
                },
            };
        });
        const action = new ProjectTaskActions.Copy.All(copyTaskPayload);

        comp.handleCopyRecords(updateRecordPayload);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch ProjectTaskActions.Copy.All action when handleCopyRecords is called with tasks without workarea', () => {
        spyOn(store, 'dispatch').and.callThrough();
        const tasks = [MOCK_TASK_RESOURCE];
        const shiftDays = 0;
        const updateRecordPayload: MoveRecordPayload[] = tasks.map(task => ({
            id: task.id,
            rowId: null,
            shiftDays,
        }));
        const copyTaskPayload: SaveCopyTaskResource[] = tasks.map((task) => {
            return {
                id: task.id,
                shiftDays: shiftDays,
                includeDayCards: true,
                parametersOverride: {
                    workAreaId: WORKAREA_UUID_EMPTY,
                },
            };
        });
        const action = new ProjectTaskActions.Copy.All(copyTaskPayload);

        comp.handleCopyRecords(updateRecordPayload);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should set isLoading to true when calendar data is being fetched', () => {
        when(projectTaskQueries.observeCalendarRequestStatus()).thenReturn(of(RequestStatusEnum.progress));
        when(projectTaskQueries.observeCurrentTaskRequestStatus()).thenReturn(of(RequestStatusEnum.empty));

        comp.ngOnInit();

        expect(comp.isLoading).toBeTruthy();
    });

    it('should set isLoading to true when a calendar is being created or updated', () => {
        when(projectTaskQueries.observeCalendarRequestStatus()).thenReturn(of(RequestStatusEnum.empty));
        when(projectTaskQueries.observeCurrentTaskRequestStatus()).thenReturn(of(RequestStatusEnum.progress));

        comp.ngOnInit();

        expect(comp.isLoading).toBeTruthy();
    });

    it('should set isLoading to false when both calendar data is not being fetched and tasks are not being created or updated', () => {
        when(projectTaskQueries.observeCalendarRequestStatus()).thenReturn(of(RequestStatusEnum.empty));
        when(projectTaskQueries.observeCurrentTaskRequestStatus()).thenReturn(of(RequestStatusEnum.empty));

        comp.ngOnInit();

        expect(comp.isLoading).toBeFalsy();
    });

    it('should set isLoading to false when a calendar is being created or updated and isExpanded is TRUE', () => {
        when(projectTaskQueries.observeCalendarRequestStatus()).thenReturn(of(RequestStatusEnum.empty));
        when(projectTaskQueries.observeCurrentTaskRequestStatus()).thenReturn(of(RequestStatusEnum.progress));

        spyOnProperty(comp, 'isExpanded', 'get').and.returnValue(true);

        comp.ngOnInit();

        expect(comp.isLoading).toBeFalsy();
    });

    it('should set is loading to true when a resolve focus status is in progress', () => {
        when(calendarScopeQueries.observeFocusResolveStatus()).thenReturn(of(RequestStatusEnum.progress));

        comp.ngOnInit();

        expect(comp.isLoading).toBeTruthy();
    });

    it('should set is loading to false when a resolve focus status is not in progress', () => {
        when(calendarScopeQueries.observeFocusResolveStatus()).thenReturn(of(RequestStatusEnum.empty));

        comp.ngOnInit();

        expect(comp.isLoading).toBeFalsy();
    });

    it('should set is loading to true when the milestones are being fetched', () => {
        when(milestoneQueries.observeMilestoneListRequestStatus()).thenReturn(of(RequestStatusEnum.progress));

        comp.ngOnInit();

        expect(comp.isLoading).toBeTruthy();
    });

    it('should set is loading to false when the milestones are not being fetched', () => {
        when(milestoneQueries.observeMilestoneListRequestStatus()).thenReturn(of(RequestStatusEnum.empty));

        comp.ngOnInit();

        expect(comp.isLoading).toBeFalsy();
    });

    it('should request workareas after project ID has changes', () => {
        const payload = new WorkareaActions.Request.All();

        spyOn(store, 'dispatch').and.callThrough();

        comp.ngOnInit();
        projectIdObservable.next(MOCK_PROJECT_2.id);

        expect(store.dispatch).toHaveBeenCalledWith(payload);
    });

    it('should dispatch action to set the mode when handleModeChange is called', () => {
        const mode = TasksCalendarModeEnum.EighteenWeeks;
        const expectedResult = new CalendarScopeActions.Set.Mode(mode);

        spyOn(store, 'dispatch').and.callThrough();

        comp.handleModeChange(mode);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should not collapse expanded week if it goes out of the scope', () => {
        const sixWeekFilters = Object.assign({}, taskCalendarFilters, {
            from: sixWeeksScope.start,
            to: sixWeeksScope.end,
        });
        const roadmapFilters = Object.assign({}, taskCalendarFilters, {
            from: roadmapScope.start,
            to: roadmapScope.end,
        });

        when(projectTaskQueries.observeCalendarFilters()).thenReturn(taskFilters$);
        taskFilters$.next(roadmapFilters);

        comp.ngOnInit();

        comp.expandedWeeks = [roadmapFilters.to];

        expect(comp.isExpanded).toBeTruthy();

        taskFilters$.next(sixWeekFilters);

        expect(comp.isExpanded).toBeTruthy();
    });

    it('should not have any week expanded by default', () => {
        expect(comp.expandedWeeks.length).toBe(0);
    });

    it('should set taskStyles when setShowMoreIndexes is called', () => {

        comp.taskStyles = null;

        expect(comp.taskStyles).toBeDefined();
    });

    it('should set taskStyles when handleExpandedWeeks is called', () => {
        comp.taskStyles = null;
        comp.handleExpandedWeeks([moment()]);

        expect(comp.taskStyles).toBeDefined();
    });

    it('task should have 48px height and 9px margin-bottom when no expanded weeks and no indicators are shown', () => {
        const referenceDate = startDate.clone();
        const tasks: Task[] = [
            shiftTask(MOCK_TASK_4, referenceDate, referenceDate.clone().endOf('week')),
            shiftTask(MOCK_TASK_2, referenceDate, referenceDate.clone().endOf('week'), false),
        ];

        when(projectTaskQueries.observeCalendarTasks()).thenReturn(of(tasks));
        comp.expandedWeeks = [];
        comp.ngOnInit();

        expect(comp.taskStyles[MOCK_TASK_4.id]['height.px']).toEqual(48);
        expect(comp.taskStyles[MOCK_TASK_4.id]['margin-bottom.px']).toEqual(9);
        expect(comp.taskStyles[MOCK_TASK_2.id]['height.px']).toEqual(48);
        expect(comp.taskStyles[MOCK_TASK_2.id]['margin-bottom.px']).toEqual(9);
    });

    it('task should have 32px height and 81px margin-bottom when task is expanded', () => {
        const referenceDate = startDate.clone();
        const tasks: Task[] = [
            shiftTask(MOCK_TASK_4, referenceDate, referenceDate.clone().endOf('week')),
            shiftTask(MOCK_TASK_2, referenceDate, referenceDate.clone().endOf('week'), false),
        ];

        when(projectTaskQueries.observeCalendarTasks()).thenReturn(of(tasks));
        comp.expandedWeeks = [referenceDate.clone()];
        comp.ngOnInit();

        expect(comp.taskStyles[MOCK_TASK_4.id]['height.px']).toEqual(32);
        expect(comp.taskStyles[MOCK_TASK_4.id]['margin-bottom.px']).toEqual(81);
        expect(comp.taskStyles[MOCK_TASK_2.id]['height.px']).toEqual(32);
        expect(comp.taskStyles[MOCK_TASK_2.id]['margin-bottom.px']).toEqual(81);
    });

    it('task should have 32px height and 9px margin-bottom when exists expanded weeks but task is not expanded', () => {
        const referenceDate = startDate.clone();
        const tasks: Task[] = [
            shiftTask(MOCK_TASK_4, referenceDate, referenceDate.clone().endOf('week')),
            shiftTask(MOCK_TASK_2, referenceDate, referenceDate.clone().endOf('week'), false),
        ];

        when(projectTaskQueries.observeCalendarTasks()).thenReturn(of(tasks));
        comp.expandedWeeks = [referenceDate.clone().add(1, 'w')];
        comp.ngOnInit();

        expect(comp.taskStyles[MOCK_TASK_4.id]['height.px']).toEqual(32);
        expect(comp.taskStyles[MOCK_TASK_4.id]['margin-bottom.px']).toEqual(9);
        expect(comp.taskStyles[MOCK_TASK_2.id]['height.px']).toEqual(32);
        expect(comp.taskStyles[MOCK_TASK_2.id]['margin-bottom.px']).toEqual(9);
    });

    it('task should have 48px height and 33px margin-bottom when no expanded weeks and indicators are shown', () => {
        const referenceDate = startDate.clone();
        const tasks: Task[] = [
            shiftTask(MOCK_TASK_4, referenceDate, referenceDate.clone().endOf('week')),
            shiftTask(MOCK_TASK_2, referenceDate, referenceDate.clone().endOf('week'), false),
        ];

        when(projectTaskQueries.observeCalendarTasks()).thenReturn(of(tasks));
        when(calendarQueries.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingsEnabled));

        comp.expandedWeeks = [];
        comp.ngOnInit();

        expect(comp.taskStyles[MOCK_TASK_4.id]['height.px']).toEqual(48);
        expect(comp.taskStyles[MOCK_TASK_4.id]['margin-bottom.px']).toEqual(33);
        expect(comp.taskStyles[MOCK_TASK_2.id]['height.px']).toEqual(48);
        expect(comp.taskStyles[MOCK_TASK_2.id]['margin-bottom.px']).toEqual(33);
    });

    it('task should have 32px height and 81px margin-bottom when task is expanded and indicators are shown', () => {
        const referenceDate = startDate.clone();
        const tasks: Task[] = [
            shiftTask(MOCK_TASK_4, referenceDate, referenceDate.clone().endOf('week')),
            shiftTask(MOCK_TASK_2, referenceDate, referenceDate.clone().endOf('week'), false),
        ];

        when(projectTaskQueries.observeCalendarTasks()).thenReturn(of(tasks));
        when(calendarQueries.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingsEnabled));
        comp.expandedWeeks = [referenceDate.clone()];
        comp.ngOnInit();

        expect(comp.taskStyles[MOCK_TASK_4.id]['height.px']).toEqual(32);
        expect(comp.taskStyles[MOCK_TASK_4.id]['margin-bottom.px']).toEqual(81);
        expect(comp.taskStyles[MOCK_TASK_2.id]['height.px']).toEqual(32);
        expect(comp.taskStyles[MOCK_TASK_2.id]['margin-bottom.px']).toEqual(81);
    });

    it('task should have 32px height and 33px margin-bottom ' +
        'when exists expanded weeks but task is not expanded and indicators are shown', () => {
        const referenceDate = startDate.clone();
        const tasks: Task[] = [
            shiftTask(MOCK_TASK_4, referenceDate, referenceDate.clone().endOf('week')),
            shiftTask(MOCK_TASK_2, referenceDate, referenceDate.clone().endOf('week'), false),
        ];

        when(projectTaskQueries.observeCalendarTasks()).thenReturn(of(tasks));
        when(calendarQueries.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingsEnabled));
        comp.expandedWeeks = [referenceDate.clone().add(1, 'w')];
        comp.ngOnInit();

        expect(comp.taskStyles[MOCK_TASK_4.id]['height.px']).toEqual(32);
        expect(comp.taskStyles[MOCK_TASK_4.id]['margin-bottom.px']).toEqual(33);
        expect(comp.taskStyles[MOCK_TASK_2.id]['height.px']).toEqual(32);
        expect(comp.taskStyles[MOCK_TASK_2.id]['margin-bottom.px']).toEqual(33);
    });

    it('should set isCopying to true when observed Selection action is Copy', () => {
        comp.isCopying = false;
        calendarSelectionActionSubject$.next(CalendarSelectionActionEnum.Copy);

        expect(comp.isCopying).toBeTruthy();
    });

    it('should set isCopying to false when observed Selection action is not Copy', () => {
        comp.isCopying = true;
        calendarSelectionActionSubject$.next(CalendarSelectionActionEnum.Move);

        expect(comp.isCopying).toBeFalsy();
    });

    it('should call selection item two times and with focusedTaskId and ObjectTypeEnum.Task when calling handleSelectTask, ' +
        'focusedTaskId is defined and focusedTaskId is different than taskId', () => {
        const taskId = taskWithUpdatePermission.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        comp.focusedTaskId = MOCK_TASK_RESOURCE_4.id;

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        comp.handleSelectTask(taskId);

        expect(calendarSelectionHelperSpy.toggleSelectionItem).toHaveBeenCalledTimes(2);
        expect(calendarSelectionHelperSpy.toggleSelectionItem).toHaveBeenCalledWith(taskId, ObjectTypeEnum.Task);
        expect(calendarSelectionHelperSpy.toggleSelectionItem).toHaveBeenCalledWith(comp.focusedTaskId, ObjectTypeEnum.Task);
    });

    it('should call selection item one time with taskId and ObjectTypeEnum.Task when calling handleSelectTask, ' +
        'focusedTaskId is defined and focusedTaskId is the same as than taskId', () => {
        const taskId = taskWithUpdatePermission.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        comp.focusedTaskId = taskWithUpdatePermission.id;

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        comp.handleSelectTask(taskId);

        expect(calendarSelectionHelperSpy.toggleSelectionItem).toHaveBeenCalledTimes(1);
        expect(calendarSelectionHelperSpy.toggleSelectionItem).toHaveBeenCalledWith(comp.focusedTaskId, ObjectTypeEnum.Task);
    });

    it('should call selection item one time with taskId and ObjectTypeEnum.Task when calling handleSelectTask, ' +
        'focusedTaskId is not defined', () => {
        const taskId = taskWithUpdatePermission.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        comp.handleSelectTask(taskId);

        expect(calendarSelectionHelperSpy.toggleSelectionItem).toHaveBeenCalledTimes(1);
        expect(calendarSelectionHelperSpy.toggleSelectionItem).toHaveBeenCalledWith(taskId, ObjectTypeEnum.Task);
    });

    it('should call toggle selection item with taskId and ObjectTypeEnum.Task when calling handleSelectTask, calendar selection ' +
        'is enabled and the task is selectable', () => {
        const taskId = taskWithUpdatePermission.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        comp.handleSelectTask(taskId);

        expect(calendarSelectionHelperSpy.toggleSelectionItem).toHaveBeenCalledWith(taskId, ObjectTypeEnum.Task);
    });

    it('should not call toggle selection item with taskId and ObjectTypeEnum.Task when calling handleSelectTask, calendar ' +
        'selection is not enabled and the task is selectable', () => {
        const taskId = taskWithUpdatePermission.id;

        comp.handleSelectTask(taskId);

        expect(calendarSelectionHelperSpy.toggleSelectionItem).not.toHaveBeenCalled();
    });

    it('should not call toggle selection item with taskId and ObjectTypeEnum.Task when calling handleSelectTask, calendar ' +
        'selection is enabled and the task is not selectable', () => {
        const taskId = taskWithUpdatePermission.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        spyOn(comp, 'canSelectTask').and.returnValue(false);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        comp.handleSelectTask(taskId);

        expect(calendarSelectionHelperSpy.toggleSelectionItem).not.toHaveBeenCalled();
    });

    it('should dispatch CalendarSelectionActions.Toggle.SelectionItem when calling handleSelectMilestone, ' +
        'calendar selection context is DEPENDENCIES and canSelectMilestone returns TRUE', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const milestoneObjectIdentifier = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId);
        const action = new CalendarSelectionActions.Toggle.SelectionItem(milestoneObjectIdentifier);
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        spyOn(store, 'dispatch').and.callThrough();
        spyOn(comp, 'canSelectMilestone').and.returnValue(true);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        comp.handleSelectMilestone(milestoneId);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should not dispatch CalendarSelectionActions.Toggle.SelectionItem when calling handleSelectMilestone, ' +
        'calendar selection context is DEPENDENCIES and canSelectMilestone returns FALSE', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        spyOn(store, 'dispatch').and.callThrough();
        spyOn(comp, 'canSelectMilestone').and.returnValue(false);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        comp.handleSelectMilestone(milestoneId);

        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch CalendarSelectionActions.Toggle.SelectionItem when calling handleSelectMilestone, ' +
        'calendar selection context is not DEPENDENCIES and canSelectMilestone returns TRUE', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.TasksOfMilestones,
            isMultiSelecting: true,
        };

        spyOn(store, 'dispatch').and.callThrough();
        spyOn(comp, 'canSelectMilestone').and.returnValue(true);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        comp.handleSelectMilestone(milestoneId);

        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch CalendarSelectionActions.Toggle.SelectionItem when calling handleSelectMilestone, ' +
        'calendar selection context is not DEPENDENCIES and canSelectMilestone returns FALSE', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.TasksOfMilestones,
            isMultiSelecting: true,
        };

        spyOn(store, 'dispatch').and.callThrough();
        spyOn(comp, 'canSelectMilestone').and.returnValue(false);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        comp.handleSelectMilestone(milestoneId);

        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should dispatch CalendarSelectionActions.Initialize.All when task is focused', () => {
        const taskIdA = taskWithUpdatePermission.id;
        const action = new CalendarSelectionActions.Initialize.All();

        spyOn(store, 'dispatch').and.callThrough();
        spyOn(drawerService, 'open').and.callThrough();

        setFocusedTask(taskIdA);

        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(drawerService.open).toHaveBeenCalledWith(TasksDetailDrawerComponent, taskIdA);
    });

    it('should reset the list of selected tasks when ngOnDestroy is called', () => {
        const action = new CalendarSelectionActions.Initialize.All();

        spyOn(store, 'dispatch').and.callThrough();

        comp.ngOnDestroy();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should set selectedTaskIds when observeCalendarSelectionItemsIdsByType emits a new calendar selection state for tasks', () => {
        const selectedTasks = [MOCK_TASK_3, MOCK_TASK_4];
        const selectedTaskIds = selectedTasks.map(task => task.id);

        calendarSelectionItemsIdsByTaskSubject$.next(selectedTaskIds);

        expect(comp.selectedTaskIds).toEqual(selectedTaskIds);
    });

    it('should set selectedMilestoneIds when observeCalendarSelectionItemsIdsByType emits a new calendar selection ' +
        'state for milestones', () => {
        const selectedMilestones = [MOCK_MILESTONE_HEADER, MOCK_MILESTONE_WORKAREA];
        const selectedMilestoneIds = selectedMilestones.map(milestone => milestone.id);

        calendarSelectionItemsIdsByMilestoneSubject$.next(selectedMilestoneIds);

        expect(comp.selectedMilestoneIds).toEqual(selectedMilestoneIds);
    });

    it('should not set new focus when exists a task focused, isMultiSelecting is TRUE and calendar selection ' +
        'context is set to DEPENDENCIES or TASKS_OF_MILESTONE OR RESCHEDULE when calling handleSelectTask', () => {
        const focusedMilestoneId = MOCK_MILESTONE_HEADER.id;
        const nextSelectedTaskId = MOCK_TASK_2.id;
        const nextSelectedTaskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, nextSelectedTaskId);
        const notExpectedResult = new CalendarScopeActions.Set.Focus(nextSelectedTaskObject);
        const calendarSelectionSliceNextStateDependenciesContext: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };
        const calendarSelectionSliceNextStateTasksOfMilestonesContext: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.TasksOfMilestones,
            isMultiSelecting: true,
        };
        const calendarSelectionSliceNextStateRescheduleContext: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Reschedule,
            isMultiSelecting: true,
        };

        setFocusedMilestone(focusedMilestoneId);
        calendarSelectionSliceSubject.next(calendarSelectionSliceNextStateDependenciesContext);

        spyOn(store, 'dispatch').and.callThrough();

        comp.handleSelectTask(nextSelectedTaskId);

        expect(store.dispatch).not.toHaveBeenCalledWith(notExpectedResult);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextStateTasksOfMilestonesContext);

        comp.handleSelectTask(nextSelectedTaskId);

        expect(store.dispatch).not.toHaveBeenCalledWith(notExpectedResult);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextStateRescheduleContext);

        comp.handleSelectTask(nextSelectedTaskId);

        expect(store.dispatch).not.toHaveBeenCalledWith(notExpectedResult);
    });

    it('should unset focused task when exists a task focused, isMultiSelecting is set to TRUE and' +
        'context is null when calling handleSelectTask', () => {
        const taskIdA = taskWithUpdatePermission.id;
        const taskIdB = MOCK_TASK_4.id;
        const expectedResult = new CalendarScopeActions.Set.Focus(null);
        const calendarSelectionSlice: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        setFocusedTask(taskIdA);

        spyOn(store, 'dispatch').and.callThrough();

        calendarSelectionSliceSubject.next(calendarSelectionSlice);
        comp.handleSelectTask(taskIdB);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should not allow hiding Task Card of a Day Card is being dragged', () => {
        const taskId = MOCK_DAY_CARD_A.task.id;
        when(dayCardDragHelper.getRecordBeingDragged()).thenReturn(MOCK_DAY_CARD_A);

        expect(comp.canHideTaskFunction(taskId)).toBeFalsy();
    });

    it('should allow hiding Task Card of not belongs to a Day Card being dragged', () => {
        const taskId = 'id_of_a_task_whose_day_cards_are_not_being_dragged';
        when(dayCardDragHelper.getRecordBeingDragged()).thenReturn(MOCK_DAY_CARD_A);

        expect(comp.canHideTaskFunction(taskId)).toBeTruthy();
    });

    it('should not set a new focus on handleSelectTask and current calendar selection context is defined', () => {
        const taskId = MOCK_TASK_4.id;
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId);
        const notExpectedResult = new CalendarScopeActions.Set.Focus(taskObject);
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.TasksOfMilestones,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        spyOn(store, 'dispatch').and.callThrough();

        comp.handleSelectTask(taskId);

        expect(store.dispatch).not.toHaveBeenCalledWith(notExpectedResult);
    });

    it('should set weekWidth when calendar week width changes', () => {
        const expectedResult = 200;
        comp.handleWeekWidthChange(expectedResult);

        expect(comp.weekWidth).toBe(expectedResult);
    });

    it('should disable calendar scroll when daycard flyout is open and reenable it when it closes', fakeAsync(() => {
        const dayCardId = MOCK_SCHEDULE_ITEM_A.dayCard.id;
        flyoutService.openEvents.next(dayCardId);
        tick(0);
        expect(comp.hideScroll).toBeTruthy();
        flyoutService.closeEvents.next(dayCardId);
        tick(0);
        expect(comp.hideScroll).toBeFalsy();
    }));

    it('should set shiftMode to "move" when observed Selection Action is Move', () => {
        calendarSelectionActionSubject$.next(CalendarSelectionActionEnum.Move);

        expect(comp.shiftMode).toBe('move');
    });

    it('should set shiftMode to "copy" when observed Selection Action is Copy', () => {
        calendarSelectionActionSubject$.next(CalendarSelectionActionEnum.Copy);

        expect(comp.shiftMode).toBe('copy');
    });

    it('should return true when isTaskSelectedFunction is called for a selected task', () => {
        const taskId = MOCK_TASK_2.id;

        comp.selectedTaskIds = [taskId];

        expect(comp.isTaskSelectedFunction(taskId)).toBeTruthy();
    });

    it('should return false when isTaskSelectedFunction is called for a task that is not selected', () => {
        const taskId = MOCK_TASK_2.id;

        comp.selectedTaskIds = [];

        expect(comp.isTaskSelectedFunction(taskId)).toBeFalsy();
    });

    it('should return true when isTaskFocusedFunction is called for a focused task', () => {
        const taskId = MOCK_TASK_2.id;

        comp.focusedTaskId = taskId;

        expect(comp.isTaskFocusedFunction(taskId)).toBeTruthy();
    });

    it('should return false when isTaskFocusedFunction is called for a task that is not focused', () => {
        const taskId = MOCK_TASK_2.id;

        comp.focusedTaskId = null;

        expect(comp.isTaskFocusedFunction(taskId)).toBeFalsy();
    });

    it('should update multiple selection toolbar visibility when task calendar selection items changes and ' +
        'calendar selection context is null', () => {
        const calendarSelectionSliceNextStateContextNull: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            items: [new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_2.id)],
            isMultiSelecting: true,
        };
        const calendarSelectionSliceNextStateContextDependencies: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            items: [
                new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_2.id),
                new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_3.id),
            ],
            isMultiSelecting: true,
        };

        expect(comp.canShowMultiSelectCommandBar).toBeFalsy();
        expect(getElement(multipleSelectionToolbarSelector)).not.toBeDefined();

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextStateContextNull);
        fixture.detectChanges();

        expect(comp.canShowMultiSelectCommandBar).toBeTruthy();
        expect(getElement(multipleSelectionToolbarSelector)).toBeDefined();

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextStateContextDependencies);
        fixture.detectChanges();

        expect(comp.canShowMultiSelectCommandBar).toBeFalsy();
        expect(getElement(multipleSelectionToolbarSelector)).not.toBeDefined();
    });

    it('should update multiple selection toolbar visibility when calendar selection changes', () => {
        const calendarSelectionSliceFreeSelection: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };
        const calendarSelectionSliceFreeSelectionWithItems: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: false,
            items: [new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_2.id)],
        };
        const calendarSelectionSliceNextStateContextDependencies: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
            context: CalendarSelectionContextEnum.Dependencies,
        };

        expect(comp.canShowMultiSelectCommandBar).toBeFalsy();
        expect(getElement(multipleSelectionToolbarSelector)).not.toBeDefined();

        calendarSelectionSliceSubject.next(calendarSelectionSliceFreeSelection);
        fixture.detectChanges();

        expect(comp.canShowMultiSelectCommandBar).toBeTruthy();
        expect(getElement(multipleSelectionToolbarSelector)).toBeDefined();

        calendarSelectionSliceSubject.next(calendarSelectionSliceFreeSelectionWithItems);
        fixture.detectChanges();

        expect(comp.canShowMultiSelectCommandBar).toBeTruthy();
        expect(getElement(multipleSelectionToolbarSelector)).toBeDefined();

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextStateContextDependencies);
        fixture.detectChanges();

        expect(comp.canShowMultiSelectCommandBar).toBeFalsy();
        expect(getElement(multipleSelectionToolbarSelector)).not.toBeDefined();
    });

    it('should reset the list of selected tasks when handleMultiSelectToolbarClose is called', () => {
        const action = new CalendarSelectionActions.Initialize.All();

        spyOn(store, 'dispatch').and.callThrough();

        comp.handleMultiSelectToolbarClose();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should allow task to be selected when no task has yet been selected nor focused', () => {
        const taskId = taskWithoutUpdatePermission.id;

        expect(comp.canSelectTask(taskId)).toBeTruthy();
    });

    it('should not allow task to be selected when the provided taskId don\'t exist', () => {
        const taskId = taskWithoutUpdatePermission.id + 'not-exist';

        expect(comp.canSelectTask(taskId)).toBeFalsy();
    });

    it('should allow task to be selected when calendar selection slice items is of type task, multi selecting is true and' +
        'calendar selection context is null', () => {
        const taskId = MOCK_TASK_4.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        expect(comp.canSelectTask(taskId)).toBeTruthy();
    });

    it('should not allow task to be selected when calendar selection slice items is of type daycard, multi selecting is true and' +
        'calendar selection context is null', () => {
        const taskId = MOCK_TASK_4.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        calendarSelectionHelperSpy.canSelectItemType.and.returnValue(false);

        expect(comp.canSelectTask(taskId)).toBeFalsy();
    });

    it('should allow task to be selected when it is from the same workarea as the selected ones and ' +
        'calendar selection context is null', () => {
        const taskFromWorkareaA = taskWithoutUpdatePermission;
        const taskIdFromWorkareaA = MOCK_TASK_4.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        calendarSelectionTaskItemsSubject$.next([taskFromWorkareaA]);

        expect(comp.canSelectTask(taskIdFromWorkareaA)).toBeTruthy();
    });

    it('should allow task to be selected when it is from the same workarea as the focused one and ' +
        'calendar selection context is null', () => {
        const taskId1FromWorkareaA = taskWithoutUpdatePermission.id;
        const taskId2FromWorkareaA = MOCK_TASK_4.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        comp.handleSelectTask(taskId1FromWorkareaA);

        expect(comp.canSelectTask(taskId2FromWorkareaA)).toBeTruthy();
    });

    it('should allow task to be selected when it is from a different workarea as the selected ones and ' +
        'calendar selection context is null', () => {
        const taskFromWorkareaA = taskWithoutUpdatePermission.id;
        const taskIdFromWorkareaB = taskWithUpdatePermission.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        calendarSelectionItemsIdsByTaskSubject$.next([taskFromWorkareaA]);

        expect(comp.canSelectTask(taskIdFromWorkareaB)).toBeTruthy();
    });

    it('should allow task to be selected when it is from a different workarea as the focused one and ' +
        'calendar selection context is null', () => {
        const taskIdFromWorkareaA = taskWithoutUpdatePermission.id;
        const taskIdFromWorkareaB = taskWithUpdatePermission.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        setFocusedTask(taskIdFromWorkareaA);
        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        expect(comp.canSelectTask(taskIdFromWorkareaB)).toBeTruthy();
    });

    it('should allow task to be selected when it is from the same workarea as the current selected one,' +
        ' but different from the last selected and calendar selection context is null', () => {
        const taskFromWorkareaA = taskWithoutUpdatePermission.id;
        const taskFromWorkareaB = taskWithUpdatePermission.id;
        const taskIdFromWorkareaA = MOCK_TASK_4.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        calendarSelectionItemsIdsByTaskSubject$.next([taskFromWorkareaB]);

        expect(comp.canSelectTask(taskIdFromWorkareaA)).toBeTruthy();

        calendarSelectionItemsIdsByTaskSubject$.next([taskFromWorkareaA]);

        expect(comp.canSelectTask(taskIdFromWorkareaA)).toBeTruthy();
    });

    it('should not allow task to be selected if task belongs to a Milestone subtasks and ' +
        'calendar selection context is defined and it\'s not null', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const milestoneSubTaskId = MOCK_TASK_4.id;
        const relation: RelationResource[] = [{
            ...MOCK_RELATION_RESOURCE_1,
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, milestoneSubTaskId),
        }];
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.TasksOfMilestones,
            isMultiSelecting: true,
        };

        setFocusedMilestone(milestoneId);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        milestoneSubtasksSubject.next(relation);

        expect(comp.canSelectTask(milestoneSubTaskId)).toBeFalsy();
    });

    it('should not allow task to be select if task does not belong to a Milestone subtasks and ' +
        'calendar selection context is defined and it\'s not null but task does not exist', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const milestoneSubTaskId = MOCK_TASK_4.id;
        const relation: RelationResource[] = [{
            ...MOCK_RELATION_RESOURCE_1,
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, milestoneSubTaskId),
        }];
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        setFocusedMilestone(milestoneId);

        milestoneSubtasksSubject.next(relation);

        expect(comp.canSelectTask('NOT_EXISTING_TASK')).toBeFalsy();
    });

    it('should allow task to be selected if task does not belong to a Milestone subtasks and calendarSelectionEnabled ' +
        'is set true and task exists', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const milestoneSubTaskId = MOCK_TASK_4.id;
        const nextMilestoneSubTaskId = MOCK_TASK_2.id;
        const relation: RelationResource[] = [{
            ...MOCK_RELATION_RESOURCE_1,
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, milestoneSubTaskId),
        }];

        comp.calendarSelectionEnabled = true;

        setFocusedMilestone(milestoneId);

        milestoneSubtasksSubject.next(relation);

        expect(comp.canSelectTask(nextMilestoneSubTaskId)).toBeTruthy();
    });

    it('should allow task to be selected when task exists, calendar selection context is set to DEPENDENCIES and ' +
        'task does not belong to the focused milestone relations', () => {
        const taskId = MOCK_TASK_2.id;
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedMilestone(milestoneId);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        milestoneSuccessorRelationsSubject.next([]);
        milestonePredecessorRelationsSubject.next([]);

        expect(comp.canSelectTask(taskId)).toBeTruthy();
    });

    it('should not allow task to be selected when task exists, calendar selection context is set to DEPENDENCIES and ' +
        'task belongs to the focused milestone relations', () => {
        const taskId = MOCK_TASK_2.id;
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const milestoneTaskRelation: RelationResource = Object.assign({}, MOCK_RELATION_RESOURCE_2, {
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
        });
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedMilestone(milestoneId);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        milestoneSuccessorRelationsSubject.next([]);
        milestonePredecessorRelationsSubject.next([milestoneTaskRelation]);

        expect(comp.canSelectTask(taskId)).toBeFalsy();
    });

    it('should not allow task to be selected when task does not exists, calendar selection context is set to DEPENDENCIES and ' +
        'task does not belong to the focused milestone relations', () => {
        const taskId = MOCK_TASK_2.id;
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedMilestone(milestoneId);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        milestoneSuccessorRelationsSubject.next([]);
        milestonePredecessorRelationsSubject.next([]);

        expect(comp.canSelectTask(`${taskId}-INVALID`)).toBeFalsy();
    });

    it('should allow task to be selected when task exists, calendar selection context is set to DEPENDENCIES, ' +
        'task is different then the focused one and task does not belong to the focused task relations', () => {
        const taskId = MOCK_TASK_2.id;
        const focusedTaskId = MOCK_TASK_4.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedTask(focusedTaskId);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        taskSuccessorRelationsSubject.next([]);
        taskPredecessorRelationsSubject.next([]);

        expect(comp.canSelectTask(taskId)).toBeTruthy();
    });

    it('should not allow task to be selected when task exists, calendar selection context is set to DEPENDENCIES, ' +
        'task is different then the focused one and task belongs to the focused task relations', () => {
        const taskId = MOCK_TASK_2.id;
        const focusedTaskId = MOCK_TASK_3.id;
        const tasksRelation: RelationResource = Object.assign({}, MOCK_RELATION_RESOURCE_2, {
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Task, focusedTaskId),
        });
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedTask(focusedTaskId);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        taskSuccessorRelationsSubject.next([]);
        taskPredecessorRelationsSubject.next([tasksRelation]);

        expect(comp.canSelectTask(taskId)).toBeFalsy();
    });

    it('should not allow task to be selected when task exists, calendar selection context is set to DEPENDENCIES, ' +
        'task is the same as focused one and task does not belong to the focused task relations', () => {
        const taskId = MOCK_TASK_2.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedTask(taskId);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        taskSuccessorRelationsSubject.next([]);
        taskPredecessorRelationsSubject.next([]);

        expect(comp.canSelectTask(taskId)).toBeFalsy();
    });

    it('should not allow task to be selected when task does not exists, calendar selection context is set to DEPENDENCIES, ' +
        'task is different then the focused one and task does not belong to the focused task relations', () => {
        const taskId = MOCK_TASK_2.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedTask(taskId);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        taskSuccessorRelationsSubject.next([]);
        taskPredecessorRelationsSubject.next([]);

        expect(comp.canSelectTask(`${taskId}-INVALID`)).toBeFalsy();
    });

    it('should not allow task to be selected when calendar selection context is set to RESCHEDULE', () => {
        const taskId = MOCK_TASK_4.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Reschedule,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        expect(comp.canSelectTask(taskId)).toBeFalsy();
    });

    it('should not add taskId to the list of selected tasks when task can\'t be selected and ' +
        'calendar selection context is null', () => {
        const taskId = taskWithUpdatePermission.id;
        const taskObjectIdentifier = new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId);
        const action = new CalendarSelectionActions.Toggle.SelectionItem(taskObjectIdentifier);
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        spyOn(store, 'dispatch').and.callThrough();
        spyOn(comp, 'canSelectTask').and.returnValue(false);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        comp.handleSelectTask(taskId);

        expect(store.dispatch).not.toHaveBeenCalledWith(action);
    });

    it('should allow milestone to be selected when calendar selection context is NULL', () => {
        const milestoneId = MOCK_MILESTONE_WORKAREA.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        expect(comp.canSelectMilestone(milestoneId)).toBeTruthy();
    });

    it('should allow milestone to be selected when calendar selection context is not DEPENDENCIES', () => {
        const milestoneId = MOCK_MILESTONE_WORKAREA.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.TasksOfMilestones,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        expect(comp.canSelectMilestone(milestoneId)).toBeTruthy();
    });

    it('should not allow milestone to be selected when calendar selection context is RESCHEDULE', () => {
        const milestoneId = MOCK_MILESTONE_WORKAREA.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Reschedule,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        expect(comp.canSelectMilestone(milestoneId)).toBeFalsy();
    });

    it('should allow milestone to be selected when calendar selection context is DEPENDENCIES and ' +
        'current milestone is different from the focused one and its not part of the focused milestone relations', () => {
        const milestoneId = MOCK_MILESTONE_WORKAREA.id;
        const focusedMilestoneId = MOCK_MILESTONE_HEADER.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedMilestone(focusedMilestoneId);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        milestonePredecessorRelationsSubject.next([]);
        milestoneSuccessorRelationsSubject.next([]);

        expect(comp.canSelectMilestone(milestoneId)).toBeTruthy();
    });

    it('should not allow milestone to be selected when calendar selection context is DEPENDENCIES and ' +
        'current milestone is different from the focused one and its part of the focused milestone relations', () => {
        const milestoneId = MOCK_MILESTONE_WORKAREA.id;
        const focusedMilestoneId = MOCK_MILESTONE_HEADER.id;
        const milestoneSuccessorRelations = [
            Object.assign({}, MOCK_RELATION_RESOURCE_1, {
                source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
                target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, focusedMilestoneId),
            }),
        ];
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedMilestone(focusedMilestoneId);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        milestonePredecessorRelationsSubject.next([]);
        milestoneSuccessorRelationsSubject.next(milestoneSuccessorRelations);

        expect(comp.canSelectMilestone(milestoneId)).toBeFalsy();
    });

    it('should not allow milestone to be selected when calendar selection context is DEPENDENCIES and ' +
        'current milestone is the same from the focused one and its not part of the focused milestone relations', () => {
        const focusedMilestoneId = MOCK_MILESTONE_HEADER.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedMilestone(focusedMilestoneId);

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        milestonePredecessorRelationsSubject.next([]);
        milestoneSuccessorRelationsSubject.next([]);

        expect(comp.canSelectMilestone(focusedMilestoneId)).toBeFalsy();
    });

    it('should allow milestone to be selected when calendar selection context is DEPENDENCIES and ' +
        'its not part of the focused task relations', () => {
        const milestoneId = MOCK_MILESTONE_WORKAREA.id;
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedTask('foo');

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        taskPredecessorRelationsSubject.next([]);
        taskSuccessorRelationsSubject.next([]);

        expect(comp.canSelectMilestone(milestoneId)).toBeTruthy();
    });

    it('should not allow milestone to be selected when calendar selection context is DEPENDENCIES and ' +
        'its part of the focused task relations', () => {
        const milestoneId = MOCK_MILESTONE_WORKAREA.id;
        const milestoneSuccessorRelations = [
            Object.assign({}, MOCK_RELATION_RESOURCE_1, {
                source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
                target: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo'),
            }),
        ];
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedTask('foo');

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        taskPredecessorRelationsSubject.next([]);
        taskSuccessorRelationsSubject.next(milestoneSuccessorRelations);

        expect(comp.canSelectMilestone(milestoneId)).toBeFalsy();
    });

    it('should add selected tasks to calendar rows', () => {
        const selectedTasks = [MOCK_TASK_3, MOCK_TASK_4];
        const newCalendarTasks = [MOCK_TASK_2, MOCK_TASK_3];
        const expectedCalendarTasksIds = [MOCK_TASK_3.id, MOCK_TASK_4.id, MOCK_TASK_2.id];

        when(projectTaskQueries.observeCalendarTasks()).thenReturn(of(newCalendarTasks));
        when(calendarSelectionQueries.observeTaskCalendarSelectionItems()).thenReturn(of(selectedTasks));
        comp.ngOnInit();

        expect(getCalendarRecordsIds()).toEqual(expectedCalendarTasksIds);
    });

    it('should update calendar rows when selected tasks keep the same but are updated', () => {
        const newDate = moment();
        const updatedMockTask4: Task = shiftTask(MOCK_TASK_4, newDate, newDate, true, 1);
        const selectedTasks = [MOCK_TASK_3, MOCK_TASK_4];
        const selectedTasksUpdated = [MOCK_TASK_3, updatedMockTask4];
        const newCalendarTasks = [MOCK_TASK_3, MOCK_TASK_2];
        const expectedCalendarTasks = [MOCK_TASK_3, MOCK_TASK_4, MOCK_TASK_2];
        const expectedCalendarTasksUpdated = [MOCK_TASK_3, updatedMockTask4, MOCK_TASK_2];

        when(projectTaskQueries.observeCalendarTasks()).thenReturn(of(newCalendarTasks));
        comp.ngOnInit();

        expect(getCalendarRecords()).toEqual(mapTasksToRecords(newCalendarTasks));

        calendarSelectionTaskItemsSubject$.next(selectedTasks);

        expect(getCalendarRecords()).toEqual(mapTasksToRecords(expectedCalendarTasks));

        calendarSelectionTaskItemsSubject$.next(selectedTasksUpdated);

        expect(getCalendarRecords()).toEqual(mapTasksToRecords(expectedCalendarTasksUpdated));
    });

    it('should update calendar rows when calendar tasks keep the same but are updated', () => {
        const newDate = moment();
        const updatedMockTask4: Task = shiftTask(MOCK_TASK_4, newDate, newDate, true, 1);
        const newCalendarTasks = [MOCK_TASK_4];
        const newCalendarTasksUpdated = [updatedMockTask4];

        comp.ngOnInit();
        calendarTasksSubject.next(newCalendarTasks);

        expect(getCalendarRecords()).toEqual(mapTasksToRecords(newCalendarTasks));

        calendarTasksSubject.next(newCalendarTasksUpdated);

        expect(getCalendarRecords()).toEqual(mapTasksToRecords(newCalendarTasksUpdated));
    });

    it('should only add the filtered workareas to the calendar rows', () => {
        const filter = ProjectTaskFilters.fromFormData(defaultTasksFilterFormData, defaultCommonFilterFormData);
        filter.criteria.workAreaIds = ['123'];

        when(projectTaskQueries.observeCalendarFilters()).thenReturn(of(filter));
        comp.rows = [];
        comp.ngOnInit();

        expect(comp.rows.length).toBe(1);

        filter.criteria.workAreaIds = [WORKAREA_UUID_EMPTY];
        when(projectTaskQueries.observeCalendarFilters()).thenReturn(of(filter));

        comp.rows = [];
        comp.ngOnInit();

        expect(comp.rows.length).toBe(1);
    });

    it('should add all workareas when workarea filter is applied and highlight filter results is enabled', () => {
        const filter = ProjectTaskFilters.fromFormData(defaultTasksFilterFormData, defaultCommonFilterFormData);
        filter.criteria.workAreaIds = ['123'];
        filter.highlight = true;

        when(projectTaskQueries.observeCalendarFilters()).thenReturn(of(filter));
        comp.rows = [];
        comp.ngOnInit();

        expect(comp.rows.length).toBe(calendarWorkareas.length + 1);
    });

    it('should enable milestone creation slots when handleEnableAddMilestone is called', () => {
        comp.enableMilestoneCreation = false;
        comp.handleEnableAddMilestone();

        expect(comp.enableMilestoneCreation).toBeTruthy();
    });

    it('should disable milestone creation slots when handleEnableAddMilestone is called', () => {
        comp.handleEnableAddMilestone();
        comp.handleDisableAddMilestone();

        expect(comp.enableMilestoneCreation).toBeFalsy();
    });

    it('should disable milestone creation slots when Escape is pressed', () => {
        comp.handleEnableAddMilestone();
        sendKeyUp(KeyEnum.Escape);

        expect(comp.enableMilestoneCreation).toBeFalsy();
    });

    it('should disable milestone creation slots when user clicks outside the creation slots', () => {
        spyOn(document, 'getElementById').and.callFake((id: string) => {
            const element = document.createElement('div');
            const containsMock = {
                [flyoutSelector]: false,
            };

            spyOn(element, 'contains').and.returnValue(containsMock[id]);

            return element;
        });

        spyOn(document, 'getElementsByTagName').and.callFake((tagName: string) => {
            const element = document.createElement(tagName);
            const containsMock = {
                [milestoneCreationSlotsSelector]: false,
            };

            spyOn(element, 'contains').and.returnValue(containsMock[tagName]);

            return [element];
        });

        comp.handleEnableAddMilestone();
        document.dispatchEvent(mouseUpEvent);

        expect(comp.enableMilestoneCreation).toBeFalsy();
    });

    it('should disable milestone creation slots when user touches outside the creation slots', () => {
        spyOn(document, 'getElementById').and.callFake((id: string) => {
            const element = document.createElement('div');
            const containsMock = {
                [flyoutSelector]: false,
            };

            spyOn(element, 'contains').and.returnValue(containsMock[id]);

            return element;
        });

        spyOn(document, 'getElementsByTagName').and.callFake((tagName: string) => {
            const element = document.createElement(tagName);
            const containsMock = {
                [milestoneCreationSlotsSelector]: false,
            };

            spyOn(element, 'contains').and.returnValue(containsMock[tagName]);

            return [element];
        });

        comp.handleEnableAddMilestone();
        document.dispatchEvent(touchEndEvent);

        expect(comp.enableMilestoneCreation).toBeFalsy();
    });

    it('should not disable milestone creation slots when user clicks inside the creation slots', () => {
        spyOn(document, 'getElementById').and.callFake((id: string) => {
            const element = document.createElement('div');
            const containsMock = {
                [flyoutSelector]: false,
            };

            spyOn(element, 'contains').and.returnValue(containsMock[id]);

            return element;
        });

        spyOn(document, 'getElementsByTagName').and.callFake((tagName: string) => {
            const element = document.createElement(tagName);
            const containsMock = {
                [milestoneCreationSlotsSelector]: true,
            };

            spyOn(element, 'contains').and.returnValue(containsMock[tagName]);

            return [element];
        });

        comp.handleEnableAddMilestone();
        document.dispatchEvent(mouseUpEvent);

        expect(comp.enableMilestoneCreation).toBeTruthy();
    });

    it('should not disable milestone creation slots when user touches inside the creation slots', () => {
        spyOn(document, 'getElementById').and.callFake((id: string) => {
            const element = document.createElement('div');
            const containsMock = {
                [flyoutSelector]: false,
            };

            spyOn(element, 'contains').and.returnValue(containsMock[id]);

            return element;
        });

        spyOn(document, 'getElementsByTagName').and.callFake((tagName: string) => {
            const element = document.createElement(tagName);
            const containsMock = {
                [milestoneCreationSlotsSelector]: true,
            };

            spyOn(element, 'contains').and.returnValue(containsMock[tagName]);

            return [element];
        });

        comp.handleEnableAddMilestone();
        document.dispatchEvent(touchEndEvent);

        expect(comp.enableMilestoneCreation).toBeTruthy();
    });

    it('should not disable milestone creation slots when user clicks inside a flyout', () => {
        spyOn(document, 'getElementById').and.callFake((id: string) => {
            const element = document.createElement('div');
            const containsMock = {
                [flyoutSelector]: true,
            };

            spyOn(element, 'contains').and.returnValue(containsMock[id]);

            return element;
        });

        spyOn(document, 'getElementsByTagName').and.callFake((tagName: string) => {
            const element = document.createElement(tagName);
            const containsMock = {
                [milestoneCreationSlotsSelector]: false,
            };

            spyOn(element, 'contains').and.returnValue(containsMock[tagName]);

            return [element];
        });

        comp.handleEnableAddMilestone();
        document.dispatchEvent(mouseUpEvent);

        expect(comp.enableMilestoneCreation).toBeTruthy();
    });

    it('should not disable milestone creation slots when user touches inside a flyout', () => {
        spyOn(document, 'getElementById').and.callFake((id: string) => {
            const element = document.createElement('div');
            const containsMock = {
                [flyoutSelector]: true,
            };

            spyOn(element, 'contains').and.returnValue(containsMock[id]);

            return element;
        });

        spyOn(document, 'getElementsByTagName').and.callFake((tagName: string) => {
            const element = document.createElement(tagName);
            const containsMock = {
                [milestoneCreationSlotsSelector]: false,
            };

            spyOn(element, 'contains').and.returnValue(containsMock[tagName]);

            return [element];
        });

        comp.handleEnableAddMilestone();
        document.dispatchEvent(touchEndEvent);

        expect(comp.enableMilestoneCreation).toBeTruthy();
    });

    it('should dispatch MilestoneActions.CreateOne action when handleAddMilestone is called', () => {
        const payload = new SaveMilestoneResource(
            MOCK_PROJECT_1.id,
            'Milestone 1',
            MilestoneTypeEnum.Project,
            startDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            true,
        );
        const action = new MilestoneActions.Create.One(payload);

        spyOn(store, 'dispatch').and.callThrough();
        comp.handleEnableAddMilestone();
        comp.handleAddMilestone(payload);

        expect(comp.enableMilestoneCreation).toBeTruthy();
        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should group milestones by workArea and header when observeMilestoneList emits', () => {
        const expectedResult: CalendarMilestones<Milestone> = {
            header: [MOCK_MILESTONE_HEADER],
            'no-row': [MOCK_MILESTONE_CRAFT],
            [MOCK_MILESTONE_WORKAREA.workArea.id]: [MOCK_MILESTONE_WORKAREA, MOCK_MILESTONE_WITHOUT_PERMISSIONS],
        };

        expect(comp.calendarMilestones).toEqual(expectedResult);
    });

    it('should dispatch action to set focus of a milestone when handleSelectMilestone is called', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const milestoneObject = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId);
        const expectedResult = new CalendarScopeActions.Set.Focus(milestoneObject);

        spyOn(store, 'dispatch').and.callThrough();

        comp.handleSelectMilestone(milestoneId);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch action to unset focus when calling handleSelectMilestone and calendarSelectionEnabled is set to FALSE and ' +
        'focusedMilestoneId is the same as the current one', () => {
        const focusedMilestoneId = MOCK_MILESTONE_HEADER.id;
        const expectedResult = new CalendarScopeActions.Set.Focus(null);

        comp.handleSelectMilestone(focusedMilestoneId);

        spyOn(store, 'dispatch').and.callThrough();

        comp.focusedMilestoneId = focusedMilestoneId;
        comp.calendarSelectionEnabled = false;

        comp.handleSelectMilestone(focusedMilestoneId);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should not dispatch action to unset focus when calling handleSelectMilestone and calendarSelectionEnabled is set to TRUE and ' +
        'focusedMilestoneId is the same as the current one', () => {
        const focusedMilestoneId = MOCK_MILESTONE_HEADER.id;

        comp.handleSelectMilestone(focusedMilestoneId);

        spyOn(store, 'dispatch').and.callThrough();

        comp.calendarSelectionEnabled = true;

        comp.focusedMilestoneId = focusedMilestoneId;
        comp.handleSelectMilestone(focusedMilestoneId);

        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch action to unset focus when calling handleSelectMilestone and calendarSelectionEnabled is set to TRUE and ' +
        'focusedMilestoneId is different from the current one', () => {
        const focusedMilestoneId = MOCK_MILESTONE_HEADER.id;
        const nextFocusedMilestoneId = MOCK_MILESTONE_WORKAREA.id;

        comp.handleSelectMilestone(focusedMilestoneId);

        spyOn(store, 'dispatch').and.callThrough();

        comp.focusedMilestoneId = focusedMilestoneId;
        comp.calendarSelectionEnabled = true;

        comp.handleSelectMilestone(nextFocusedMilestoneId);

        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should set new focus milestone when calling handleSelectMilestone and calendarSelectionEnabled is set to FALSE and ' +
        'focusedMilestoneId is different from the current one', () => {
        const focusedMilestoneId = MOCK_MILESTONE_HEADER.id;
        const nextFocusedMilestoneId = MOCK_MILESTONE_WORKAREA.id;
        const milestoneObject = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, nextFocusedMilestoneId);
        const expectedResult = new CalendarScopeActions.Set.Focus(milestoneObject);

        comp.calendarSelectionEnabled = false;
        comp.focusedMilestoneId = focusedMilestoneId;

        spyOn(store, 'dispatch').and.callThrough();

        comp.handleSelectMilestone(nextFocusedMilestoneId);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should not set new focus milestone when calling handleSelectMilestone and calendarSelectionEnabled is set to TRUE and ' +
        'focusedMilestoneId is different from the current one', () => {
        const focusedMilestoneId = MOCK_MILESTONE_HEADER.id;
        const nextFocusedMilestoneId = MOCK_MILESTONE_WORKAREA.id;
        const milestoneObject = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, nextFocusedMilestoneId);
        const expectedResult = new CalendarScopeActions.Set.Focus(milestoneObject);

        comp.calendarSelectionEnabled = true;
        comp.focusedMilestoneId = focusedMilestoneId;

        spyOn(store, 'dispatch').and.callThrough();

        comp.handleSelectMilestone(nextFocusedMilestoneId);

        expect(store.dispatch).not.toHaveBeenCalledWith(expectedResult);
    });

    it('should not call triggerResize when a task is open after a milestone', () => {
        spyOn(resizeHelper, 'triggerResize').and.callThrough();
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const taskId = MOCK_TASK_4.id;

        comp.handleSelectMilestone(milestoneId);

        expect(resizeHelper.triggerResize).not.toHaveBeenCalled();

        comp.handleSelectTask(taskId);

        expect(resizeHelper.triggerResize).not.toHaveBeenCalled();
    });

    it('should not call triggerResize when a milestone is open after a task', () => {
        spyOn(resizeHelper, 'triggerResize').and.callThrough();
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const taskId = MOCK_TASK_4.id;

        comp.handleSelectTask(taskId);

        expect(resizeHelper.triggerResize).not.toHaveBeenCalled();

        comp.handleSelectMilestone(milestoneId);

        expect(resizeHelper.triggerResize).not.toHaveBeenCalled();
    });

    it('should toggle task filter drawer open state when handleToggleFilterDrawer is called twice', () => {
        spyOn(drawerService, 'open').and.callThrough();
        spyOn(drawerService, 'close').and.callThrough();

        comp.handleToggleFilterDrawer();

        expect(comp.isFilterDrawerOpen).toBeTruthy();

        expect(drawerService.open).toHaveBeenCalled();
        expect(drawerService.open).toHaveBeenCalledWith(
            ProjectFilterDrawerComponent,
            ProjectFiltersCaptureContextEnum.Calendar,
        );

        comp.handleToggleFilterDrawer();

        expect(comp.isFilterDrawerOpen).toBeFalsy();
        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should not call triggerResize when task filter drawer is open after a task', () => {
        spyOn(resizeHelper, 'triggerResize').and.callThrough();
        const taskId = MOCK_TASK_4.id;

        comp.handleSelectTask(taskId);

        expect(resizeHelper.triggerResize).not.toHaveBeenCalled();

        comp.handleToggleFilterDrawer();

        expect(resizeHelper.triggerResize).not.toHaveBeenCalled();
    });

    it('should not call triggerResize when task filter drawer is open after a milestone', () => {
        spyOn(resizeHelper, 'triggerResize').and.callThrough();
        const milestoneId = MOCK_MILESTONE_HEADER.id;

        comp.handleSelectMilestone(milestoneId);

        expect(resizeHelper.triggerResize).not.toHaveBeenCalled();

        comp.handleToggleFilterDrawer();

        expect(resizeHelper.triggerResize).not.toHaveBeenCalled();
    });

    it('should unset the focus when filter drawer is opened', () => {
        const expectedResult = new CalendarScopeActions.Set.Focus(null);

        spyOn(store, 'dispatch');
        comp.handleToggleFilterDrawer();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should set hasFiltersApplied to true when there are task filters applied and not milestone filters', () => {
        comp.hasFiltersApplied = false;

        when(projectTaskQueries.hasCalendarFiltersApplied()).thenReturn(of(true));
        when(milestoneQueries.observeHasFiltersApplied()).thenReturn(of(false));
        comp.ngOnInit();

        expect(comp.hasFiltersApplied).toBeTruthy();
    });

    it('should set hasFiltersApplied to true when there are milestone filters applied and not task filters', () => {
        comp.hasFiltersApplied = false;

        when(projectTaskQueries.hasCalendarFiltersApplied()).thenReturn(of(false));
        when(milestoneQueries.observeHasFiltersApplied()).thenReturn(of(true));
        comp.ngOnInit();

        expect(comp.hasFiltersApplied).toBeTruthy();
    });

    it('should set hasFiltersApplied to true when there are both milestone and task filters applied', () => {
        comp.hasFiltersApplied = false;

        when(projectTaskQueries.hasCalendarFiltersApplied()).thenReturn(of(true));
        when(milestoneQueries.observeHasFiltersApplied()).thenReturn(of(true));
        comp.ngOnInit();

        expect(comp.hasFiltersApplied).toBeTruthy();
    });

    it('should set hasFiltersApplied to false when there are no task and milestone filters applied', () => {
        comp.hasFiltersApplied = true;

        when(projectTaskQueries.hasCalendarFiltersApplied()).thenReturn(of(false));
        when(milestoneQueries.observeHasFiltersApplied()).thenReturn(of(false));
        comp.ngOnInit();

        expect(comp.hasFiltersApplied).toBeFalsy();
    });

    it('should allow move when user has permission to update the Milestone', () => {
        expect(comp.canMoveMilestoneFunction(MOCK_MILESTONE_HEADER.id)).toBeTruthy();
    });

    it('should not allow move when user hasn\'t permission to update the Milestone', () => {
        const milestoneWithoutUpdatePermission: Milestone = {
            ...MOCK_MILESTONE_HEADER,
            permissions: {
                ...MOCK_MILESTONE_HEADER.permissions,
                canUpdate: false,
            },
        };

        when(milestoneQueries.observeMilestoneListByMilestoneFilters()).thenReturn(of([milestoneWithoutUpdatePermission]));
        comp.ngOnInit();

        expect(comp.canMoveMilestoneFunction(milestoneWithoutUpdatePermission.id)).toBeFalsy();
    });

    it('should dispatch MilestoneActions.Update.One action when handleMoveMilestone is called', () => {
        spyOn(store, 'dispatch').and.callThrough();

        const milestone = MOCK_MILESTONE_WORKAREA;
        const {id, version} = milestone;
        const moveMilestonePayloads: MoveMilestonePayload = {
            id,
            date: moment('2020-03-20'),
            rowId: 'header',
            position: 4,
        };
        const {date, rowId, position} = moveMilestonePayloads;
        const saveMilestoneResource = SaveMilestoneResource.fromMilestone(milestone)
            .withDate(date)
            .withLocation(rowId)
            .withPosition(position);
        const action = new MilestoneActions.Update.One(id, saveMilestoneResource, version);

        comp.handleMoveMilestone(moveMilestonePayloads);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should toggle task quick filter drawer open state when handleToggleQuickFilterDrawer is called twice', () => {
        spyOn(drawerService, 'open').and.callThrough();
        spyOn(drawerService, 'close').and.callThrough();

        comp.handleToggleQuickFilterDrawer();

        expect(comp.isQuickFilterDrawerOpen).toBeTruthy();

        expect(drawerService.open).toHaveBeenCalledWith(
            QuickFilterDrawerComponent,
            'calendar',
        );

        comp.handleToggleQuickFilterDrawer();

        expect(comp.isQuickFilterDrawerOpen).toBeFalsy();
        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should unset the focus when quick filter drawer is opened', () => {
        const expectedResult = new CalendarScopeActions.Set.Focus(null);

        spyOn(store, 'dispatch');
        comp.handleToggleQuickFilterDrawer();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should toggle reschedule drawer open state when handleRescheduleFilterDrawer is called twice', () => {
        spyOn(drawerService, 'open').and.callThrough();
        spyOn(drawerService, 'close').and.callThrough();

        comp.handleRescheduleFilterDrawer();

        expect(comp.isRescheduleDrawerOpen).toBeTruthy();

        expect(drawerService.open).toHaveBeenCalledWith(ProjectRescheduleDrawerComponent);

        comp.handleRescheduleFilterDrawer();

        expect(comp.isRescheduleDrawerOpen).toBeFalsy();
        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should unset the focus when reschedule drawer is opened', () => {
        const expectedResult = new CalendarScopeActions.Set.Focus(null);

        spyOn(store, 'dispatch');
        comp.handleRescheduleFilterDrawer();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should reset the tasks and milestone filters when reschedule drawer is opened', () => {
        spyOn(store, 'dispatch').and.callThrough();

        comp.handleRescheduleFilterDrawer();

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Set.CalendarFilters(new ProjectTaskFilters()));
        expect(store.dispatch).toHaveBeenCalledWith(new MilestoneActions.Set.Filters(new MilestoneFilters()));
    });

    it('should reset the calendar selection when reschedule drawer is opened', () => {
        spyOn(store, 'dispatch').and.callThrough();

        comp.handleRescheduleFilterDrawer();

        expect(store.dispatch).toHaveBeenCalledWith(new CalendarSelectionActions.Initialize.All());
    });

    it('should handle the start date changes to the scope parameters', () => {
        spyOn(store, 'dispatch').and.callThrough();

        const nextParameters: CalendarScopeParameters = {
            start: startDate.clone().subtract(10, 'd'),
            mode: TasksCalendarModeEnum.SixWeeks,
        };

        when(calendarScopeQueries.observeCalendarScopeParameters()).thenReturn(of(nextParameters));

        const action = new CalendarScopeActions.Set.ScopeParameters(nextParameters);

        comp.handleScopeStartChange(nextParameters.start);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should call calendar scrollTo for the left side when handleTodayButtonClicked is called', () => {
        const expectedPoint: Point = {x: 0, y: undefined};

        comp.handleTodayButtonClicked();

        expect(comp.calendar.scrollTo).toHaveBeenCalledWith(expectedPoint);
    });

    it('should return false when isTaskDimmedOutFunction is called for a task that is highlighted', () => {
        const taskId = MOCK_TASK_2.id;
        taskCalendarFilters.highlight = true;

        when(projectTaskQueries.observeCalendarFilters()).thenReturn(of(taskCalendarFilters));
        when(taskFiltersHelperMock.matchTask(MOCK_TASK_2, taskCalendarFilters.criteria)).thenReturn(true);
        comp.ngOnInit();

        expect(comp.isTaskDimmedOutFunction(taskId)).toBeFalsy();
        expect(comp.highlightTasks).toBeTruthy();
    });

    it('should return true when isTaskDimmedOutFunction is called and the task filters have useCriteria set to false', () => {
        const taskId = MOCK_TASK_2.id;
        taskCalendarFilters.highlight = true;
        taskCalendarFilters.useCriteria = false;

        when(projectTaskQueries.observeCalendarFilters()).thenReturn(of(taskCalendarFilters));
        comp.ngOnInit();

        expect(comp.isTaskDimmedOutFunction(taskId)).toBeTruthy();
    });

    it('should return true when isTaskDimmedOutFunction is called for a task that is not highlighted', () => {
        const taskId = MOCK_TASK_2.id;
        taskCalendarFilters.highlight = true;
        taskCalendarFilters.useCriteria = true;
        taskCalendarFilters.criteria.status = [TaskStatusEnum.CLOSED];

        when(projectTaskQueries.observeCalendarFilters()).thenReturn(of(taskCalendarFilters));
        when(taskFiltersHelperMock.matchTask(MOCK_TASK_2, taskCalendarFilters.criteria)).thenReturn(false);
        comp.ngOnInit();

        expect(comp.isTaskDimmedOutFunction(taskId)).toBeTruthy();
        expect(comp.highlightTasks).toBeTruthy();
    });

    it('should return false when isTaskDimmedOutFunction is called for a task that is subtask of the current focused milestone', () => {
        const milestoneId = relations[0].target.id;
        const taskId = relations[0].source.id;

        comp.handleSelectMilestone(milestoneId);
        milestoneSubtasksSubject.next(relations);

        expect(comp.isTaskDimmedOutFunction(taskId)).toBeFalsy();
    });

    it('should return true when isTaskDimmedOutFunction is called for a task that is not a subtask of the current focused milestone ' +
        'and that milestone has subtasks', () => {
        const milestoneId = relations[0].target.id;
        const taskId = 'abcd';

        setFocusedMilestone(milestoneId);
        milestoneSubtasksSubject.next(relations);

        expect(comp.isTaskDimmedOutFunction(taskId)).toBeTruthy();
    });

    it('should return false when isTaskDimmedOutFunction is called for a task that is not highlighted by the filters' +
        ' but is a subtask of the current focused milestone', () => {
        const milestoneId = relations[0].target.id;
        const taskId = MOCK_TASK_2.id;
        const relationsWithDimmedOutTask: RelationResource[] = [{
            ...MOCK_RELATION_RESOURCE_1,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId),
        }];

        taskCalendarFilters.highlight = true;
        taskCalendarFilters.useCriteria = true;
        taskCalendarFilters.criteria.status = [TaskStatusEnum.CLOSED];

        when(projectTaskQueries.observeCalendarFilters()).thenReturn(of(taskCalendarFilters));
        when(taskFiltersHelperMock.matchTask(MOCK_TASK_2, taskCalendarFilters.criteria)).thenReturn(true);
        comp.ngOnInit();

        setFocusedMilestone(milestoneId);
        milestoneSubtasksSubject.next(relationsWithDimmedOutTask);

        expect(comp.isTaskDimmedOutFunction(taskId)).toBeFalsy();
    });

    it('should set the background-color of the placeholders to grey when the highlight filter results is enabled', () => {
        taskCalendarFilters.highlight = true;

        when(projectTaskQueries.observeCalendarFilters()).thenReturn(of(taskCalendarFilters));
        comp.ngOnInit();

        Object.values(comp.taskStyles).forEach(styles => {
            expect(styles['background-color']).toBe(COLORS.light_grey_50);
        });
    });

    it('should close the opened drawer when ngOnDestroy is called', () => {
        spyOn(drawerService, 'close').and.callThrough();

        comp.ngOnDestroy();

        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should dispatch a CalendarActions.Request.UserSettings action on init', () => {
        spyOn(store, 'dispatch').and.callThrough();

        const action = new CalendarActions.Request.UserSettings();
        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch CalendarSelectionActions.Initialize.All when a milestone is focused', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const expectedAction = new CalendarSelectionActions.Initialize.All();

        spyOn(store, 'dispatch').and.callThrough();
        spyOn(drawerService, 'open').and.callThrough();

        setFocusedMilestone(milestoneId);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        expect(drawerService.open).toHaveBeenCalledWith(MilestoneDetailDrawerComponent, milestoneId);
    });

    it('should change reference of selectedTaskIds when calendar selection slice changes', () => {
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };
        const calendarSelectionSliceInitialState: CalendarSelectionSlice = CALENDAR_SELECTION_SLICE_INITIAL_STATE;
        let selectedIds = comp.selectedTaskIds;

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        expect(comp.calendarSelectionEnabled).toBeTruthy();
        expect(comp.selectedTaskIds).not.toBe(selectedIds);
        expect(comp.selectedTaskIds).toEqual(selectedIds);

        selectedIds = comp.selectedTaskIds;

        calendarSelectionSliceSubject.next(calendarSelectionSliceInitialState);

        expect(comp.calendarSelectionEnabled).toBeFalsy();
        expect(comp.selectedTaskIds).not.toBe(selectedIds);
        expect(comp.selectedTaskIds).toEqual(selectedIds);
    });

    it('should dispatch CalendarSelectionActions.Initialize.All when ESC key is pressed, ' +
        'calendarSelectionEnabled is TRUE and calendar selection context is null', () => {
        const expectedResult = new CalendarSelectionActions.Initialize.All();
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        comp.calendarSelectionEnabled = true;
        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        spyOn(store, 'dispatch').and.callThrough();

        sendKeyUp(KeyEnum.Escape);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should not dispatch ProjectTaskActions.Initialize.CalendarSelection when ESC key is pressed, ' +
        'calendarSelectionEnabled is TRUE and calendar selection context is RESCHEDULE', () => {
        const notExpectedResult = new CalendarSelectionActions.Initialize.All();
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Reschedule,
            isMultiSelecting: true,
        };

        comp.calendarSelectionEnabled = true;
        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        spyOn(store, 'dispatch').and.callThrough();

        sendKeyUp(KeyEnum.Escape);

        expect(store.dispatch).not.toHaveBeenCalledWith(notExpectedResult);
    });

    it('should not dispatch ProjectTaskActions.Initialize.CalendarSelection when ESC key is pressed and ' +
        'calendarSelectionEnabled is FALSE', () => {
        const notExpectedResult = new CalendarSelectionActions.Initialize.All();

        comp.calendarSelectionEnabled = false;

        spyOn(store, 'dispatch').and.callThrough();

        sendKeyUp(KeyEnum.Escape);

        expect(store.dispatch).not.toHaveBeenCalledWith(notExpectedResult);
    });

    it('should dispatch CalendarSelectionActions.Initialize.All upon milestone drawer close event and ' +
        'calendarSelectionEnabled is TRUE and calendar selection context is not null', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const expectedResult = new CalendarSelectionActions.Initialize.All();
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedMilestone(milestoneId);

        comp.calendarSelectionEnabled = true;
        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        spyOn(store, 'dispatch').and.callThrough();

        drawerService.close();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should not dispatch ProjectTaskActions.Initialize.CalendarSelection upon milestone drawer close event and ' +
        'calendarSelectionEnabled is FALSE and calendar selection context is null', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const notExpectedResult = new CalendarSelectionActions.Initialize.All();
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        comp.calendarSelectionEnabled = false;
        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        setFocusedMilestone(milestoneId);

        spyOn(store, 'dispatch').and.callThrough();

        drawerService.close();

        expect(store.dispatch).not.toHaveBeenCalledWith(notExpectedResult);
    });

    it('should dispatch CalendarSelectionActions.Initialize.All upon task drawer close event and ' +
        'calendarSelectionEnabled is TRUE and calendar selection context is not null', () => {
        const taskId = MOCK_TASK_4.id;
        const expectedResult = new CalendarSelectionActions.Initialize.All();
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Dependencies,
            isMultiSelecting: true,
        };

        setFocusedTask(taskId);

        comp.calendarSelectionEnabled = true;
        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        spyOn(store, 'dispatch').and.callThrough();

        drawerService.close();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should not dispatch CalendarSelectionActions.Initialize.All upon task drawer close event and ' +
        'calendarSelectionEnabled is FALSE calendar selection context is null', () => {
        const taskId = MOCK_TASK_4.id;
        const notExpectedResult = new CalendarSelectionActions.Initialize.All();
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        setFocusedTask(taskId);

        comp.calendarSelectionEnabled = false;
        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        spyOn(store, 'dispatch').and.callThrough();

        drawerService.close();

        expect(store.dispatch).not.toHaveBeenCalledWith(notExpectedResult);
    });

    it('should set calendarSelectionEnabled to TRUE when calendar selection is multi selecting is true', () => {
        const calendarSelectionSliceNextState: CalendarSelectionSlice = CALENDAR_SELECTION_SLICE_INITIAL_STATE;
        const calendarSelectionSliceNextStateIsMultiSelecting: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        expect(comp.calendarSelectionEnabled).toBeFalsy();

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextStateIsMultiSelecting);

        expect(comp.calendarSelectionEnabled).toBeTruthy();
    });

    it('should set calendarSelectionEnabled to FALSE when calendar selection is multi selecting is false', () => {
        const calendarSelectionSliceNextState: CalendarSelectionSlice = CALENDAR_SELECTION_SLICE_INITIAL_STATE;

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        expect(comp.calendarSelectionEnabled).toBeFalsy();
    });

    it('should set the correct calendar dependencies', () => {
        expect(comp.calendarDependencies).toEqual([]);

        criticalRelationsSubject.next(criticalRelations);
        expect(comp.calendarDependencies).toEqual(criticalRelations);
    });

    it('should set the correct calendar dependencies when calendar user settings show dependency lines is active', () => {
        when(calendarQueries.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingsEnabled));
        comp.ngOnInit();

        finishToStartRelationsSubject.next(finishToStartRelations);

        expect(comp.calendarDependencies).toEqual(finishToStartRelations);
    });

    it('should set the correct calendar dependencies if calendar user settings show dependency lines is not active', () => {
        when(calendarQueries.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingsDisabled));
        comp.ngOnInit();

        criticalRelationsSubject.next(criticalRelations);

        expect(comp.calendarDependencies).toEqual(criticalRelations);
    });

    it('should set the correct calendar dependencies when a task is focused and unfocused', () => {
        const taskId = 'foo';
        const taskSuccessorRelations: RelationResource[] =
            [{...MOCK_RELATION_RESOURCE_2, source: new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId)}];
        const taskPredecessorRelations: RelationResource[] =
            [{...MOCK_RELATION_RESOURCE_1, source: new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId)}];
        const taskRelations = [...taskSuccessorRelations, ...taskPredecessorRelations];
        const expectedFocusedRelations: RelationResource[] = uniqBy([...criticalRelations, ...taskRelations], (relation) => relation.id);
        const drawerServiceAfterCloseSubject = new Subject<void>();

        criticalRelationsSubject.next(criticalRelations);
        expect(comp.calendarDependencies).toEqual(criticalRelations);

        spyOn(drawerService, 'open').and.returnValue({afterClosed: () => drawerServiceAfterCloseSubject});

        setFocusedTask(taskId);

        taskSuccessorRelationsSubject.next(taskSuccessorRelations);
        taskPredecessorRelationsSubject.next(taskPredecessorRelations);
        expect(comp.calendarDependencies).toEqual(expectedFocusedRelations);

        drawerServiceAfterCloseSubject.next();
        expect(comp.calendarDependencies).toEqual(criticalRelations);
    });

    it('should set the correct calendar dependencies when a milestone is focused and unfocused', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const milestoneSuccessorRelations: RelationResource[] =
            [{...MOCK_RELATION_RESOURCE_2, source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId)}];
        const milestonePredecessorRelations: RelationResource[] =
            [{...MOCK_RELATION_RESOURCE_1, source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId)}];
        const milestoneRelations = [...milestoneSuccessorRelations, ...milestonePredecessorRelations];
        const expectedFocusedRelations: RelationResource[] =
            uniqBy([...criticalRelations, ...milestoneRelations], (relation) => relation.id);
        const drawerServiceAfterCloseSubject = new Subject<void>();

        criticalRelationsSubject.next(criticalRelations);
        expect(comp.calendarDependencies).toEqual(criticalRelations);

        spyOn(drawerService, 'open').and.returnValue({afterClosed: () => drawerServiceAfterCloseSubject});

        setFocusedMilestone(milestoneId);

        milestoneSuccessorRelationsSubject.next(milestoneSuccessorRelations);
        milestonePredecessorRelationsSubject.next(milestonePredecessorRelations);
        expect(comp.calendarDependencies).toEqual(expectedFocusedRelations);

        drawerServiceAfterCloseSubject.next();
        expect(comp.calendarDependencies).toEqual(criticalRelations);
    });

    it(`should set dependency relations`, () => {
        when(calendarQueries.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingsEnabled));
        comp.ngOnInit();

        finishToStartRelationsSubject.next(finishToStartRelations);

        expect(comp.calendarDependencies).toEqual(finishToStartRelations);
    });

    it('should get source milestone anchor point', () => {
        const milestoneId = 'milestone-id';

        comp.sourceAnchorPointByObjectType[ObjectTypeEnum.Milestone](milestoneId);

        expect(milestoneAnchor.source).toHaveBeenCalledWith(milestoneId);
    });

    it('should get target milestone anchor point', () => {
        const milestoneId = 'milestone-id';

        comp.targetAnchorPointByObjectType[ObjectTypeEnum.Milestone](milestoneId);

        expect(milestoneAnchor.target).toHaveBeenCalledWith(milestoneId);
    });

    it('should get source task anchor point', () => {
        const taskId = 'task-id';

        comp.sourceAnchorPointByObjectType[ObjectTypeEnum.Task](taskId);

        expect(taskCardWeekAnchor.source).toHaveBeenCalledWith(taskId, TASK_ANCHOR_POINT_CONTEXT_SELECTOR);
    });

    it('should get target task anchor point', () => {
        const taskId = 'task-id';

        comp.targetAnchorPointByObjectType[ObjectTypeEnum.Task](taskId);

        expect(taskCardWeekAnchor.target).toHaveBeenCalledWith(taskId, TASK_ANCHOR_POINT_CONTEXT_SELECTOR);
    });

    it('should get source task placeholder anchor point', () => {
        const taskId = 'task-id';

        taskCardWeekAnchor.source.and.returnValue(null);
        comp.sourceAnchorPointByObjectType[ObjectTypeEnum.Task](taskId);

        expect(taskCardWeekPlaceholderAnchor.source).toHaveBeenCalledWith(taskId);
    });

    it('should get target task placeholder anchor point', () => {
        const taskId = 'task-id';

        taskCardWeekAnchor.target.and.returnValue(null);
        comp.targetAnchorPointByObjectType[ObjectTypeEnum.Task](taskId);

        expect(taskCardWeekPlaceholderAnchor.target).toHaveBeenCalledWith(taskId);
    });

    it('should set isResizing to TRUE when handleIsResizingTaskCard is called with TRUE', () => {
        expect(comp.isResizingTaskCard).toBeFalsy();

        comp.handleIsResizingTaskCard(true);

        expect(comp.isResizingTaskCard).toBeTruthy();
    });

    it('should set isResizing to FALSE when handleIsResizingTaskCard is called with FALSE', () => {
        expect(comp.isResizingTaskCard).toBeFalsy();

        comp.handleIsResizingTaskCard(false);

        expect(comp.isResizingTaskCard).toBeFalsy();
    });

    it('should parse calendar dependencies days difference for relations source and targets that ' +
        'do not exist on the current context', () => {
        const relationNotInContext: RelationResource[] = [
            {
                ...MOCK_RELATION_RESOURCE_1,
                target: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'task-not-in-scope-1'),
                source: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'task-not-in-scope-2'),
            },
            {
                ...MOCK_RELATION_RESOURCE_2,
                target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'milestone-not-in-scope-1'),
                source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'milestone-not-in-scope-2'),
            },
            {
                ...MOCK_RELATION_RESOURCE_3,
                target: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'task-not-in-scope-1'),
                source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'milestone-not-in-scope-2'),
            },
        ];
        const expectedResult: CalendarDependency[] = relationNotInContext;

        when(calendarQueries.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingsEnabled));
        comp.ngOnInit();
        finishToStartRelationsSubject.next(relationNotInContext);

        expect(comp.calendarDependencies).toEqual(expectedResult);
    });

    it('should open task drawer when focus change', () => {
        const taskId = 'foo';
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId);

        spyOn(drawerService, 'open').and.callThrough();

        focusSubject.next(taskObject);

        expect(drawerService.open).toHaveBeenCalledWith(TasksDetailDrawerComponent, taskId);
    });

    it('should open milestone drawer when focus change', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const milestoneObject = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId);

        spyOn(drawerService, 'open').and.callThrough();

        focusSubject.next(milestoneObject);

        expect(drawerService.open).toHaveBeenCalledWith(MilestoneDetailDrawerComponent, milestoneId);
    });

    it('should close any open drawer when focus change for a NULL value', () => {
        spyOn(drawerService, 'close').and.callThrough();

        focusSubject.next(null);

        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should unset focus when task drawer is closed', () => {
        const taskId = 'foo';
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId);
        const expectedResult = new CalendarScopeActions.Set.Focus(null);

        spyOn(drawerService, 'close').and.callThrough();
        spyOn(store, 'dispatch').and.callThrough();

        focusSubject.next(taskObject);
        drawerService.close();

        expect(drawerService.close).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should unset focus when milestone drawer is closed', () => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const milestoneObject = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId);
        const expectedResult = new CalendarScopeActions.Set.Focus(null);

        spyOn(drawerService, 'close').and.callThrough();
        spyOn(store, 'dispatch').and.callThrough();

        focusSubject.next(milestoneObject);
        drawerService.close();

        expect(drawerService.close).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should set expanded weeks', () => {
        const newExpandedWeeks = [moment().startOf('week')];

        expect(comp.expandedWeeks).toEqual([]);

        expandedWeeksSubject.next(newExpandedWeeks);

        expect(comp.expandedWeeks).toEqual(newExpandedWeeks);
    });

    it('should set mode', () => {
        const mode = TasksCalendarModeEnum.EighteenWeeks;
        const start = moment().startOf('week');
        const newScope: CalendarScopeParameters = {start, mode};

        expect(comp.selectedMode).toBe(TasksCalendarModeEnum.SixWeeks);

        calendarScopeParametersSubject.next(newScope);

        expect(comp.selectedMode).toBe(TasksCalendarModeEnum.EighteenWeeks);
    });

    it('should update calendarNavigateToElement for a Task', fakeAsync(() => {
        const taskId = 'foo';
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId);
        const expectedResult = {cardId: taskId};

        expect(comp.calendarNavigateToElement).toBeUndefined();

        navigateToElementSubject.next(taskObject);

        tick(TASKS_CALENDAR_WAIT_FOR_CALENDAR_RENDERING_BEFORE_NAVIGATE_DELAY);

        expect(comp.calendarNavigateToElement).toEqual(expectedResult);
    }));

    it('should update calendarNavigateToElement for a Milestone', fakeAsync(() => {
        const milestoneId = 'foo';
        const milestoneObject = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId);
        const expectedResult = {milestoneId};

        expect(comp.calendarNavigateToElement).toBeUndefined();

        navigateToElementSubject.next(milestoneObject);

        tick(TASKS_CALENDAR_WAIT_FOR_CALENDAR_RENDERING_BEFORE_NAVIGATE_DELAY);

        expect(comp.calendarNavigateToElement).toEqual(expectedResult);
    }));

    it('should update calendarNavigateToElement for a Daycard', fakeAsync(() => {
        const daycardId = 'foo';
        const daycardObject = new ObjectIdentifierPair(ObjectTypeEnum.DayCard, daycardId);
        const week = moment(MOCK_DAY_CARD_A.date).startOf('week');
        const expectedResult = {week, cardId: daycardId};

        expect(comp.calendarNavigateToElement).toBeUndefined();

        when(dateParserStrategyMock.startOfWeek(anything())).thenReturn(week);

        navigateToElementSubject.next(daycardObject);

        tick(TASKS_CALENDAR_WAIT_FOR_CALENDAR_RENDERING_BEFORE_NAVIGATE_DELAY);

        expect(comp.calendarNavigateToElement).toEqual(expectedResult);
    }));

    it('should not set focusedDaycardId when handleNavigateToElementEnd is called and current focus is not a daycard', fakeAsync(() => {
        const milestoneId = MOCK_MILESTONE_HEADER.id;
        const milestoneObject = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId);
        const calendarNavigateToElement: CalendarNavigateToElement = {milestoneId};

        focusSubject.next(milestoneObject);
        comp.handleNavigateToElementEnd(calendarNavigateToElement);

        tick(TASKS_CALENDAR_WAIT_FOR_CALENDAR_NAVIGATE_FINISH_DELAY);

        expect(comp.focusedDaycardId).toBeUndefined();
    }));

    it('should set focusedDaycardId when handleNavigateToElementEnd is called and current focus is a daycard', fakeAsync(() => {
        const daycardId = 'foo';
        const daycardObject = new ObjectIdentifierPair(ObjectTypeEnum.DayCard, daycardId);
        const week = moment(MOCK_DAY_CARD_A.date).startOf('week');
        const calendarNavigateToElement: CalendarNavigateToElement = {week, cardId: daycardId};

        focusSubject.next(daycardObject);
        comp.handleNavigateToElementEnd(calendarNavigateToElement);

        tick(TASKS_CALENDAR_WAIT_FOR_CALENDAR_NAVIGATE_FINISH_DELAY);

        expect(comp.focusedDaycardId).toEqual(daycardId);
    }));

    it('should dispatch ProjectTaskActions.Set.CalendarFilters when handleResetFilters is called', () => {
        const expectedAction = new ProjectTaskActions.Set.CalendarFilters(new ProjectTaskFilters());
        spyOn(store, 'dispatch').and.callThrough();

        comp.handleResetFilters();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch MilestoneActions.Set.Filters when handleResetFilters is called', () => {
        const expectedAction = new MilestoneActions.Set.Filters(new MilestoneFilters());
        spyOn(store, 'dispatch').and.callThrough();

        comp.handleResetFilters();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should return false when isMilestoneDimmedOut is called and the milestone filters are not highlighted', () => {
        const milestoneFilters = new MilestoneFilters(new MilestoneFiltersCriteria(), true, false);

        milestoneFiltersSubject.next(milestoneFilters);

        expect(comp.isMilestoneDimmedOut(MOCK_MILESTONE_CRAFT.id)).toBeFalsy();
        expect(comp.highlightMilestones).toBeFalsy();
    });

    it('should return false when isMilestoneDimmedOut is called for a milestone that is highlighted', () => {
        const milestoneFilters = new MilestoneFilters(new MilestoneFiltersCriteria(), true, true);

        milestoneFiltersSubject.next(milestoneFilters);

        expect(comp.isMilestoneDimmedOut(MOCK_MILESTONE_CRAFT.id)).toBeFalsy();
        expect(comp.highlightMilestones).toBeTruthy();
    });

    it('should return true when isMilestoneDimmedOut is called for a milestone that is not highlighted', () => {
        const milestoneFilters = new MilestoneFilters(new MilestoneFiltersCriteria(), true, true);
        const {id, type} = MOCK_MILESTONE_CRAFT;

        milestoneFilters.criteria.types.types = [type];
        milestoneFiltersSubject.next(milestoneFilters);

        expect(comp.isMilestoneDimmedOut(id)).toBeTruthy();
        expect(comp.highlightMilestones).toBeTruthy();
    });

    it('should return true when isMilestoneDimmedOut is called and the milestone filters have useCriteria set to false', () => {
        const milestoneFilters = new MilestoneFilters(new MilestoneFiltersCriteria(), false, true);

        milestoneFiltersSubject.next(milestoneFilters);

        expect(comp.isMilestoneDimmedOut(MOCK_MILESTONE_CRAFT.id)).toBeTruthy();
    });

    it('should return true when isMilestoneDimmedOut is called and the calendar selection context is set to RESCHEDULE', () => {
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.Reschedule,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        expect(comp.isMilestoneDimmedOut(MOCK_MILESTONE_CRAFT.id)).toBeTruthy();
    });

    it('should return false when isMilestoneDimmedOut is called and the calendar selection context is not set to RESCHEDULE', () => {
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...CALENDAR_SELECTION_SLICE_INITIAL_STATE,
            context: CalendarSelectionContextEnum.TasksOfMilestones,
            isMultiSelecting: true,
        };

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);

        expect(comp.isMilestoneDimmedOut(MOCK_MILESTONE_CRAFT.id)).toBeFalsy();
    });

    it('should set working days list after ngOnInit', () => {
        const expectedResult = MOCK_WORK_DAYS.workingDays;

        comp.ngOnInit();

        expect(comp.workingDays).toEqual(expectedResult);
    });

    it('should set holidays list after ngOnInit', () => {
        const expectedResult = MOCK_WORK_DAYS.holidays;

        comp.ngOnInit();

        expect(comp.holidays).toEqual(expectedResult);
    });

    Object.keys(DRAWING_MODE_MAP).forEach(sortingMode => {
        const drawingStrategy: CalendarDrawingStrategy = DRAWING_MODE_MAP[sortingMode];

        it('should set the drawing strategy to "' + drawingStrategy + '" when observeCalendarUserSettings emits with "'
            + sortingMode + '" as sorting mode', () => {
            const settings = Object.assign(new CalendarUserSettings(), {sortingMode});

            when(calendarQueries.observeCalendarUserSettings()).thenReturn(of(settings));
            comp.ngOnInit();

            expect(comp.drawingStrategy).toBe(drawingStrategy);
        });
    });

    Object.keys(TASK_VIEW_MODE_MAP).forEach(taskViewMode => {
        const calendarRecordGridUnit: CalendarRecordGridUnit = TASK_VIEW_MODE_MAP[taskViewMode];

        it('should set the record grid unit to "' + calendarRecordGridUnit + '" when observeCalendarUserSettings emits with "'
            + taskViewMode + '" as task view mode', () => {
            const settings = Object.assign(new CalendarUserSettings(), {taskViewMode});

            when(calendarQueries.observeCalendarUserSettings()).thenReturn(of(settings));
            comp.ngOnInit();

            expect(comp.recordGridUnit).toBe(calendarRecordGridUnit);
        });
    });

    Object.keys(TASK_VIEW_MODE_SHIFT_UNIT_MAP).forEach(taskViewMode => {
        const shiftUnit: TaskShiftAmountUnit = TASK_VIEW_MODE_SHIFT_UNIT_MAP[taskViewMode];

        it('should set shift unit to "' + shiftUnit + '" when observeCalendarUserSettings emits with "'
            + taskViewMode + '" as task view mode', () => {
            const settings = Object.assign(new CalendarUserSettings(), {taskViewMode});

            when(calendarQueries.observeCalendarUserSettings()).thenReturn(of(settings));
            comp.ngOnInit();

            expect(comp.shiftUnit).toBe(shiftUnit);
        });
    });

    it('should set showUnreadNews with the correct value from Calendar user settings on initialization', () => {
        when(calendarQueries.observeCalendarUserSettings()).thenReturn(of(calendarUserSettingsEnabled));
        comp.ngOnInit();

        expect(comp.showUnreadNews).toEqual(calendarUserSettingsEnabled.showUnreadNews);
    });

    it('should open modal to create task when handleAddTask is called', () => {
        spyOn(modalService, 'open').and.callThrough();

        comp.handleAddTask();

        expect(modalService.open).toHaveBeenCalledWith({
            id: ModalIdEnum.CreateTask,
            data: {},
        });
        expect(comp.defaultValues).toBe(false);
    });

    it('should dispatch CalendarSelectionActions.Set.SelectionAction with Move when drag record has started and observed ' +
        'calendar selection action is null', () => {
        const action = new CalendarSelectionActions.Set.SelectionAction(CalendarSelectionActionEnum.Move);
        spyOn(store, 'dispatch').and.callThrough();

        calendarSelectionActionSubject$.next(null);
        comp.handleRecordDragStart();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should not dispatch CalendarSelectionActions.Set.SelectionAction with Move when drag record has started and observed ' +
        'calendar selection action is different than null', () => {
        spyOn(store, 'dispatch').and.callThrough();

        calendarSelectionActionSubject$.next(CalendarSelectionActionEnum.Move);
        comp.handleRecordDragStart();

        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should dispatch CalendarSelectionActions.Set.SelectionAction with Copy when copy modifier key is pressed', () => {
        const action = new CalendarSelectionActions.Set.SelectionAction(CalendarSelectionActionEnum.Copy);

        spyOn(store, 'dispatch').and.callThrough();

        copyKeyPressedState$.next(true);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch CalendarSelectionActions.Set.SelectionAction with null when copy modifier key is released', () => {
        const action = new CalendarSelectionActions.Set.SelectionAction(null);

        spyOn(store, 'dispatch').and.callThrough();

        copyKeyPressedState$.next(false);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });
});
