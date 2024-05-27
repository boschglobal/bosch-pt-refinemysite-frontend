/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    CdkDragEnd,
    CdkDragMove
} from '@angular/cdk/drag-drop';
import {
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
import {
    Action,
    Store
} from '@ngrx/store';
import {TranslateModule} from '@ngx-translate/core';
import * as moment from 'moment';
import {Moment} from 'moment';
import {
    BehaviorSubject,
    of,
    Subject
} from 'rxjs';
import {
    anything,
    deepEqual,
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    isElementPropertyColor,
    setEventKey,
} from '../../../../../test/helpers';
import {
    MOCK_DAY_CARD_A,
    MOCK_DAY_CARD_B
} from '../../../../../test/mocks/day-cards';
import {MOCK_NEWS_ITEMS} from '../../../../../test/mocks/news';
import {MOCK_RELATION_RESOURCE_2} from '../../../../../test/mocks/relations';
import {
    MOCK_TASK,
    MOCK_TASK_2,
} from '../../../../../test/mocks/tasks';
import {MOCK_WORK_DAYS} from '../../../../../test/mocks/workdays';
import {TimeScope} from '../../../../shared/misc/api/datatypes/time-scope.datatype';
import {KeyEnum} from '../../../../shared/misc/enums/key.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {SystemHelper} from '../../../../shared/misc/helpers/system.helper';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {CALENDAR_CONSTANTS} from '../../../../shared/ui/calendar/contants/calendar.contants';
import {DateParserStrategy} from '../../../../shared/ui/dates/date-parser.strategy';
import {FlyoutDirective} from '../../../../shared/ui/flyout/directive/flyout.directive';
import {FlyoutService} from '../../../../shared/ui/flyout/service/flyout.service';
import {CalendarUserSettings} from '../../api/calendar/resources/calendar-user-settings';
import {SaveDayCardResource} from '../../api/day-cards/resources/save-day-card.resource';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {TaskCalendarTaskViewModeEnum} from '../../enums/task-calendar-task-view-mode.enum';
import {TaskCardDescriptionTypeEnum} from '../../enums/task-card-description-type.enum';
import {ProjectDateParserStrategy} from '../../helpers/project-date-parser.strategy';
import {DayCard} from '../../models/day-cards/day-card';
import {Task} from '../../models/tasks/task';
import {TaskShiftAmountPipe} from '../../pipes/task-shift-amount/task-shift-amount.pipe';
import {CalendarQueries} from '../../store/calendar/calendar/calendar.queries';
import {DayCardActions} from '../../store/day-cards/day-card.actions';
import {DayCardQueries} from '../../store/day-cards/day-card.queries';
import {NewsQueries} from '../../store/news/news.queries';
import {RelationQueries} from '../../store/relations/relation.queries';
import {ProjectTaskActions} from '../../store/tasks/task.actions';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {WorkDaysQueries} from '../../store/work-days/work-days.queries';
import {DayCardMove} from '../task-daycards/task-daycards.component';
import {
    CSS_CLASS_CARD_COPYING,
    CSS_CLASS_CARD_DIMMED_OUT,
    CSS_CLASS_CARD_FOCUSED,
    CSS_CLASS_CARD_IS_CSS_HAS_SUPPORTED,
    CSS_CLASS_CARD_IS_EXPANDED,
    CSS_CLASS_CARD_IS_LOADING,
    CSS_CLASS_CARD_IS_RESIZING,
    CSS_CLASS_CARD_MOVABLE,
    CSS_CLASS_CARD_NOT_SELECTABLE,
    CSS_CLASS_CARD_RELEVANT,
    CSS_CLASS_CARD_SELECTED,
    NUMBER_OF_DAYS_PER_WEEK,
    RESIZE_SNAP_THRESHOLD,
    TASK_CARD_WEEK_ID_PREFIX,
    TaskCardWeekComponent,
} from './task-card-week.component';
import {
    TaskCardWeekModel,
    TaskCardWeekModelHelper
} from './task-card-week.model.helper';

describe('Task Card Week Component', () => {
    let fixture: ComponentFixture<TaskCardWeekComponent>;
    let comp: TaskCardWeekComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let flyoutService: FlyoutService;
    let store: jasmine.SpyObj<Store>;
    let taskCardModelHelper: TaskCardWeekModelHelper;

    const {expandedWeekWidth, weekSpacer} = CALENDAR_CONSTANTS;
    const defaultWeekWidth = 280;
    const defaultDayWidth = defaultWeekWidth / NUMBER_OF_DAYS_PER_WEEK;
    const defaultExpandedDayWidth = expandedWeekWidth / NUMBER_OF_DAYS_PER_WEEK;
    const calendarStart: Moment = moment('2018-11-04');
    const calendarDateAtMiddleOfTask: Moment = moment('2018-11-19');
    const calendarEnd: Moment = moment('2018-12-15');
    const calendarScope: TimeScope = {start: calendarStart, end: calendarEnd};
    const expandedWeekNotBelongingToTask: Moment = moment('2018-12-10');
    const expandedWeekBelongingToTask: Moment = moment('2018-11-18');
    const expandedWeekBelongingToTask2: Moment = moment('2018-11-11');
    const relations = [MOCK_RELATION_RESOURCE_2];
    const taskStart = moment('2018-11-11');
    const taskEnd = moment('2018-11-24');
    const task: Task = {
        ...MOCK_TASK,
        schedule: {
            ...MOCK_TASK.schedule,
            start: '2018-11-11',
            end: '2018-11-24',
        },
    };

    const taskWithoutSchedule = {
        ...MOCK_TASK,
        schedule: null,
    };

    const taskWithoutPermissionToEditSchedule = {
        ...MOCK_TASK,
        schedule: {
            ...MOCK_TASK.schedule,
            permissions: {
                ...MOCK_TASK.schedule.permissions,
                canUpdate: false,
            },
        },
    };

    const dayCards: DayCard[] = [
        {...MOCK_DAY_CARD_A, date: '2018-11-11'},
        {...MOCK_DAY_CARD_B, date: '2018-11-12'},
    ];
    const taskId: string = task.id;
    const taskCardWeekModel: TaskCardWeekModel = {
        id: task.id,
        title: task.name,
        status: task.status,
        description: task.company.displayName,
        solidColor: task.projectCraft.color,
        lightColor: 'lightblue',
        start: taskStart,
        end: taskEnd,
        calendarStart,
        calendarEnd,
        permissions: task.schedule.permissions,
        constraints: task.constraints,
        statistics: task.statistics,
        cardStart: moment(task.schedule.start),
        cardEnd: moment(task.schedule.end),
        hasNews: false,
    };

    const taskCardDescriptionType = TaskCardDescriptionTypeEnum.Company;
    const calendarUserSettings: CalendarUserSettings = Object.assign(new CalendarUserSettings(), {taskCardDescriptionType});

    const dateParserStrategyMock: DateParserStrategy = mock(ProjectDateParserStrategy);
    const dayCardQueries: DayCardQueries = mock(DayCardQueries);
    const projectTaskQueries: ProjectTaskQueries = mock(ProjectTaskQueries);
    const relationQueries: RelationQueries = mock(RelationQueries);
    const taskCardModelHelperMock: TaskCardWeekModelHelper = mock(TaskCardWeekModelHelper);
    const dayCardRequestStatusByTaskSubject = new BehaviorSubject<RequestStatusEnum>(RequestStatusEnum.success);
    const taskPredecessorRelationsSubject = new BehaviorSubject<RelationResource[]>([]);
    const taskSuccessorRelationsSubject = new BehaviorSubject<RelationResource[]>([]);
    const workDaysQueriesMock = mock(WorkDaysQueries);
    const newsQueriesMock: NewsQueries = mock(NewsQueries);
    const calendarQueriesMock: CalendarQueries = mock(CalendarQueries);
    const systemHelperMock: SystemHelper = mock(SystemHelper);

    const clickEvent: Event = new Event('click');

    const dataAutomationDetailsSelector = '[data-automation="task-card-week-details"]';
    const dataAutomationDurationIndicatorSelector = '[data-automation="task-card-week-duration-indicator"]';
    const dataAutomationTitleSelector = '[data-automation="task-card-week-title"]';
    const dataAutomationTitleLoading = '[data-automation="task-card-week-loading"]';
    const dataAutomationDescriptionSelector = '[data-automation="task-card-week-description"]';
    const dataAutomationContinuesLeftArrowSelector = '[data-automation="task-card-week-continues-left"]';
    const dataAutomationContinuesRightArrowSelector = '[data-automation="task-card-week-continues-right"]';
    const dataAutomationResizeLeftHandleSelector = '[data-automation="task-card-week-resize-left"]';
    const dataAutomationResizeRightHandleSelector = '[data-automation="task-card-week-resize-right"]';
    const dataAutomationDayCardListSelector = '[data-automation="task-card-week-day-card-list"]';
    const dataAutomationSelectedCheckSelector = '[data-automation="task-card-week-selected-check"]';
    const dataAutomationStatusSelector = '[data-automation="task-card-week-status"]';
    const dataAutomationIconIndicatorsSelector = '[data-automation="task-card-week-icon-indicators"]';
    const dataAutomationHasNewsMarkerSelector = '[data-automation="task-card-week-has-news-marker"]';
    const dataAutomationShiftAmountSelector = '[data-automation="task-card-week-shift-amount"]';

    const getElement = (selector: string): HTMLElement => el.querySelector(selector);
    const getDocumentElement = (selector: string): HTMLElement => document.querySelector(selector);
    const getDebugElement = (selector: string) => de.query(By.css(selector));

    const getTaskCardWeekModelByTask = ({schedule: {start, end}}: Task): TaskCardWeekModel => ({
        ...taskCardWeekModel,
        start: moment(start),
        end: moment(end),
        cardStart: moment(start).startOf('week'),
        cardEnd: moment(end).endOf('week'),
    });

    const updateTaskSchedule = ({start, end}: { start?: moment.Moment, end?: moment.Moment }): void => {
        const newTask: Task = {
            ...task,
            schedule: {
                ...task.schedule,
                start: start?.format(API_DATE_YEAR_MONTH_DAY_FORMAT) || task.schedule.start,
                end: end?.format(API_DATE_YEAR_MONTH_DAY_FORMAT) || task.schedule.end,
            },
        };
        const newTaskCardWeekModel = getTaskCardWeekModelByTask(newTask);

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        when(taskCardModelHelperMock
            .fromTaskWithScopeNewsAndDescriptionType(newTask, calendarScope, taskCardDescriptionType, deepEqual([])))
            .thenReturn(newTaskCardWeekModel);
        comp.ngOnInit();
    };

    const dragEndEvent: CdkDragEnd = {
        source: {
            reset: () => {
            },
        },
    } as CdkDragEnd;

    const getDragMoveEvent = (x: number): CdkDragMove => ({
        distance: {
            x,
        },
    } as CdkDragMove);

    const sendKeyUp = (key: KeyEnum): void => {
        const keyUpEvent: KeyboardEvent = new KeyboardEvent('keyup');

        setEventKey(keyUpEvent, key);
        window.dispatchEvent(keyUpEvent);
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [TranslateModule.forRoot()],
        declarations: [
            FlyoutDirective,
            TaskCardWeekComponent,
            TaskShiftAmountPipe,
        ],
        providers: [
            {
                provide: CalendarQueries,
                useValue: instance(calendarQueriesMock),
            },
            {
                provide: DateParserStrategy,
                useValue: instance(dateParserStrategyMock),
            },
            {
                provide: DayCardQueries,
                useValue: instance(dayCardQueries),
            },
            {
                provide: ProjectTaskQueries,
                useValue: instance(projectTaskQueries),
            },
            {
                provide: RelationQueries,
                useValue: instance(relationQueries),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: TaskCardWeekModelHelper,
                useValue: instance(taskCardModelHelperMock),
            },
            {
                provide: WorkDaysQueries,
                useValue: instance(workDaysQueriesMock),
            },
            {
                provide: NewsQueries,
                useValue: instance(newsQueriesMock),
            },
            {
                provide: SystemHelper,
                useValue: instance(systemHelperMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskCardWeekComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        comp.showDayCardIndicators = false;
        comp.calendarScope = calendarScope;
        comp.taskId = taskId;
        comp.weekWidth = defaultWeekWidth;

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(task));
        when(dayCardQueries.observeDayCardsByTask(taskId)).thenReturn(of(dayCards));
        when(dayCardQueries.observeDayCardRequestStatusByTask(taskId)).thenReturn(dayCardRequestStatusByTaskSubject);
        when(dayCardQueries.observeAddDayCardPermissionByTask(taskId)).thenReturn(of(true));
        when(relationQueries.observeFinishToStartPredecessorRelationsByTaskId(taskId)).thenReturn(taskPredecessorRelationsSubject);
        when(relationQueries.observeFinishToStartSuccessorRelationsByTaskId(taskId)).thenReturn(taskSuccessorRelationsSubject);
        when(taskCardModelHelperMock.fromTaskWithScopeNewsAndDescriptionType(anything(), anything(), anything(), anything()))
            .thenReturn(taskCardWeekModel);
        when(workDaysQueriesMock.observeWorkDays()).thenReturn(of(MOCK_WORK_DAYS));
        when(newsQueriesMock.observeItemsByIdentifierPair(anything())).thenReturn(of([]));
        when(calendarQueriesMock.observeCalendarUserSettings()).thenReturn(of(calendarUserSettings));
        when(dateParserStrategyMock.isSame(anything(), anything(), 'w'))
            .thenCall((referenceDateA, referenceDateB) => referenceDateA.isSame(referenceDateB, 'w'));
        spyOn(TaskShiftAmountPipe.prototype, 'transform').and.callFake(amount => amount);

        taskCardModelHelper = TestBed.inject(TaskCardWeekModelHelper);
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
        flyoutService = TestBed.inject(FlyoutService);

        store.dispatch.calls.reset();

        comp.ngOnInit();
        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(comp).toBeDefined();
    });

    it('should set unique task card id', () => {
        const expectedId = `#${TASK_CARD_WEEK_ID_PREFIX}${taskId}`;

        expect(getElement(expectedId)).toBeTruthy();
    });

    it('should render title', () => {
        expect(getElement(dataAutomationTitleSelector).textContent.trim()).toBe(taskCardWeekModel.title);
    });

    it('should render description', () => {
        expect(getElement(dataAutomationDescriptionSelector).textContent.trim()).toBe(taskCardWeekModel.description);
    });

    it('should render right content for normal mode', () => {
        expect(getElement(dataAutomationTitleSelector)).not.toBeNull();
        expect(getElement(dataAutomationDescriptionSelector)).not.toBeNull();
        expect(getElement(dataAutomationDayCardListSelector)).toBeNull();
    });

    it('should render right content for collapsed mode', () => {
        comp.expandedWeeks = [expandedWeekNotBelongingToTask];
        fixture.detectChanges();

        expect(getElement(dataAutomationTitleSelector)).not.toBeNull();
        expect(getElement(dataAutomationDescriptionSelector)).toBeNull();
        expect(getElement(dataAutomationDayCardListSelector)).not.toBeNull();
    });

    it('should render right content for expanded mode', () => {
        comp.expandedWeeks = [expandedWeekBelongingToTask];
        fixture.detectChanges();

        expect(getElement(dataAutomationTitleSelector)).not.toBeNull();
        expect(getElement(dataAutomationDescriptionSelector)).toBeNull();
        expect(getElement(dataAutomationDayCardListSelector)).not.toBeNull();
    });

    it('should render right content for expanded mode (multi weeks)', () => {
        comp.expandedWeeks = [expandedWeekBelongingToTask, expandedWeekBelongingToTask2];
        fixture.detectChanges();

        expect(getElement(dataAutomationTitleSelector)).not.toBeNull();
        expect(getElement(dataAutomationDescriptionSelector)).toBeNull();
        expect(getElement(dataAutomationDayCardListSelector)).not.toBeNull();
    });

    it('should render day card indicators', () => {
        comp.expandedWeeks = [];
        comp.showDayCardIndicators = true;
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationDayCardListSelector)).toBeTruthy();
    });

    it('should not render day card indicators', () => {
        comp.expandedWeeks = [];
        comp.showDayCardIndicators = false;
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationDayCardListSelector)).toBeFalsy();
    });

    it('should render arrow when task continues to the left of the calendar', () => {
        comp.calendarScope = {
            start: calendarDateAtMiddleOfTask,
            end: calendarDateAtMiddleOfTask.clone().add(1, 'd'),
        };
        comp.ngOnInit();
        fixture.detectChanges();

        expect(comp.taskContinuesToLeft).toBeTruthy();
        expect(getElement(dataAutomationContinuesLeftArrowSelector)).not.toBeNull();
    });

    it('should render arrow when task continues to the right of the calendar', () => {
        comp.calendarScope = {
            start: calendarDateAtMiddleOfTask.clone().subtract(1, 'd'),
            end: calendarDateAtMiddleOfTask,
        };
        comp.ngOnInit();
        fixture.detectChanges();

        expect(comp.taskContinuesToRight).toBeTruthy();
        expect(getElement(dataAutomationContinuesRightArrowSelector)).not.toBeNull();
    });

    it('should dispatch action to update slots when handleMoveDayCard is called', () => {
        const currentDate: Moment = moment(MOCK_DAY_CARD_A.date, 'YYYY-MM-DD');
        const dayCardMove: DayCardMove = new DayCardMove(
            MOCK_DAY_CARD_A,
            currentDate,
        );
        const action: Action = new DayCardActions.Update.Slots({
            currentDate,
            taskId: MOCK_DAY_CARD_A.task.id,
            dayCardId: MOCK_DAY_CARD_A.id,
        });

        comp.handleMoveDayCard(dayCardMove);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should display the loading icon when loading and in collapsed mode', () => {
        comp.expandedWeeks = [];
        dayCardRequestStatusByTaskSubject.next(RequestStatusEnum.progress);
        fixture.detectChanges();

        expect(getElement(dataAutomationTitleLoading)).toBeTruthy();
    });

    it('should display the loading icon when loading and in expanded mode', () => {
        comp.expandedWeeks = [calendarStart];
        dayCardRequestStatusByTaskSubject.next(RequestStatusEnum.progress);
        fixture.detectChanges();

        expect(getElement(dataAutomationTitleLoading)).toBeTruthy();
    });

    it('should display the icon indicators when loading and in collapsed mode', () => {
        comp.expandedWeeks = [];
        dayCardRequestStatusByTaskSubject.next(RequestStatusEnum.progress);
        fixture.detectChanges();

        expect(getElement(dataAutomationIconIndicatorsSelector)).toBeTruthy();
    });

    it('should not display the icon indicators when loading and in expanded mode', () => {
        comp.expandedWeeks = [calendarStart];
        dayCardRequestStatusByTaskSubject.next(RequestStatusEnum.progress);
        fixture.detectChanges();

        expect(getElement(dataAutomationIconIndicatorsSelector)).toBeFalsy();
    });

    it('should display the icon indicators when not loading and in expanded mode', () => {
        comp.expandedWeeks = [calendarStart];
        dayCardRequestStatusByTaskSubject.next(RequestStatusEnum.success);
        fixture.detectChanges();

        expect(getElement(dataAutomationIconIndicatorsSelector)).toBeTruthy();
    });

    it('should not set task when schedule is missing', () => {
        const currentCardTaskModel = comp.cardTaskModel;

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(taskWithoutSchedule));
        comp.ngOnInit();

        expect(comp.cardTaskModel).toBe(currentCardTaskModel);
    });

    it('should set canShowTaskCardWeek to false when task schedule start is outside calendar scope', () => {
        const futureTask: Task = {
            ...MOCK_TASK,
            schedule: {
                ...MOCK_TASK.schedule,
                start: calendarStart.clone().add(4, 'month').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarEnd.clone().add(4, 'month').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(futureTask));
        comp.ngOnInit();

        comp.calendarScope = {start: calendarStart, end: calendarEnd};

        expect(comp.canShowTaskCardWeek).toBeFalsy();
    });

    it('should set canShowTaskCardWeek to true when task schedule start is within calendar scope', () => {
        const futureTask: Task = {
            ...MOCK_TASK,
            schedule: {
                ...MOCK_TASK.schedule,
                start: calendarStart.clone().add(1, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarEnd.clone().add(1, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(futureTask));
        comp.ngOnInit();

        comp.calendarScope = {start: calendarStart, end: calendarEnd};

        expect(comp.canShowTaskCardWeek).toBeTruthy();
    });

    it('should set canShowTaskCardWeek to false when task schedule end is outside calendar scope', () => {
        const futureTask: Task = {
            ...MOCK_TASK,
            schedule: {
                ...MOCK_TASK.schedule,
                start: calendarStart.clone().subtract(6, 'month').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarEnd.clone().subtract(6, 'month').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(futureTask));
        comp.ngOnInit();

        comp.calendarScope = {start: calendarStart, end: calendarEnd};

        expect(comp.canShowTaskCardWeek).toBeFalsy();
    });

    it('should set canShowTaskCardWeek to true when task schedule end is within calendar scope', () => {
        const futureTask: Task = {
            ...MOCK_TASK,
            schedule: {
                ...MOCK_TASK.schedule,
                start: calendarStart.clone().subtract(2, 'month').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarEnd.clone().add(2, 'month').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(futureTask));
        comp.ngOnInit();

        comp.calendarScope = {start: calendarStart, end: calendarEnd};

        expect(comp.canShowTaskCardWeek).toBeTruthy();
    });

    it('should set canShowTaskCardWeek to false when calendar scope start is outside task schedule', () => {
        const futureTask: Task = {
            ...MOCK_TASK,
            schedule: {
                ...MOCK_TASK.schedule,
                start: calendarStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(futureTask));
        comp.ngOnInit();

        comp.calendarScope = {start: calendarStart.clone().add(6, 'months'), end: calendarEnd.clone().add(6, 'months')};

        expect(comp.canShowTaskCardWeek).toBeFalsy();
    });

    it('should set canShowTaskCardWeek to true when calendar scope start is within task schedule', () => {
        const futureTask: Task = {
            ...MOCK_TASK,
            schedule: {
                ...MOCK_TASK.schedule,
                start: calendarStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(futureTask));
        comp.ngOnInit();

        comp.calendarScope = {start: calendarStart.clone().add(1, 'day'), end: calendarEnd.clone().add(1, 'd')};

        expect(comp.canShowTaskCardWeek).toBeTruthy();
    });

    it('should set canShowTaskCardWeek to false when calendar scope end is outside task schedule', () => {
        const futureTask: Task = {
            ...MOCK_TASK,
            schedule: {
                ...MOCK_TASK.schedule,
                start: calendarStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(futureTask));
        comp.ngOnInit();

        comp.calendarScope = {
            start: calendarStart.clone().subtract(6, 'months'),
            end: calendarEnd.clone().subtract(6, 'months'),
        };

        expect(comp.canShowTaskCardWeek).toBeFalsy();
    });

    it('should set canShowTaskCardWeek to true when calendar scope end is within task schedule', () => {
        const futureTask: Task = {
            ...MOCK_TASK,
            schedule: {
                ...MOCK_TASK.schedule,
                start: calendarStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(futureTask));
        comp.ngOnInit();

        comp.calendarScope = {
            start: calendarStart.clone().subtract(6, 'months'),
            end: calendarEnd.clone().subtract(1, 'd'),
        };

        expect(comp.canShowTaskCardWeek).toBeTruthy();
    });

    it('should not mark task as relevant if cannot be updated, assigned and is not in copy mode', () => {
        const newTask = {
            ...task,
            permissions: {
                ...task.permissions,
                canUpdate: false,
                canAssign: false,
            },
        };

        comp.isCopying = false;

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        comp.ngOnInit();

        expect(comp.cardClasses[CSS_CLASS_CARD_RELEVANT]).toBeFalsy();
    });

    it('should mark task as relevant if can be updated', () => {
        const newTask = {
            ...task,
            permissions: {
                ...task.permissions,
                canUpdate: true,
                canAssign: false,
            },
        };

        comp.isCopying = false;

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        comp.ngOnInit();

        expect(comp.cardClasses[CSS_CLASS_CARD_RELEVANT]).toBeTruthy();
    });

    it('should not mark task as relevant if it can be updated but can\'t be selected and the user is multi-selecting', () => {
        const newTask = {
            ...task,
            permissions: {
                ...task.permissions,
                canUpdate: true,
                canAssign: false,
            },
        };

        comp.isCopying = false;
        comp.canSelectTask = false;
        comp.isMultiSelecting = true;

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        comp.ngOnInit();

        expect(comp.cardClasses[CSS_CLASS_CARD_RELEVANT]).toBeFalsy();
    });

    it('should not mark task as relevant if it can be updated but can\'t be selected and there\'s tasks selected', () => {
        const newTask = {
            ...task,
            permissions: {
                ...task.permissions,
                canUpdate: true,
                canAssign: false,
            },
        };

        comp.isCopying = false;
        comp.canSelectTask = false;
        comp.selectedTasksIds = [MOCK_TASK_2.id];

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        comp.ngOnInit();

        expect(comp.cardClasses[CSS_CLASS_CARD_RELEVANT]).toBeFalsy();
    });

    it('should mark task as relevant if it can be updated but can\'t be selected but there\'s no tasks selected ' +
        'and the user isn\'t multi-selecting', () => {
        const newTask = {
            ...task,
            permissions: {
                ...task.permissions,
                canUpdate: true,
                canAssign: false,
            },
        };

        comp.isCopying = false;
        comp.canSelectTask = false;
        comp.isMultiSelecting = false;
        comp.selectedTasksIds = [];

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        comp.ngOnInit();

        expect(comp.cardClasses[CSS_CLASS_CARD_RELEVANT]).toBeTruthy();
    });

    it('should mark task as relevant if can be assigned', () => {
        const newTask = {
            ...task,
            permissions: {
                ...task.permissions,
                canUpdate: false,
                canAssign: true,
            },
        };

        comp.isCopying = false;

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        comp.ngOnInit();

        expect(comp.cardClasses[CSS_CLASS_CARD_RELEVANT]).toBeTruthy();
    });

    it('should not mark task as relevant in copy mode if weeks expanded', () => {
        const newTask = {
            ...task,
            permissions: {
                ...task.permissions,
                canUpdate: false,
                canAssign: false,
            },
        };

        comp.expandedWeeks = [expandedWeekNotBelongingToTask];
        comp.isCopying = true;

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        comp.ngOnInit();

        expect(comp.cardClasses[CSS_CLASS_CARD_RELEVANT]).toBeFalsy();
    });

    it('should mark task as relevant in copy mode if weeks not expanded', () => {
        const newTask = {
            ...task,
            permissions: {
                ...task.permissions,
                canUpdate: false,
                canAssign: false,
            },
        };

        comp.expandedWeeks = [];
        comp.isCopying = true;

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        comp.ngOnInit();

        expect(comp.cardClasses[CSS_CLASS_CARD_RELEVANT]).toBeTruthy();
    });

    it('should not mark task as copying when weeks are expanded in copy mode', () => {
        comp.expandedWeeks = [expandedWeekNotBelongingToTask];
        comp.isCopying = true;

        expect(comp.cardClasses[CSS_CLASS_CARD_COPYING]).toBeFalsy();
    });

    it('should not mark task as copying when not copy mode', () => {
        comp.expandedWeeks = [];
        comp.isCopying = false;

        expect(comp.cardClasses[CSS_CLASS_CARD_COPYING]).toBeFalsy();
    });

    it('should mark task as copying when weeks are not expanded in copy mode', () => {
        comp.expandedWeeks = [];
        comp.isCopying = true;

        expect(comp.cardClasses[CSS_CLASS_CARD_COPYING]).toBeTruthy();
    });

    it('should not mark task as copying when weeks are not expanded in copy mode and task can\'t be dragged', () => {
        comp.expandedWeeks = [];
        comp.canDragTask = false;
        comp.isCopying = true;

        expect(comp.cardClasses[CSS_CLASS_CARD_COPYING]).toBeFalsy();
    });

    it('should mark task as movable when weeks are not expanded, task can be updated and not in copy mode', () => {
        comp.expandedWeeks = [];
        comp.isCopying = false;

        const newTask = {
            ...task,
            permissions: {
                ...task.permissions,
                canUpdate: true,
                canAssign: false,
            },
        };

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        comp.ngOnInit();
        expect(comp.cardClasses[CSS_CLASS_CARD_MOVABLE]).toBeTruthy();
    });

    it('should not mark task as movable when weeks are not expanded, task can be updated, not in copy mode ' +
        'and task can\'t be dragged', () => {
        comp.expandedWeeks = [];
        comp.isCopying = false;
        comp.canDragTask = false;

        const newTask = {
            ...task,
            permissions: {
                ...task.permissions,
                canUpdate: true,
                canAssign: false,
            },
        };

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        comp.ngOnInit();
        expect(comp.cardClasses[CSS_CLASS_CARD_MOVABLE]).toBeFalsy();
    });

    it('should not mark task as movable when weeks are expanded, task can be updated and not in copy mode', () => {
        comp.expandedWeeks = [expandedWeekNotBelongingToTask];
        comp.isCopying = false;

        const newTask = {
            ...task,
            permissions: {
                ...task.permissions,
                canUpdate: true,
                canAssign: false,
            },
        };

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        comp.ngOnInit();
        expect(comp.cardClasses[CSS_CLASS_CARD_MOVABLE]).toBeFalsy();
    });

    it('should not mark task as movable when weeks are not expanded, task cannot be updated and not in copy mode', () => {
        comp.expandedWeeks = [];
        comp.isCopying = false;

        const newTask = {
            ...task,
            permissions: {
                ...task.permissions,
                canUpdate: false,
                canAssign: false,
            },
        };

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        comp.ngOnInit();
        expect(comp.cardClasses[CSS_CLASS_CARD_MOVABLE]).toBeFalsy();
    });

    it('should not mark task as movable when weeks are not expanded, task can be updated and in copy mode', () => {
        comp.expandedWeeks = [];
        comp.isCopying = true;

        const newTask = {
            ...task,
            permissions: {
                ...task.permissions,
                canUpdate: true,
                canAssign: false,
            },
        };

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        comp.ngOnInit();
        expect(comp.cardClasses[CSS_CLASS_CARD_MOVABLE]).toBeFalsy();
    });

    it('should mark task as not-selectable if it can\'t be selected and the user is multi-selecting', () => {
        comp.canSelectTask = false;
        comp.isMultiSelecting = true;

        comp.ngOnInit();
        expect(comp.cardClasses[CSS_CLASS_CARD_NOT_SELECTABLE]).toBeTruthy();
    });

    it('should not mark task as not-selectable if it can be selected and the user is multi-selecting', () => {
        comp.canSelectTask = true;
        comp.isMultiSelecting = true;

        comp.ngOnInit();
        expect(comp.cardClasses[CSS_CLASS_CARD_NOT_SELECTABLE]).toBeFalsy();
    });

    it('should not mark task as not-selectable if it can be selected and the user is not multi-selecting', () => {
        comp.canSelectTask = true;
        comp.isMultiSelecting = false;

        comp.ngOnInit();
        expect(comp.cardClasses[CSS_CLASS_CARD_NOT_SELECTABLE]).toBeFalsy();
    });

    it('should not mark task as not-selectable if it can\'t be selected and the user is not multi-selecting', () => {
        comp.canSelectTask = false;
        comp.isMultiSelecting = false;

        comp.ngOnInit();
        expect(comp.cardClasses[CSS_CLASS_CARD_NOT_SELECTABLE]).toBeFalsy();
    });

    it('should not mark task as expandable when weeks are not expanded', () => {
        comp.expandedWeeks = [];

        expect(comp.cardClasses[CSS_CLASS_CARD_IS_EXPANDED]).toBeFalsy();
    });

    it('should mark task as expandable when weeks are expanded', () => {
        comp.expandedWeeks = [expandedWeekNotBelongingToTask];

        expect(comp.cardClasses[CSS_CLASS_CARD_IS_EXPANDED]).toBeTruthy();
    });

    it('should dispatch action to create daycard when handleCopyDayCard is called', () => {
        const currentDate: Moment = moment(MOCK_DAY_CARD_A.date, API_DATE_YEAR_MONTH_DAY_FORMAT);
        const dayCardMove: DayCardMove = new DayCardMove(
            MOCK_DAY_CARD_A,
            currentDate,
        );
        const saveDayCard = new SaveDayCardResource(MOCK_DAY_CARD_A.title, currentDate, MOCK_DAY_CARD_A.manpower, MOCK_DAY_CARD_A.notes);
        const action: Action = new DayCardActions.Create.One({
            taskId,
            saveDayCard,
        });

        comp.handleCopyDayCard(dayCardMove);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should mark task as selected if this task is selected', () => {
        comp.selectedTasksIds = [taskId];

        fixture.detectChanges();

        expect(comp.cardClasses[CSS_CLASS_CARD_SELECTED]).toBeTruthy();
        expect(getElement(dataAutomationSelectedCheckSelector)).not.toBeNull();
        expect(getElement(dataAutomationStatusSelector)).toBeNull();
    });

    it('should not mark task as selected if there are tasks selected but this one is not selected', () => {
        comp.selectedTasksIds = ['not' + taskId];

        fixture.detectChanges();

        expect(comp.cardClasses[CSS_CLASS_CARD_SELECTED]).toBeFalsy();
        expect(getElement(dataAutomationSelectedCheckSelector)).toBeNull();
        expect(getElement(dataAutomationStatusSelector)).not.toBeNull();
    });

    it('should not mark task as selected if no task is selected', () => {
        comp.selectedTasksIds = [];
        expect(comp.cardClasses[CSS_CLASS_CARD_SELECTED]).toBeFalsy();
    });

    it('should mark task as focused if this task is focused', () => {
        comp.focusedTaskId = taskId;
        expect(comp.cardClasses[CSS_CLASS_CARD_FOCUSED]).toBeTruthy();
    });

    it('should not mark task as focused if there are tasks focused but this one is not focused', () => {
        comp.focusedTaskId = 'not' + taskId;
        expect(comp.cardClasses[CSS_CLASS_CARD_FOCUSED]).toBeFalsy();
    });

    it('should not mark task as focused if no task is focused', () => {
        comp.focusedTaskId = null;
        expect(comp.cardClasses[CSS_CLASS_CARD_FOCUSED]).toBeFalsy();
    });

    it('should mark task as dimmed out when isTaskDimmedOut is true', () => {
        comp.isTaskDimmedOut = true;

        comp.ngOnInit();

        expect(comp.cardClasses[CSS_CLASS_CARD_DIMMED_OUT]).toBeTruthy();
    });

    it('should mark task as not dimmed out when isTaskDimmedOut is false', () => {
        comp.isTaskDimmedOut = false;

        comp.ngOnInit();

        expect(comp.cardClasses[CSS_CLASS_CARD_DIMMED_OUT]).toBeFalsy();
    });

    it('should emit selectTask when card details are clicked', () => {
        spyOn(comp.selectTask, 'emit').and.callThrough();

        const expectedResult = comp.taskId;

        getElement(dataAutomationDetailsSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.selectTask.emit).toHaveBeenCalledWith(expectedResult);
    });

    it('should not emit selectTask while resizing', () => {
        spyOn(comp.selectTask, 'emit').and.callThrough();

        const expectedResult = comp.taskId;

        comp.handleResizeStarted(false);
        getElement(dataAutomationDetailsSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.selectTask.emit).not.toHaveBeenCalledWith(expectedResult);
    });

    it(`should add ${CSS_CLASS_CARD_IS_LOADING} CSS class when request status is progress`, () => {
        dayCardRequestStatusByTaskSubject.next(RequestStatusEnum.progress);

        expect(comp.cardClasses[CSS_CLASS_CARD_IS_LOADING]).toBeTruthy();
    });

    it(`should not add ${CSS_CLASS_CARD_IS_LOADING} CSS class when request status isn't progress`, () => {
        dayCardRequestStatusByTaskSubject.next(RequestStatusEnum.success);

        expect(comp.cardClasses[CSS_CLASS_CARD_IS_LOADING]).toBeFalsy();
    });

    it(`should add ${CSS_CLASS_CARD_IS_CSS_HAS_SUPPORTED} class when css has is supported`, () => {
        when(systemHelperMock.isCssHasSupported()).thenReturn(true);
        comp.ngOnInit();

        expect(comp.cardClasses[CSS_CLASS_CARD_IS_CSS_HAS_SUPPORTED]).toBeTruthy();
    });

    it(`should not add ${CSS_CLASS_CARD_IS_CSS_HAS_SUPPORTED} class when css has isn't supported`, () => {
        when(systemHelperMock.isCssHasSupported()).thenReturn(false);
        comp.ngOnInit();

        expect(comp.cardClasses[CSS_CLASS_CARD_IS_CSS_HAS_SUPPORTED]).toBeFalsy();
    });

    it('should display duration indicator with the solid color of the task craft', () => {
        const {solidColor} = taskCardWeekModel;

        comp.ngOnInit();
        fixture.detectChanges();

        expect(isElementPropertyColor(getElement(dataAutomationDurationIndicatorSelector), 'background-color', solidColor)).toBeTruthy();
    });

    it('should display duration indicator with full width when task duration is a full week', () => {
        const expectedWidth = `${defaultWeekWidth}px`;
        const expectedMarginLeft = '0px';
        const newTask: Task = {
            ...task,
            schedule: {
                ...task.schedule,
                start: calendarStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarStart.clone().endOf('week').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };
        const newTaskCardWeekModel = getTaskCardWeekModelByTask(newTask);

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        when(taskCardModelHelperMock
            .fromTaskWithScopeNewsAndDescriptionType(newTask, calendarScope, taskCardDescriptionType, deepEqual([])))
            .thenReturn(newTaskCardWeekModel);

        comp.expandedWeeks = [];
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationDurationIndicatorSelector).style['width']).toEqual(expectedWidth);
        expect(getElement(dataAutomationDurationIndicatorSelector).style['margin-left']).toEqual(expectedMarginLeft);
    });

    it('should display duration indicator with a gap of 2 days at the beginning when task starts on a Wednesday', () => {
        const weekDayOffset = 2;
        const weeksSpan = 2;
        const gapWidth = defaultDayWidth * weekDayOffset;
        const expectedWidth = `${(defaultWeekWidth * weeksSpan) + weekSpacer - gapWidth}px`;
        const expectedMarginLeft = `${gapWidth}px`;
        const newTask: Task = {
            ...task,
            schedule: {
                ...task.schedule,
                start: calendarStart.clone().add(weekDayOffset, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarStart.clone().add(1, 'w').endOf('week').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };
        const newTaskCardWeekModel = getTaskCardWeekModelByTask(newTask);

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        when(taskCardModelHelperMock
            .fromTaskWithScopeNewsAndDescriptionType(newTask, calendarScope, taskCardDescriptionType, deepEqual([])))
            .thenReturn(newTaskCardWeekModel);

        comp.expandedWeeks = [];
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationDurationIndicatorSelector).style['width']).toEqual(expectedWidth);
        expect(getElement(dataAutomationDurationIndicatorSelector).style['margin-left']).toEqual(expectedMarginLeft);
    });

    it('should display duration indicator with a gap of 4 days at the end when task ends on a Wednesday', () => {
        const weekDayOffset = 4;
        const weeksSpan = 2;
        const gapWidth = defaultDayWidth * weekDayOffset;
        const expectedWidth = `${(defaultWeekWidth * weeksSpan) + weekSpacer - gapWidth}px`;
        const expectedMarginLeft = '0px';
        const newTask: Task = {
            ...task,
            schedule: {
                ...task.schedule,
                start: calendarStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarStart.clone().add(1, 'w').endOf('week').subtract(weekDayOffset, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };
        const newTaskCardWeekModel = getTaskCardWeekModelByTask(newTask);

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        when(taskCardModelHelperMock
            .fromTaskWithScopeNewsAndDescriptionType(newTask, calendarScope, taskCardDescriptionType, deepEqual([])))
            .thenReturn(newTaskCardWeekModel);

        comp.expandedWeeks = [];
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationDurationIndicatorSelector).style['width']).toEqual(expectedWidth);
        expect(getElement(dataAutomationDurationIndicatorSelector).style['margin-left']).toEqual(expectedMarginLeft);
    });

    it('should display duration indicator with a gap of 2 days at the beginning and 3 days at the end when task starts on a Wednesday ' +
        'and ends on a Thursday', () => {
        const weekDayStartOffset = 2;
        const weekDayEndOffset = 3;
        const weeksSpan = 2;
        const leftGapWidth = defaultDayWidth * weekDayStartOffset;
        const rightGapWidth = defaultDayWidth * weekDayEndOffset;
        const expectedWidth = `${(defaultWeekWidth * weeksSpan) + weekSpacer - leftGapWidth - rightGapWidth}px`;
        const expectedMarginLeft = `${leftGapWidth}px`;
        const newTask: Task = {
            ...task,
            schedule: {
                ...task.schedule,
                start: calendarStart.clone().add(weekDayStartOffset, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarStart.clone().add(1, 'w').endOf('week').subtract(weekDayEndOffset, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };
        const newTaskCardWeekModel = getTaskCardWeekModelByTask(newTask);

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        when(taskCardModelHelperMock
            .fromTaskWithScopeNewsAndDescriptionType(newTask, calendarScope, taskCardDescriptionType, deepEqual([])))
            .thenReturn(newTaskCardWeekModel);

        comp.expandedWeeks = [];
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationDurationIndicatorSelector).style['width']).toEqual(expectedWidth);
        expect(getElement(dataAutomationDurationIndicatorSelector).style['margin-left']).toEqual(expectedMarginLeft);
    });

    it('should display duration indicator with a gap of 2 days at the beginning when task starts on a Wednesday ' +
        'and last week is expanded', () => {
        const weekDayOffset = 2;
        const weeksSpan = 1;
        const gapWidth = defaultDayWidth * weekDayOffset;
        const expectedWidth = `${defaultWeekWidth + weekSpacer + expandedWeekWidth - gapWidth}px`;
        const expectedMarginLeft = `${gapWidth}px`;
        const newExpandedWeek = calendarStart.clone().add(weeksSpan, 'w');
        const newTask: Task = {
            ...task,
            schedule: {
                ...task.schedule,
                start: calendarStart.clone().add(weekDayOffset, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarStart.clone().add(1, 'w').endOf('week').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };
        const newTaskCardWeekModel = getTaskCardWeekModelByTask(newTask);

        when(dateParserStrategyMock.isSame(newExpandedWeek, anything(), 'w'))
            .thenCall((referenceDate, day) => day.isSame(newExpandedWeek, 'd'));
        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        when(taskCardModelHelperMock
            .fromTaskWithScopeNewsAndDescriptionType(newTask, calendarScope, taskCardDescriptionType, deepEqual([])))
            .thenReturn(newTaskCardWeekModel);

        comp.expandedWeeks = [newExpandedWeek];
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationDurationIndicatorSelector).style['width']).toEqual(expectedWidth);
        expect(getElement(dataAutomationDurationIndicatorSelector).style['margin-left']).toEqual(expectedMarginLeft);
    });

    it('should display duration indicator with a gap of 2 days at the beginning when task starts on a Wednesday ' +
        'and first week is expanded', () => {
        const weekDayOffset = 2;
        const gapWidth = defaultExpandedDayWidth * weekDayOffset;
        const expectedWidth = `${defaultWeekWidth + weekSpacer + expandedWeekWidth - gapWidth}px`;
        const expectedMarginLeft = `${gapWidth}px`;
        const newTask: Task = {
            ...task,
            schedule: {
                ...task.schedule,
                start: calendarStart.clone().add(weekDayOffset, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarStart.clone().add(1, 'w').endOf('week').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };
        const newTaskCardWeekModel = getTaskCardWeekModelByTask(newTask);

        when(dateParserStrategyMock.isSame(calendarStart, anything(), 'w'))
            .thenCall((referenceDate, day) => day.isSame(calendarStart, 'd'));
        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        when(taskCardModelHelperMock
            .fromTaskWithScopeNewsAndDescriptionType(newTask, calendarScope, taskCardDescriptionType, deepEqual([])))
            .thenReturn(newTaskCardWeekModel);

        comp.expandedWeeks = [calendarStart];
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationDurationIndicatorSelector).style['width']).toEqual(expectedWidth);
        expect(getElement(dataAutomationDurationIndicatorSelector).style['margin-left']).toEqual(expectedMarginLeft);
    });

    it('should display duration indicator with a gap of 1 day at the end when task ends on a Saturday and first week is expanded', () => {
        const weekDayOffset = 1;
        const gapWidth = defaultDayWidth * weekDayOffset;
        const expectedWidth = `${defaultWeekWidth + weekSpacer + expandedWeekWidth - gapWidth}px`;
        const expectedMarginLeft = '0px';
        const newTask: Task = {
            ...task,
            schedule: {
                ...task.schedule,
                start: calendarStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarStart.clone().add(1, 'w').endOf('week').subtract(weekDayOffset, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };
        const newTaskCardWeekModel = getTaskCardWeekModelByTask(newTask);

        when(dateParserStrategyMock.isSame(calendarStart, anything(), 'w'))
            .thenCall((referenceDate, day) => day.isSame(calendarStart, 'd'));
        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        when(taskCardModelHelperMock
            .fromTaskWithScopeNewsAndDescriptionType(newTask, calendarScope, taskCardDescriptionType, deepEqual([])))
            .thenReturn(newTaskCardWeekModel);

        comp.expandedWeeks = [calendarStart];
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationDurationIndicatorSelector).style['width']).toEqual(expectedWidth);
        expect(getElement(dataAutomationDurationIndicatorSelector).style['margin-left']).toEqual(expectedMarginLeft);
    });

    it('should display duration indicator with a gap of 1 day at the end when task ends on a Saturday and last week is expanded', () => {
        const weekDayOffset = 1;
        const gapWidth = defaultExpandedDayWidth * weekDayOffset;
        const expectedWidth = `${defaultWeekWidth + weekSpacer + expandedWeekWidth - gapWidth}px`;
        const expectedMarginLeft = '0px';
        const newExpandedWeek = calendarStart.clone().add(1, 'w');
        const newTask: Task = {
            ...task,
            schedule: {
                ...task.schedule,
                start: calendarStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarStart.clone().add(1, 'w').endOf('week').subtract(weekDayOffset, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };
        const newTaskCardWeekModel = getTaskCardWeekModelByTask(newTask);

        when(dateParserStrategyMock.isSame(newExpandedWeek, anything(), 'w'))
            .thenCall((referenceDate, day) => day.isSame(newExpandedWeek, 'd'));
        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        when(taskCardModelHelperMock
            .fromTaskWithScopeNewsAndDescriptionType(newTask, calendarScope, taskCardDescriptionType, deepEqual([])))
            .thenReturn(newTaskCardWeekModel);

        comp.expandedWeeks = [newExpandedWeek];
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationDurationIndicatorSelector).style['width']).toEqual(expectedWidth);
        expect(getElement(dataAutomationDurationIndicatorSelector).style['margin-left']).toEqual(expectedMarginLeft);
    });

    it('should update duration indicator styles when expanded weeks changes', () => {
        const taskDurationStyles = comp.taskDurationStyles;

        comp.expandedWeeks = [];

        expect(comp.taskDurationStyles).not.toBe(taskDurationStyles);
    });

    it('should update duration indicator styles when week width changes', () => {
        const taskDurationStyles = comp.taskDurationStyles;

        comp.weekWidth = 100;

        expect(comp.taskDurationStyles).not.toBe(taskDurationStyles);
    });

    it('should update duration indicator styles when calendar scope changes', () => {
        const taskDurationStyles = comp.taskDurationStyles;

        comp.calendarScope = {
            start: calendarStart,
            end: calendarEnd,
        };

        expect(comp.taskDurationStyles).not.toBe(taskDurationStyles);
    });

    it('should update duration indicator styles when observeTaskById emits', () => {
        const taskSubject = new Subject<Task>();

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(taskSubject);
        comp.ngOnInit();

        const taskDurationStyles = comp.taskDurationStyles;
        taskSubject.next(task);

        expect(comp.taskDurationStyles).not.toBe(taskDurationStyles);
    });

    it('should not update duration indicator styles when cardTaskModel is not defined', () => {
        const taskDurationStyles = comp.taskDurationStyles;

        comp.cardTaskModel = null;
        comp.weekWidth = 100;

        expect(comp.taskDurationStyles).toBe(taskDurationStyles);
    });

    it('should display duration indicator with full width and no margin left when task duration is a full week and task view mode ' +
        `is set to ${TaskCalendarTaskViewModeEnum.Day}`, () => {
        const expectedWidth = `${defaultWeekWidth}px`;
        const expectedMarginLeft = '0px';
        const newTask: Task = {
            ...task,
            schedule: {
                ...task.schedule,
                start: calendarStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarStart.clone().endOf('week').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };
        const newTaskCardWeekModel = getTaskCardWeekModelByTask(newTask);

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        when(taskCardModelHelperMock
            .fromTaskWithScopeNewsAndDescriptionType(newTask, calendarScope, taskCardDescriptionType, deepEqual([])))
            .thenReturn(newTaskCardWeekModel);

        comp.expandedWeeks = [];
        comp.taskViewMode = TaskCalendarTaskViewModeEnum.Day;
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationDurationIndicatorSelector).style['width']).toEqual(expectedWidth);
        expect(getElement(dataAutomationDurationIndicatorSelector).style['margin-left']).toEqual(expectedMarginLeft);
    });

    it('should display duration indicator with the correct width and no margin left when task does not start on the current ' +
        `start of week and task view mode is set to ${TaskCalendarTaskViewModeEnum.Day}`, () => {
        const weekDayOffset = 2;
        const gapWidth = defaultDayWidth * weekDayOffset;
        const expectedWidth = `${defaultWeekWidth - gapWidth}px`;
        const expectedMarginLeft = '0px';
        const newTask: Task = {
            ...task,
            schedule: {
                ...task.schedule,
                start: calendarStart.clone().startOf('week').add(weekDayOffset, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarStart.clone().endOf('week').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };
        const newTaskCardWeekModel = getTaskCardWeekModelByTask(newTask);

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        when(taskCardModelHelperMock
            .fromTaskWithScopeNewsAndDescriptionType(newTask, calendarScope, taskCardDescriptionType, deepEqual([])))
            .thenReturn(newTaskCardWeekModel);

        comp.expandedWeeks = [];
        comp.taskViewMode = TaskCalendarTaskViewModeEnum.Day;
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationDurationIndicatorSelector).style['width']).toEqual(expectedWidth);
        expect(getElement(dataAutomationDurationIndicatorSelector).style['margin-left']).toEqual(expectedMarginLeft);
    });

    it('should update task duration indicator styles when taskViewMode changes', () => {
        const weekDayOffset = 2;
        const gapWidth = defaultDayWidth * weekDayOffset;
        const expectedWidth = `${defaultWeekWidth - gapWidth}px`;
        const expectedFirstMarginLeft = `${gapWidth}px`;
        const expectedSecondMarginLeft = '0px';
        const newTask: Task = {
            ...task,
            schedule: {
                ...task.schedule,
                start: calendarStart.clone().startOf('week').add(weekDayOffset, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
                end: calendarStart.clone().endOf('week').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            },
        };
        const newTaskCardWeekModel = getTaskCardWeekModelByTask(newTask);

        when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(newTask));
        when(taskCardModelHelperMock
            .fromTaskWithScopeNewsAndDescriptionType(newTask, calendarScope, taskCardDescriptionType, deepEqual([])))
            .thenReturn(newTaskCardWeekModel);

        comp.expandedWeeks = [];
        comp.taskViewMode = TaskCalendarTaskViewModeEnum.Week;
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationDurationIndicatorSelector).style['width']).toEqual(expectedWidth);
        expect(getElement(dataAutomationDurationIndicatorSelector).style['margin-left']).toEqual(expectedFirstMarginLeft);

        comp.taskViewMode = TaskCalendarTaskViewModeEnum.Day;
        fixture.detectChanges();

        expect(getElement(dataAutomationDurationIndicatorSelector).style['width']).toEqual(expectedWidth);
        expect(getElement(dataAutomationDurationIndicatorSelector).style['margin-left']).toEqual(expectedSecondMarginLeft);
    });

    it('should update card classes when canSelectTask input changes and isMultiSelecting is set to true', () => {
        comp.isMultiSelecting = true;
        comp.canSelectTask = false;

        expect(comp.cardClasses[CSS_CLASS_CARD_NOT_SELECTABLE]).toBeTruthy();

        comp.canSelectTask = true;

        expect(comp.cardClasses[CSS_CLASS_CARD_NOT_SELECTABLE]).toBeFalsy();
    });

    it('should update taskPredecessorRelations when observeFinishToStartPredecessorRelationsByTaskId emits', () => {
        taskPredecessorRelationsSubject.next(relations);

        expect(comp.taskPredecessorRelations).toBe(relations);
    });

    it('should update taskSuccessorRelations when observeFinishToStartSuccessorRelationsByTaskId emits', () => {
        taskSuccessorRelationsSubject.next(relations);

        expect(comp.taskSuccessorRelations).toBe(relations);
    });

    it('should set work days after ngOnInit', () => {
        comp.ngOnInit();

        expect(comp.workDays).toEqual(MOCK_WORK_DAYS);
    });

    it('should set news on initialization when there are news', () => {
        spyOn(taskCardModelHelper, 'fromTaskWithScopeNewsAndDescriptionType');
        when(newsQueriesMock.observeItemsByIdentifierPair(anything())).thenReturn(of(MOCK_NEWS_ITEMS));
        comp.ngOnInit();

        expect(taskCardModelHelper.fromTaskWithScopeNewsAndDescriptionType)
            .toHaveBeenCalledWith(task, calendarScope, taskCardDescriptionType, MOCK_NEWS_ITEMS);
    });

    it('should not have news on initialization when there are no news', () => {
        spyOn(taskCardModelHelper, 'fromTaskWithScopeNewsAndDescriptionType');
        comp.ngOnInit();

        expect(taskCardModelHelper.fromTaskWithScopeNewsAndDescriptionType)
            .toHaveBeenCalledWith(task, calendarScope, taskCardDescriptionType, []);
    });

    it('should render hasNews marker when there are news', () => {
        comp.showUnreadNews = true;
        when(taskCardModelHelperMock.fromTaskWithScopeNewsAndDescriptionType(anything(), anything(), anything(), anything())).thenReturn(
            {...taskCardWeekModel, hasNews: true}
        );

        comp.ngOnInit();
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationHasNewsMarkerSelector).properties.isVisible).toBe(true);
    });

    it('should not render hasNews marker when there are news but showUnreadNews is false', () => {
        comp.showUnreadNews = false;

        when(taskCardModelHelperMock.fromTaskWithScopeNewsAndDescriptionType(anything(), anything(), anything(), anything())).thenReturn(
            {...taskCardWeekModel, hasNews: true}
        );

        comp.ngOnInit();
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationHasNewsMarkerSelector).properties.isVisible).toBe(false);
    });

    it('should not render hasNews marker when there are no news', () => {
        when(taskCardModelHelperMock.fromTaskWithScopeNewsAndDescriptionType(anything(), anything(), anything(), anything())).thenReturn(
            {...taskCardWeekModel, hasNews: false}
        );

        comp.ngOnInit();
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationHasNewsMarkerSelector).properties.isVisible).toBe(false);
    });

    describe('Task Card Week Component - Resize', () => {

        it('should not render left resize handle when task continues to left', () => {
            comp.calendarScope = {
                start: calendarDateAtMiddleOfTask,
                end: calendarDateAtMiddleOfTask.clone().add(1, 'd'),
            };
            comp.ngOnInit();
            fixture.detectChanges();

            expect(getElement(dataAutomationResizeLeftHandleSelector)).toBeNull();
        });

        it('should not render right resize handle when task continues to right', () => {
            comp.calendarScope = {
                start: calendarDateAtMiddleOfTask.clone().subtract(1, 'd'),
                end: calendarDateAtMiddleOfTask,
            };
            comp.ngOnInit();
            fixture.detectChanges();

            expect(getElement(dataAutomationResizeRightHandleSelector)).toBeNull();
        });

        it('should not render resize handles when users does not have permission to update schedule', () => {
            const newCalendarScope = {...calendarScope};
            const newTaskCardWeekModel: TaskCardWeekModel = {
                ...taskCardWeekModel,
                permissions: taskWithoutPermissionToEditSchedule.schedule.permissions,
            };

            when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(taskWithoutPermissionToEditSchedule));
            when(taskCardModelHelperMock.fromTaskWithScopeNewsAndDescriptionType(
                taskWithoutPermissionToEditSchedule, newCalendarScope, taskCardDescriptionType, anything()))
                .thenReturn(newTaskCardWeekModel);

            comp.calendarScope = newCalendarScope;

            comp.ngOnInit();
            fixture.detectChanges();

            expect(getElement(dataAutomationResizeLeftHandleSelector)).toBeNull();
            expect(getElement(dataAutomationResizeRightHandleSelector)).toBeNull();
        });

        it('should render resize handles when users has permission to update schedule', () => {
            when(projectTaskQueries.observeTaskById(taskId)).thenReturn(of(task));
            comp.calendarScope = {
                start: calendarStart,
                end: calendarEnd,
            };

            comp.ngOnInit();
            fixture.detectChanges();

            expect(getElement(dataAutomationResizeLeftHandleSelector)).not.toBeNull();
            expect(getElement(dataAutomationResizeRightHandleSelector)).not.toBeNull();
        });

        it('should add resizing CSS class when resize starts', () => {
            comp.handleResizeStarted(false);

            expect(comp.cardClasses[CSS_CLASS_CARD_IS_RESIZING]).toBeTruthy();
        });

        it('should remove resizing CSS class when resize end', () => {
            comp.handleResizeStarted(false);

            expect(comp.cardClasses[CSS_CLASS_CARD_IS_RESIZING]).toBeTruthy();

            comp.handleResizeEnded(dragEndEvent);

            expect(comp.cardClasses[CSS_CLASS_CARD_IS_RESIZING]).toBeFalsy();
        });

        it('should snap when moving distance is less or equal to snap threshold, when resizing on start', () => {
            const bigWeekWidth = (RESIZE_SNAP_THRESHOLD * 3) * NUMBER_OF_DAYS_PER_WEEK;
            const movingDistance = RESIZE_SNAP_THRESHOLD;
            const expectedCardStyles = {
                width: 'calc(100% - 0px)',
                transform: 'translate3d(0px, 0, 0)',
            };
            const expectedFooterStyles = {
                transform: 'translate3d(0px, 0, 0)',
            };

            comp.weekWidth = bigWeekWidth;
            comp.expandedWeeks = [];

            comp.handleResizeStarted(false);
            comp.handleResizeLeft(getDragMoveEvent(movingDistance));

            expect(comp.cardStyles).toEqual(expectedCardStyles);
            expect(comp.footerStyles).toEqual(expectedFooterStyles);

            comp.handleResizeEnded(dragEndEvent);

            expect(comp.cardStyles).toEqual({});
            expect(comp.footerStyles).toEqual({});
        });

        it('should not snap when moving distance is above snap threshold, when resizing on start', () => {
            const bigWeekWidth = (RESIZE_SNAP_THRESHOLD * 3) * NUMBER_OF_DAYS_PER_WEEK;
            const movingDistance = RESIZE_SNAP_THRESHOLD + 1;
            const expectedCardStyles = {
                width: `calc(100% - ${movingDistance}px)`,
                transform: `translate3d(${movingDistance}px, 0, 0)`,
            };
            const expectedFooterStyles = {
                transform: `translate3d(${movingDistance * -1}px, 0, 0)`,
            };

            comp.weekWidth = bigWeekWidth;
            comp.expandedWeeks = [];

            comp.handleResizeStarted(false);
            comp.handleResizeLeft(getDragMoveEvent(movingDistance));

            expect(comp.cardStyles).toEqual(expectedCardStyles);
            expect(comp.footerStyles).toEqual(expectedFooterStyles);

            comp.handleResizeEnded(dragEndEvent);

            expect(comp.cardStyles).toEqual({});
            expect(comp.footerStyles).toEqual({});
        });

        it('should snap when moving distance is less or equal to snap threshold, when resizing on end', () => {
            const bigWeekWidth = (RESIZE_SNAP_THRESHOLD * 3) * NUMBER_OF_DAYS_PER_WEEK;
            const movingDistance = expandedWeekWidth;
            const expectedResult = {
                width: `calc(100% + ${expandedWeekWidth + weekSpacer}px)`,
            };
            const weekAfterTaskEnd = moment(task.schedule.end).startOf('week').add(1, 'w');

            when(dateParserStrategyMock.isSame(weekAfterTaskEnd, anything(), 'w')).thenReturn(true);
            when(dateParserStrategyMock.endOfWeek(anything())).thenReturn(moment(task.schedule.end).endOf('week'));

            comp.weekWidth = bigWeekWidth;
            comp.expandedWeeks = [weekAfterTaskEnd];

            comp.handleResizeStarted(true);
            comp.handleResizeRight(getDragMoveEvent(movingDistance));

            expect(comp.cardStyles).toEqual(expectedResult);

            comp.handleResizeEnded(dragEndEvent);

            expect(comp.cardStyles).toEqual({});
        });

        it('should not snap when moving distance is above snap threshold, when resizing on end', () => {
            const bigWeekWidth = (RESIZE_SNAP_THRESHOLD * 3) * NUMBER_OF_DAYS_PER_WEEK;
            const movingDistance = -RESIZE_SNAP_THRESHOLD - 1;
            const expectedResult = {
                width: `calc(100% + ${movingDistance}px)`,
            };

            const weekAfterTaskEnd = moment(task.schedule.end).startOf('week').add(1, 'w');
            comp.weekWidth = bigWeekWidth;
            comp.expandedWeeks = [weekAfterTaskEnd];

            comp.handleResizeStarted(true);
            comp.handleResizeRight(getDragMoveEvent(movingDistance));

            expect(comp.cardStyles).toEqual(expectedResult);

            comp.handleResizeEnded(dragEndEvent);

            expect(comp.cardStyles).toEqual({});
        });

        it('should cancel the resize and not dispatch the resize action when resize is canceled by pressing Escape', () => {
            const movingDistance = 150;
            const expectedStart = moment(task.schedule.start).startOf('week').add(1, 'w');
            const expectedEnd = moment(task.schedule.end);
            const payload = new ProjectTaskActions.Resize.One({
                taskId: task.id,
                start: expectedStart,
                end: expectedEnd,
            });

            spyOn(document, 'dispatchEvent').and.callThrough();

            comp.handleResizeStarted(false);
            comp.handleResizeLeft(getDragMoveEvent(movingDistance));

            sendKeyUp(KeyEnum.Escape);

            comp.handleResizeEnded(dragEndEvent);

            expect(store.dispatch).not.toHaveBeenCalledWith(payload);
            expect(document.dispatchEvent).toHaveBeenCalledWith(new Event('mouseup'));
        });

        it('should emit isResizing with TRUE when handleResizeStarted is called', () => {
            spyOn(comp.isResizing, 'emit').and.callThrough();

            comp.handleResizeStarted(false);

            expect(comp.isResizing.emit).toHaveBeenCalledWith(true);
        });

        it('should emit isResizing with FALSE when handleResizeEnded is called', () => {
            spyOn(comp.isResizing, 'emit').and.callThrough();

            comp.handleResizeStarted(false);
            comp.handleResizeEnded(dragEndEvent);

            expect(comp.isResizing.emit).toHaveBeenCalledWith(false);
        });

        it('should open tooltip flyout when handleResizeStarted is called', () => {
            spyOn(flyoutService, 'open').and.callThrough();

            comp.handleResizeStarted(false);

            expect(flyoutService.open).toHaveBeenCalledWith(comp.taskCardWeekId);
        });

        it('should close tooltip flyout when handleResizeEnded is called', () => {
            spyOn(flyoutService, 'close').and.callThrough();

            comp.handleResizeStarted(false);
            comp.handleResizeEnded(dragEndEvent);

            expect(flyoutService.close).toHaveBeenCalledWith(comp.taskCardWeekId);
        });

        it('should not show shift amount label when resize amount is 0', () => {
            comp.handleResizeStarted(false);

            expect(getDocumentElement(dataAutomationShiftAmountSelector)).toBeFalsy();
        });

        it('should show shift amount label when resize amount is not 0', () => {
            const movingDays = 2;
            const movingDistance = defaultDayWidth * movingDays;

            comp.handleResizeStarted(true);
            comp.handleResizeRight(getDragMoveEvent(movingDistance));

            fixture.detectChanges();

            expect(getDocumentElement(dataAutomationShiftAmountSelector)).toBeTruthy();
        });

        it('should send negative resize amount to the pipe when shortening task on the start', () => {
            const movingDays = 2;
            const expectedResizeAmount = -2;
            const movingDistance = defaultDayWidth * movingDays;

            comp.handleResizeStarted(false);
            comp.handleResizeLeft(getDragMoveEvent(movingDistance));

            fixture.detectChanges();

            expect(getDocumentElement(dataAutomationShiftAmountSelector).innerText.trim()).toBe(expectedResizeAmount.toString());
        });

        it('should send positive resize amount to the pipe when extending task on the start', () => {
            const movingDays = 2;
            const expectedResizeAmount = 2;
            const movingDistance = -defaultDayWidth * movingDays;

            comp.handleResizeStarted(false);
            comp.handleResizeLeft(getDragMoveEvent(movingDistance));

            fixture.detectChanges();

            expect(getDocumentElement(dataAutomationShiftAmountSelector).innerText.trim()).toBe(expectedResizeAmount.toString());
        });

        it('should send negative resize amount to the pipe when shortening task on the end', () => {
            const movingDays = 2;
            const expectedResizeAmount = -2;
            const movingDistance = -defaultDayWidth * movingDays;

            comp.handleResizeStarted(true);
            comp.handleResizeRight(getDragMoveEvent(movingDistance));

            fixture.detectChanges();

            expect(getDocumentElement(dataAutomationShiftAmountSelector).innerText.trim()).toBe(expectedResizeAmount.toString());
        });

        it('should send positive resize amount to the pipe when extending task on the end', () => {
            const movingDays = 2;
            const expectedResizeAmount = 2;
            const movingDistance = defaultDayWidth * movingDays;

            comp.handleResizeStarted(true);
            comp.handleResizeRight(getDragMoveEvent(movingDistance));

            fixture.detectChanges();

            expect(getDocumentElement(dataAutomationShiftAmountSelector).innerText.trim()).toBe(expectedResizeAmount.toString());
        });

        describe('Task Card Week Component - Resize - Day view mode', () => {
            beforeEach(() => {
                comp.taskViewMode = TaskCalendarTaskViewModeEnum.Day;
            });

            describe('Task Card Week Component - Resize - Day view mode - Collapsed weeks', () => {
                beforeEach(() => {
                    comp.expandedWeeks = [];
                });

                it('should shorten task on the start by 2 days when task starts at the start of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = defaultDayWidth * dayDiff;
                    const expectedStart = moment(task.schedule.start).add(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should shorten task on the start by 2 days when task does not start at the start of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = defaultDayWidth * dayDiff;
                    const newStart = moment(task.schedule.start).add(3, 'd');
                    const expectedStart = moment(newStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).add(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({start: newStart});

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the start by 2 days when task starts at the start of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = -((defaultDayWidth * dayDiff) + weekSpacer);
                    const expectedStart = moment(task.schedule.start).subtract(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the start by 4 days when task does not start at the start of the week', () => {
                    const dayDiffFromStartOfWeek = 3;
                    const dayDiff = 4;
                    const movingDistance = -((defaultDayWidth * dayDiff) + weekSpacer);
                    const newStart = moment(task.schedule.start).add(dayDiffFromStartOfWeek, 'd');
                    const expectedStart = moment(newStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).subtract(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({start: newStart});

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should shorten task on the end by 2 days when task ends at the end of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = -defaultDayWidth * dayDiff;
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(task.schedule.end).subtract(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should shorten task on the end by 2 days when task does not end at the end of the week', () => {
                    const dayDiffFromStartOfWeek = 3;
                    const dayDiff = 2;
                    const movingDistance = -defaultDayWidth * dayDiff;
                    const newEnd = moment(task.schedule.end).subtract(dayDiffFromStartOfWeek, 'd');
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(newEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).subtract(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({end: newEnd});

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the end by 2 days when task ends at the end of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = (defaultDayWidth * dayDiff) + weekSpacer;
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(task.schedule.end).add(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the end by 2 days when task does not end at the end of the week', () => {
                    const dayDiffFromStartOfWeek = 3;
                    const dayDiff = 2;
                    const movingDistance = defaultDayWidth * dayDiff;
                    const newEnd = moment(task.schedule.end).subtract(dayDiffFromStartOfWeek, 'd');
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(newEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).add(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({end: newEnd});

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });
            });

            describe('Task Card Week Component - Resize - Day view mode - Expanded weeks', () => {
                beforeEach(() => {
                    comp.expandedWeeks = [expandedWeekBelongingToTask, expandedWeekBelongingToTask2];
                });

                it('should shorten task on the start by 2 days when task starts at the start of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = defaultExpandedDayWidth * dayDiff;
                    const expectedStart = moment(task.schedule.start).add(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should shorten task on the start by 2 days when task does not start at the start of the week', () => {
                    const dayDiffFromStartOfWeek = 3;
                    const dayDiff = 2;
                    const movingDistance = defaultExpandedDayWidth * dayDiff;
                    const newStart = moment(task.schedule.start).add(dayDiffFromStartOfWeek, 'd');
                    const expectedStart = moment(newStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).add(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({start: newStart});

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the start by 2 days when task starts at the start of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = -((defaultDayWidth * dayDiff) + weekSpacer);
                    const expectedStart = moment(task.schedule.start).subtract(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the start by 4 days when task does not start at the start of the week', () => {
                    const dayDiffFromStartOfWeek = 2;
                    const dayDiff = 4;
                    const movingDaysCurrentWeek = 2;
                    const movingDaysPreviousWeek = 2;
                    const movingDistanceCurrentWeek = -(defaultExpandedDayWidth * movingDaysCurrentWeek);
                    const movingDistancePreviousWeek = -(defaultDayWidth * movingDaysPreviousWeek);
                    const movingDistance = (movingDistanceCurrentWeek + movingDistancePreviousWeek) - weekSpacer;
                    const newStart = moment(task.schedule.start).add(dayDiffFromStartOfWeek, 'd');
                    const expectedStart = moment(newStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).subtract(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({start: newStart});

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should shorten task on the end by 2 days when task ends at the end of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = -(defaultExpandedDayWidth * dayDiff);
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(task.schedule.end).subtract(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should shorten task on the end by 2 days when task does not end at the end of the week', () => {
                    const dayDiffFromStartOfWeek = 3;
                    const dayDiff = 2;
                    const movingDistance = -(defaultExpandedDayWidth * dayDiff);
                    const newEnd = moment(task.schedule.end).subtract(dayDiffFromStartOfWeek, 'd');
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(newEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).subtract(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({end: newEnd});

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the end by 2 days when task ends at the end of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = (defaultDayWidth * dayDiff) + weekSpacer;
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(task.schedule.end).add(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the end by 4 days when task does not end at the end of the week', () => {
                    const dayDiffFromStartOfWeek = 2;
                    const dayDiff = 4;
                    const movingDaysCurrentWeek = 2;
                    const movingDaysPreviousWeek = 2;
                    const movingDistanceCurrentWeek = defaultExpandedDayWidth * movingDaysCurrentWeek;
                    const movingDistancePreviousWeek = defaultDayWidth * movingDaysPreviousWeek;
                    const movingDistance = movingDistanceCurrentWeek + movingDistancePreviousWeek + weekSpacer;
                    const newEnd = moment(task.schedule.end).subtract(dayDiffFromStartOfWeek, 'd');
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(newEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).add(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({end: newEnd});

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });
            });

            it('should not resize when resize amount is 0', () => {
                const movingDistance = 5;

                comp.handleResizeStarted(true);
                comp.handleResizeRight(getDragMoveEvent(movingDistance));
                comp.handleResizeEnded(dragEndEvent);

                expect(store.dispatch).not.toHaveBeenCalled();
            });

            it('should not shorten task to less than one day when resizing on the end and task starts at the start of the week', () => {
                const taskDuration = moment(task.schedule.end).diff(moment(task.schedule.start), 'd');
                const movingDays = taskDuration + 1;
                const movingDistance = -defaultDayWidth * movingDays;
                const expectedStart = moment(task.schedule.start);
                const expectedEnd = moment(task.schedule.end).subtract(taskDuration, 'd');
                const payload = new ProjectTaskActions.Resize.One({
                    taskId: task.id,
                    start: expectedStart,
                    end: expectedEnd,
                });

                comp.handleResizeStarted(true);
                comp.handleResizeRight(getDragMoveEvent(movingDistance));
                comp.handleResizeEnded(dragEndEvent);

                expect(store.dispatch).toHaveBeenCalledWith(payload);
            });

            it('should not shorten task to less than one day when resizing on the end and ' +
                'task starts 2 days after the start of the week', () => {
                const newStart = moment(task.schedule.start).add(2, 'd');
                const taskDuration = moment(task.schedule.end).diff(newStart, 'd');
                const movingDays = taskDuration + 1;
                const movingDistance = -defaultDayWidth * movingDays;
                const expectedStart = moment(newStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT));
                const expectedEnd = moment(task.schedule.end).subtract(taskDuration, 'd');
                const payload = new ProjectTaskActions.Resize.One({
                    taskId: task.id,
                    start: expectedStart,
                    end: expectedEnd,
                });

                updateTaskSchedule({start: newStart});

                comp.handleResizeStarted(true);
                comp.handleResizeRight(getDragMoveEvent(movingDistance));
                comp.handleResizeEnded(dragEndEvent);

                expect(store.dispatch).toHaveBeenCalledWith(payload);
            });

            it('should not shorten task to less than one day when resizing on the start and task ends at the end of the week', () => {
                const taskDuration = moment(task.schedule.end).diff(moment(task.schedule.start), 'd');
                const movingDays = taskDuration + 1;
                const movingDistance = defaultDayWidth * movingDays;
                const expectedStart = moment(task.schedule.start).add(taskDuration, 'd');
                const expectedEnd = moment(task.schedule.end);
                const payload = new ProjectTaskActions.Resize.One({
                    taskId: task.id,
                    start: expectedStart,
                    end: expectedEnd,
                });

                comp.handleResizeStarted(false);
                comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                comp.handleResizeEnded(dragEndEvent);

                expect(store.dispatch).toHaveBeenCalledWith(payload);
            });

            it('should not shorten task to less than one day when resizing on the start and ' +
                'task ends 2 days before the end of the week', () => {
                const newEnd = moment(task.schedule.end).subtract(2, 'd');
                const taskDuration = moment(newEnd).diff(task.schedule.start, 'd');
                const movingDays = taskDuration + 1;
                const movingDistance = defaultDayWidth * movingDays;
                const expectedStart = moment(task.schedule.start).add(taskDuration, 'd');
                const expectedEnd = moment(newEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT));
                const payload = new ProjectTaskActions.Resize.One({
                    taskId: task.id,
                    start: expectedStart,
                    end: expectedEnd,
                });

                updateTaskSchedule({end: newEnd});

                comp.handleResizeStarted(false);
                comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                comp.handleResizeEnded(dragEndEvent);

                expect(store.dispatch).toHaveBeenCalledWith(payload);
            });

        });

        describe('Task Card Week Component - Resize - Week view mode', () => {
            beforeEach(() => {
                comp.taskViewMode = TaskCalendarTaskViewModeEnum.Week;
            });

            describe('Task Card Week Component - Resize - Week view mode - Collapsed weeks', () => {
                beforeEach(() => {
                    comp.expandedWeeks = [];
                });

                it('should shorten task on the start by 2 days when task starts at the start of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = defaultDayWidth * dayDiff;
                    const expectedStart = moment(task.schedule.start).add(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should shorten task on the start by 2 days when task starts 2 days after the start of the week', () => {
                    const dayDiffFromStartOfWeek = 2;
                    const dayDiff = 2;
                    const movingDistance = defaultDayWidth * (dayDiff + dayDiffFromStartOfWeek);
                    const newStart = moment(task.schedule.start).add(dayDiffFromStartOfWeek, 'd');
                    const expectedStart = moment(newStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).add(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({start: newStart});

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the start by 2 days when task starts at the start of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = -((defaultDayWidth * dayDiff) + weekSpacer);
                    const expectedStart = moment(task.schedule.start).subtract(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the start by 1 day when task does not start at the start of the week', () => {
                    const dayDiffFromStartOfWeek = 2;
                    const dayDiff = 1;
                    const movingDistance = defaultDayWidth * dayDiff;
                    const newStart = moment(task.schedule.start).add(dayDiffFromStartOfWeek, 'd');
                    const expectedStart = moment(newStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).subtract(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({start: newStart});

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the start by 2 days when task starts 2 days before the start of the week ' +
                    'and handler is not moved', () => {
                    const dayDiffFromStartOfWeek = 2;
                    const dayDiff = 2;
                    const movingDistance = 0;
                    const newStart = moment(task.schedule.start).add(dayDiffFromStartOfWeek, 'd');
                    const expectedStart = moment(newStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).subtract(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({start: newStart});

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should not shorten task on the start when task starts 2 days after the start of the week and handler is moved ' +
                    'to the actual task start', () => {
                    const dayDiffFromStartOfWeek = 2;
                    const dayDiff = 2;
                    const movingDistance = defaultDayWidth * dayDiff;
                    const newStart = moment(task.schedule.start).add(dayDiffFromStartOfWeek, 'd');

                    updateTaskSchedule({start: newStart});

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).not.toHaveBeenCalled();
                });

                it('should shorten task on the end by 2 days when task ends at the end of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = -(defaultDayWidth * dayDiff);
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(task.schedule.end).subtract(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should shorten task on the end by 2 days when task ends 2 days before the end of the week', () => {
                    const dayDiffFromEndOfWeek = 2;
                    const dayDiff = 2;
                    const movingDistance = defaultDayWidth * -(dayDiff + dayDiffFromEndOfWeek);
                    const newEnd = moment(task.schedule.end).subtract(dayDiffFromEndOfWeek, 'd');
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(newEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).subtract(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({end: newEnd});

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the end by 2 days when task ends at the end of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = (defaultDayWidth * dayDiff) + weekSpacer;
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(task.schedule.end).add(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the end by 1 day when task does not end at the end of the week', () => {
                    const dayDiffFromEndOfWeek = 2;
                    const dayDiff = 1;
                    const movingDistance = -defaultDayWidth * dayDiff;
                    const newEnd = moment(task.schedule.end).subtract(dayDiffFromEndOfWeek, 'd');
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(newEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).add(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({end: newEnd});

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should not extend task on the end when task starts 2 days before the end of the week and handler is moved ' +
                    'to the actual task end', () => {
                    const dayDiffFromEndOfWeek = 2;
                    const dayDiff = 2;
                    const movingDistance = -defaultDayWidth * dayDiff;
                    const newEnd = moment(task.schedule.end).subtract(dayDiffFromEndOfWeek, 'd');

                    updateTaskSchedule({end: newEnd});

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).not.toHaveBeenCalled();
                });
            });

            describe('Task Card Week Component - Resize - Week view mode - Expanded weeks', () => {
                beforeEach(() => {
                    comp.expandedWeeks = [expandedWeekBelongingToTask, expandedWeekBelongingToTask2];
                });

                it('should shorten task on the start by 2 days when task starts at the start of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = defaultExpandedDayWidth * dayDiff;
                    const expectedStart = moment(task.schedule.start).add(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should shorten task on the start by 2 days when task starts 2 days after the start of the week', () => {
                    const dayDiffFromStartOfWeek = 2;
                    const dayDiff = 2;
                    const movingDistance = defaultExpandedDayWidth * (dayDiff + dayDiffFromStartOfWeek);
                    const newStart = moment(task.schedule.start).add(dayDiffFromStartOfWeek, 'd');
                    const expectedStart = moment(newStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).add(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({start: newStart});

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the start by 2 days when task starts at the start of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = -((defaultDayWidth * dayDiff) + weekSpacer);
                    const expectedStart = moment(task.schedule.start).subtract(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the start by 4 days when task starts 2 days after the start of the week', () => {
                    const dayDiffFromStartOfWeek = 2;
                    const dayDiff = 4;
                    const movingDays = 2;
                    const movingDistance = -((defaultDayWidth * movingDays) + weekSpacer);
                    const newStart = moment(task.schedule.start).add(dayDiffFromStartOfWeek, 'd');
                    const expectedStart = moment(newStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).subtract(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({start: newStart});

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the start by 2 days when task starts 2 days after the start of the week ' +
                    'and handler is not moved', () => {
                    const dayDiffFromStartOfWeek = 2;
                    const dayDiff = 2;
                    const movingDistance = 0;
                    const newStart = moment(task.schedule.start).add(dayDiffFromStartOfWeek, 'd');
                    const expectedStart = moment(newStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).subtract(dayDiff, 'd');
                    const expectedEnd = moment(task.schedule.end);
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({start: newStart});

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should not shorten task on the start when task starts 2 days after the start of the week and handler is moved ' +
                    'to the actual task start', () => {
                    const dayDiffFromStartOfWeek = 2;
                    const movingDays = 2;
                    const movingDistance = defaultExpandedDayWidth * movingDays;
                    const newStart = moment(task.schedule.start).add(dayDiffFromStartOfWeek, 'd');

                    updateTaskSchedule({start: newStart});

                    comp.handleResizeStarted(false);
                    comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).not.toHaveBeenCalled();
                });

                it('should shorten task on the end by 2 days when task ends at the end of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = -(defaultExpandedDayWidth * dayDiff);
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(task.schedule.end).subtract(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should shorten task on the end by 1 day when task ends 2 days before the end of the week', () => {
                    const dayDiffFromEndOfWeek = 2;
                    const dayDiff = 1;
                    const movingDays = 3;
                    const movingDistance = -defaultExpandedDayWidth * movingDays;
                    const newEnd = moment(task.schedule.end).subtract(dayDiffFromEndOfWeek, 'd');
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(newEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).subtract(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({end: newEnd});

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the end by 2 days when task ends at the end of the week', () => {
                    const dayDiff = 2;
                    const movingDistance = (defaultDayWidth * dayDiff) + weekSpacer;
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(task.schedule.end).add(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should extend task on the end by 1 day when task ends 2 days after the end of the week', () => {
                    const dayDiffFromEndOfWeek = 2;
                    const dayDiff = 1;
                    const movingDays = 1;
                    const movingDistance = -defaultExpandedDayWidth * movingDays;
                    const newEnd = moment(task.schedule.end).subtract(dayDiffFromEndOfWeek, 'd');
                    const expectedStart = moment(task.schedule.start);
                    const expectedEnd = moment(newEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT)).add(dayDiff, 'd');
                    const payload = new ProjectTaskActions.Resize.One({
                        taskId: task.id,
                        start: expectedStart,
                        end: expectedEnd,
                    });

                    updateTaskSchedule({end: newEnd});

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).toHaveBeenCalledWith(payload);
                });

                it('should not extend task on the end when task starts 2 days before the end of the week and handler is moved ' +
                    'to the actual task end', () => {
                    const dayDiffFromEndOfWeek = 2;
                    const movingDays = 2;
                    const movingDistance = -defaultExpandedDayWidth * movingDays;
                    const newEnd = moment(task.schedule.end).subtract(dayDiffFromEndOfWeek, 'd');

                    updateTaskSchedule({end: newEnd});

                    comp.handleResizeStarted(true);
                    comp.handleResizeRight(getDragMoveEvent(movingDistance));
                    comp.handleResizeEnded(dragEndEvent);

                    expect(store.dispatch).not.toHaveBeenCalled();
                });
            });

            it('should not resize when resize amount is 0', () => {
                const movingDistance = 5;

                comp.handleResizeStarted(true);
                comp.handleResizeRight(getDragMoveEvent(movingDistance));
                comp.handleResizeEnded(dragEndEvent);

                expect(store.dispatch).not.toHaveBeenCalled();
            });

            it('should not shorten task to less than one day when resizing on the end and task starts at the start of the week', () => {
                const taskDuration = moment(task.schedule.end).diff(moment(task.schedule.start), 'd');
                const movingDays = taskDuration + 1;
                const movingDistance = -defaultDayWidth * movingDays;
                const expectedStart = moment(task.schedule.start);
                const expectedEnd = moment(task.schedule.end).subtract(taskDuration, 'd');
                const payload = new ProjectTaskActions.Resize.One({
                    taskId: task.id,
                    start: expectedStart,
                    end: expectedEnd,
                });

                comp.handleResizeStarted(true);
                comp.handleResizeRight(getDragMoveEvent(movingDistance));
                comp.handleResizeEnded(dragEndEvent);

                expect(store.dispatch).toHaveBeenCalledWith(payload);
            });

            it('should not shorten task to less than one day when resizing on the end and ' +
                'task starts 2 days after the start of the week', () => {
                const newStart = moment(task.schedule.start).add(2, 'd');
                const taskDuration = moment(task.schedule.end).diff(newStart, 'd');
                const movingDays = taskDuration + 1;
                const movingDistance = -defaultDayWidth * movingDays;
                const expectedStart = moment(newStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT));
                const expectedEnd = moment(task.schedule.end).subtract(taskDuration, 'd');
                const payload = new ProjectTaskActions.Resize.One({
                    taskId: task.id,
                    start: expectedStart,
                    end: expectedEnd,
                });

                updateTaskSchedule({start: newStart});

                comp.handleResizeStarted(true);
                comp.handleResizeRight(getDragMoveEvent(movingDistance));
                comp.handleResizeEnded(dragEndEvent);

                expect(store.dispatch).toHaveBeenCalledWith(payload);
            });

            it('should not shorten task to less than one day when resizing on the start and task ends at the end of the week', () => {
                const taskDuration = moment(task.schedule.end).diff(moment(task.schedule.start), 'd');
                const movingDays = taskDuration + 1;
                const movingDistance = defaultDayWidth * movingDays;
                const expectedStart = moment(task.schedule.start).add(taskDuration, 'd');
                const expectedEnd = moment(task.schedule.end);
                const payload = new ProjectTaskActions.Resize.One({
                    taskId: task.id,
                    start: expectedStart,
                    end: expectedEnd,
                });

                comp.handleResizeStarted(false);
                comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                comp.handleResizeEnded(dragEndEvent);

                expect(store.dispatch).toHaveBeenCalledWith(payload);
            });

            it('should not shorten task to less than one day when resizing on the start and ' +
                'task ends 2 days before the end of the week', () => {
                const newEnd = moment(task.schedule.end).subtract(2, 'd');
                const taskDuration = moment(newEnd).diff(task.schedule.start, 'd');
                const movingDays = taskDuration + 1;
                const movingDistance = defaultDayWidth * movingDays;
                const expectedStart = moment(task.schedule.start).add(taskDuration, 'd');
                const expectedEnd = moment(newEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT));
                const payload = new ProjectTaskActions.Resize.One({
                    taskId: task.id,
                    start: expectedStart,
                    end: expectedEnd,
                });

                updateTaskSchedule({end: newEnd});

                comp.handleResizeStarted(false);
                comp.handleResizeLeft(getDragMoveEvent(movingDistance));
                comp.handleResizeEnded(dragEndEvent);

                expect(store.dispatch).toHaveBeenCalledWith(payload);
            });
        });
    });
});
