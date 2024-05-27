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
    SimpleChange
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {
    difference,
    flatten,
    range
} from 'lodash';
import * as moment from 'moment';
import {
    BehaviorSubject,
    of,
    Subject
} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_WORK_DAYS} from '../../../../../test/mocks/workdays';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {CursorClassEnum} from '../../../../shared/misc/enums/cursor-class.enum';
import {KeyEnum} from '../../../../shared/misc/enums/key.enum';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {WeekDaysEnum} from '../../../../shared/misc/enums/weekDays.enum';
import {
    KeyboardHelper,
    KeyboardShortcutEnum
} from '../../../../shared/misc/helpers/keyboard.helper';
import {UUID} from '../../../../shared/misc/identification/uuid';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {CALENDAR_CONSTANTS} from '../../../../shared/ui/calendar/contants/calendar.contants';
import {COLORS} from '../../../../shared/ui/constants/colors.constant';
import {
    DateHelper,
    WEEK_DAYS_MOMENT_SORTED
} from '../../../../shared/ui/dates/date.helper.service';
import {DateParserStrategy} from '../../../../shared/ui/dates/date-parser.strategy';
import {FlyoutService} from '../../../../shared/ui/flyout/service/flyout.service';
import {
    WorkDaysHoliday,
    WorkDaysResource
} from '../../api/work-days/resources/work-days.resource';
import {
    DAY_CARD_STATUS_EMPTY,
    DAY_CARD_STATUS_UNAVAILABLE
} from '../../constants/day-card-indicators-icon.constant';
import {CalendarSelectionContextEnum} from '../../enums/calendar-selection-context.enum';
import {DayCardStatusEnum} from '../../enums/day-card-status.enum';
import {TaskCalendarTaskViewModeEnum} from '../../enums/task-calendar-task-view-mode.enum';
import {CalendarSelectionHelper} from '../../helpers/calendar-selection.helper';
import {DayCardDragHelper} from '../../helpers/day-card-drag.helper';
import {DayCardFocusSelectHelper} from '../../helpers/day-card-focus-helper.service';
import {ProjectDateParserStrategy} from '../../helpers/project-date-parser.strategy';
import {DayCard} from '../../models/day-cards/day-card';
import {CalendarSelectionActions} from '../../store/calendar/calendar-selection/calendar-selection.actions';
import {CALENDAR_SELECTION_SLICE_INITIAL_STATE} from '../../store/calendar/calendar-selection/calendar-selection.initial-state';
import {CalendarSelectionQueries} from '../../store/calendar/calendar-selection/calendar-selection.queries';
import {CalendarSelectionSlice} from '../../store/calendar/calendar-selection/calendar-selection.slice';
import {TaskCardWeekModel} from '../task-card-week/task-card-week.model.helper';
import {
    CSS_CLASS_SLOT_IS_NON_WORKING_DAY,
    DayCardMove,
    NUMBER_OF_DAYS_PER_WEEK,
    TaskDaycardsComponent
} from './task-daycards.component';

describe('Task Daycards Component', () => {
    let fixture: ComponentFixture<TaskDaycardsComponent>;
    let comp: TaskDaycardsComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let flyoutService: FlyoutService;
    let calendarSelectionHelper: CalendarSelectionHelper;
    let dayCardFocusHelper: DayCardFocusSelectHelper;
    let dayCardDragHelper: DayCardDragHelper;
    let store: jasmine.SpyObj<Store>;

    const defaultCalendarSelectionSlice: CalendarSelectionSlice = CALENDAR_SELECTION_SLICE_INITIAL_STATE;
    const calendarSelectionSliceIsMultiSelecting: CalendarSelectionSlice = {
        ...defaultCalendarSelectionSlice,
        isMultiSelecting: true,
    };
    const calendarSelectionSliceIsNotMultiSelecting: CalendarSelectionSlice = defaultCalendarSelectionSlice;

    const calendarSelectionQueriesMock: CalendarSelectionQueries = mock(CalendarSelectionQueries);
    const calendarSelectionHelperMock: CalendarSelectionHelper = mock(CalendarSelectionHelper);
    const dateParserStrategyMock: DateParserStrategy = mock(ProjectDateParserStrategy);
    const keyboardHelperMock: KeyboardHelper = mock(KeyboardHelper);
    const calendarSelectionSliceSubject$ = new Subject<CalendarSelectionSlice>();
    const calendarSelectionItemsSubject = new Subject<ObjectIdentifierPair[]>();
    const calendarSelectionItemsIdsByTypeSubject = new Subject<string[]>();
    const observeCanSelectItemTypeSubject = new BehaviorSubject<boolean>(true);
    const copyKeyPressedState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    const adjacentSelectionKeyPressedState$: Subject<boolean> = new Subject<boolean>();

    const classIsDragging = 'ss-task-daycards--dragging';

    function createTaskCardWeekModel(_start: string,
                                     _durationInDays: number,
                                     _calendarStart: string,
                                     _numberOfWeeks: number,
                                     _id = 'foo'): TaskCardWeekModel {
        const taskStart = moment(_start);
        const taskEnd = taskStart.clone().add(_durationInDays - 1, 'd');
        const calStart = moment(_calendarStart).clone().startOf('week');
        const calEnd = calStart.clone().add(_numberOfWeeks - 1, 'w').endOf('week');

        return {
            id: _id,
            title: null,
            status: null,
            description: null,
            solidColor: null,
            lightColor: null,
            permissions: null,
            constraints: null,
            statistics: null,
            start: taskStart,
            end: taskEnd,
            calendarStart: calStart,
            calendarEnd: calEnd,
            cardStart: moment.max(taskStart, calStart).clone().startOf('week'),
            cardEnd: moment.min(taskEnd, calEnd).clone().endOf('week'),
            hasNews: false,
        };
    }

    function createDayCards(...dates: string[]): DayCard[] {
        return dates.map(date => {
            const day = new DayCard();
            day.id = UUID.v4();
            day.date = moment(date).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
            day.status = DayCardStatusEnum.Open;
            day.task = new ResourceReference('foo', null);
            day.permissions = {
                canUpdate: true,
                canReset: true,
                canApprove: true,
                canComplete: true,
                canCancel: true,
                canDelete: true,
            };

            return day;
        });
    }

    const getDaysRange = (startDate: string, duration: number): string[] =>
        new Array(duration)
            .fill(moment(startDate))
            .map((day: moment.Moment, i) => day.clone().add(i, 'd').format('YYYY-MM-DD'));

    const dataAutomationWeeks = '[data-automation^="task-daycards-week-"]';
    const dataAutomationIndicators = '[data-automation="task-daycards-indicator"]';
    const dataAutomationSlots = '[data-automation="task-daycards-slot"]';
    const dataAutomationSlotsCreate = '[data-automation="task-daycards-slot-create"]';
    const dataAutomationTaskDayCards = '[data-automation="ss-task-daycards"]';
    const dataAutomationSlotsLocked = '[data-automation="task-daycards-slot-locked"]';
    const dataAutomationIconSlotsCreate = '[data-automation="task-daycards-icon-create"]';

    const start = '2020-01-01';
    const calendarStart = '2020-01-05';
    const numberOfWeeksInCalendar = 5;
    const durationInDays = 37;
    const expandedWeeks = ['2020-01-05', '2020-01-12'].map(date => moment(date).startOf('week'));
    const daycards = createDayCards('2020-01-05', '2020-01-18', '2020-01-19', '2020-01-20');
    const dayCardFlyoutId = 'bar';
    const fullWeekOfWorkingDays: WeekDaysEnum[] = [
        WeekDaysEnum.MONDAY,
        WeekDaysEnum.TUESDAY,
        WeekDaysEnum.WEDNESDAY,
        WeekDaysEnum.THURSDAY,
        WeekDaysEnum.FRIDAY,
        WeekDaysEnum.SATURDAY,
        WeekDaysEnum.SUNDAY,
    ];

    const cardTaskModel = createTaskCardWeekModel(start, durationInDays, calendarStart, numberOfWeeksInCalendar);

    const clickEvent: Event = new Event('click');
    const keyUpEvent: any = new Event('keyup');
    const getAllDropLists = (): any => Array.from(el.querySelectorAll('[id^="cdk-drop-list-"]')).map((element: HTMLElement) => element.id);
    const getElements = (selector: string): any => el.querySelectorAll(selector);
    const getElementCount = (selector: string): number => getElements(selector).length;
    const getDebugElements = (selector: string) => de.queryAll(By.css(selector));

    const clearFlyout = () => {
        if (flyoutService.isFlyoutOpen(dayCardFlyoutId)) {
            flyoutService.close(dayCardFlyoutId);
        }
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            DragDropModule,
        ],
        declarations: [TaskDaycardsComponent],
        providers: [
            {
                provide: CalendarSelectionHelper,
                useValue: instance(calendarSelectionHelperMock),
            },
            {
                provide: CalendarSelectionQueries,
                useValue: instance(calendarSelectionQueriesMock),
            },
            {
                provide: DateParserStrategy,
                useValue: instance(dateParserStrategyMock),
            },
            {
                provide: KeyboardHelper,
                useFactory: () => instance(keyboardHelperMock),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
        ],
    };

    when(dateParserStrategyMock.startOfWeek(anything())).thenCall((date: moment.Moment) => date.clone().startOf('w'));
    when(dateParserStrategyMock.endOfWeek(anything())).thenCall((date: moment.Moment) => date.clone().endOf('w'));
    expandedWeeks.forEach(expandedWeek =>
        when(dateParserStrategyMock.isSame(expandedWeek, anything(), 'w'))
            .thenCall((referenceWeek: moment.Moment, week: moment.Moment) => expandedWeek.isSame(week, 'w')));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskDaycardsComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        comp.isLoading = false;
        comp.showIndicators = true;
        comp.canEdit = true;
        comp.isCopying = false;
        comp.hasSelectedItems = false;
        comp.isMultiSelecting = false;
        comp.isCherryPicking = false;
        comp.isAdjacentSelecting = false;
        comp.canCreate = true;
        comp.dayCards = daycards;
        comp.expandedWeeks = expandedWeeks;
        comp.cardTaskModel = cardTaskModel;
        comp.workDays = MOCK_WORK_DAYS;

        comp.ngOnChanges({
            cardTaskModel: new SimpleChange(null, cardTaskModel, false),
            dayCards: new SimpleChange(null, daycards, false),
            expandedWeeks: new SimpleChange(null, expandedWeeks, false),
            workDays: new SimpleChange(null, MOCK_WORK_DAYS, false),
        });

        flyoutService = TestBed.inject(FlyoutService);
        calendarSelectionHelper = TestBed.inject(CalendarSelectionHelper);
        dayCardFocusHelper = TestBed.inject(DayCardFocusSelectHelper);
        dayCardDragHelper = TestBed.inject(DayCardDragHelper);
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        when(calendarSelectionQueriesMock.observeCalendarSelectionSlice()).thenReturn(calendarSelectionSliceSubject$);
        when(calendarSelectionQueriesMock.observeCalendarSelectionItems()).thenReturn(calendarSelectionItemsSubject);
        when(calendarSelectionQueriesMock.observeCalendarSelectionItemsIdsByType(ObjectTypeEnum.DayCard))
            .thenReturn(calendarSelectionItemsIdsByTypeSubject);
        when(calendarSelectionHelperMock.observeCanSelectItemType(ObjectTypeEnum.DayCard)).thenReturn(observeCanSelectItemTypeSubject);
        when(keyboardHelperMock.getShortcutPressedState(KeyboardShortcutEnum.Copy)).thenReturn(copyKeyPressedState$);
        when(keyboardHelperMock.getShortcutPressedState(KeyboardShortcutEnum.AdjacentSelect)).thenReturn(adjacentSelectionKeyPressedState$);

        store.dispatch.calls.reset();
        observeCanSelectItemTypeSubject.next(true);
        fixture.detectChanges();
    });

    afterEach((done) => {
        clearFlyout();
        done();
    });

    afterAll(() => {
        document.body.className = '';
    });

    it('should create component', () => {
        expect(comp).toBeDefined();
    });

    it('should render only the weeks in the calendar scope', () => {
        expect(comp.weeks.length).toBe(numberOfWeeksInCalendar);
        comp.weeks.forEach((week, index) => {
            const weekDate = week.slots[0].date.clone();
            const expectedDate = moment(calendarStart).add(index, 'w');

            expect(weekDate.isSame(expectedDate, 'week')).toBeTruthy();
        });
    });

    it('should only expand weeks that are expanded in the calendar scope', () => {
        expect(comp.weeks.length).toBe(numberOfWeeksInCalendar);
        comp.weeks.forEach(week => {
            const weekDate = week.slots[0].date.clone();
            const isExpanded = expandedWeeks.some(expandedWeek => expandedWeek.isSame(weekDate, 'week'));

            expect(week.expanded).toBe(isExpanded);
        });
    });

    it('should not show indicators and slots', () => {
        comp.expandedWeeks = [];
        comp.showIndicators = false;
        comp.ngOnChanges({expandedWeeks: new SimpleChange(null, [], false)});

        fixture.detectChanges();

        expect(getElementCount(dataAutomationSlots)).toBe(0);
        expect(getElementCount(dataAutomationIndicators)).toBe(0);
    });

    it('should show indicators and slots', () => {
        const expandedWeeksCount = expandedWeeks.length;
        const outOfScopeSlotsCount = cardTaskModel.end.clone().endOf('week').diff(cardTaskModel.end, 'd');
        const expectedSlotsCount = expandedWeeksCount * NUMBER_OF_DAYS_PER_WEEK;
        const expectedIndicatorsCount = ((numberOfWeeksInCalendar - expandedWeeksCount) * NUMBER_OF_DAYS_PER_WEEK) - outOfScopeSlotsCount;

        expect(getElementCount(dataAutomationSlots)).toBe(expectedSlotsCount);
        expect(getElementCount(dataAutomationIndicators)).toBe(expectedIndicatorsCount);
    });

    it('should define correct min-width for each week', () => {
        const {expandedWeekWidth, weekSpacer} = CALENDAR_CONSTANTS;
        const collapsedWeekWidth = 200;
        const expectExpandedWeekWidth = `${expandedWeekWidth + weekSpacer}px`;
        const expectCollapsedWeekWidth = `${collapsedWeekWidth + weekSpacer}px`;
        const expandedWeek = moment('2020-07-27');
        const cardTaskModelA = createTaskCardWeekModel('2020-07-27', 12, '2020-07-27', 6);

        when(dateParserStrategyMock.isSame(expandedWeek, anything(), 'w'))
            .thenCall((referenceWeek: moment.Moment, week: moment.Moment) => expandedWeek.isSame(week, 'w'));

        comp.cardTaskModel = cardTaskModelA;
        comp.expandedWeeks = [expandedWeek];
        comp.weekWidth = collapsedWeekWidth;
        comp.ngOnChanges({
            expandedWeeks: new SimpleChange(null, [expandedWeek], false),
            cardTaskModel: new SimpleChange(null, cardTaskModelA, false),
            weekWidth: new SimpleChange(null, collapsedWeekWidth, false),
        });

        fixture.detectChanges();

        const weeks = getDebugElements(dataAutomationWeeks);

        expect(weeks[0].styles['min-width']).toBe(expectExpandedWeekWidth);
        expect(weeks[1].styles['min-width']).toBe(expectCollapsedWeekWidth);
    });

    it('should define the correct min-width for each week when task start does not start in the beginning of the week and ' +
        `taskViewMode is set to ${TaskCalendarTaskViewModeEnum.Day}`, () => {
        const {expandedWeekWidth, weekSpacer} = CALENDAR_CONSTANTS;
        const startOfWeekDayOffset = 3;
        const collapsedWeekWidth = 200;
        const expandedWeekdayWidth = expandedWeekWidth / NUMBER_OF_DAYS_PER_WEEK;
        const weekDaysDiff = NUMBER_OF_DAYS_PER_WEEK - startOfWeekDayOffset;
        const expectExpandedWeekWidth = `${expandedWeekdayWidth * weekDaysDiff + weekSpacer}px`;
        const expectCollapsedWeekWidth = `${collapsedWeekWidth + weekSpacer}px`;
        const cardStart = moment().startOf('w');
        const taskStart = cardStart.clone().add(startOfWeekDayOffset, 'd');
        const taskEnd = taskStart.clone().add(1, 'w').endOf('w');
        const cardEnd = taskEnd.clone();
        const expandedWeek = cardStart;
        const newCardTaskModel: TaskCardWeekModel = {
            ...cardTaskModel,
            cardStart,
            cardEnd,
            start: taskStart,
            end: taskEnd,
        };

        when(dateParserStrategyMock.isSame(expandedWeek, anything(), 'w'))
            .thenCall((referenceWeek: moment.Moment, week: moment.Moment) => expandedWeek.isSame(week, 'w'));

        comp.taskViewMode = TaskCalendarTaskViewModeEnum.Day;
        comp.cardTaskModel = newCardTaskModel;
        comp.expandedWeeks = [expandedWeek];
        comp.weekWidth = collapsedWeekWidth;

        comp.ngOnChanges({
            expandedWeeks: new SimpleChange(null, [expandedWeek], false),
            cardTaskModel: new SimpleChange(null, newCardTaskModel, false),
            weekWidth: new SimpleChange(null, collapsedWeekWidth, false),
        });

        fixture.detectChanges();

        const weeks = getDebugElements(dataAutomationWeeks);

        expect(weeks[0].styles['min-width']).toBe(expectExpandedWeekWidth);
        expect(weeks[1].styles['min-width']).toBe(expectCollapsedWeekWidth);
    });

    it('should compute weeks correctly when task starts in the beginning of the week and ends at the ' +
        `end of week and task view mode is set to ${TaskCalendarTaskViewModeEnum.Day}`, () => {
        const taskStart = cardTaskModel.start.clone().startOf('w');
        const taskEnd = taskStart.clone().add(1, 'w').endOf('w');
        const cardStart = taskStart.clone().startOf('w');
        const cardEnd = taskEnd.clone().endOf('w');
        const weeksDiff = taskEnd.diff(taskStart, 'w') + 1;
        const newCardTaskModel: TaskCardWeekModel = {...cardTaskModel, cardStart, cardEnd, start: taskStart, end: taskEnd};

        comp.cardTaskModel = newCardTaskModel;
        comp.taskViewMode = TaskCalendarTaskViewModeEnum.Day;
        comp.ngOnChanges({cardTaskModel: new SimpleChange(null, cardTaskModel, false)});
        fixture.detectChanges();

        const slots = flatten(comp.weeks.map(week => week.slots));
        const firstWeekSlots = slots.slice(0, NUMBER_OF_DAYS_PER_WEEK);
        const secondWeekSlots = slots.slice(NUMBER_OF_DAYS_PER_WEEK);

        expect(comp.weeks.length).toEqual(weeksDiff);
        expect(comp.weeks[0].slots).toEqual(firstWeekSlots);
        expect(comp.weeks[1].slots).toEqual(secondWeekSlots);
    });

    it('should compute weeks correctly when task does not start in the beginning of the week and does not end at the ' +
        `end of week and task view mode is set to ${TaskCalendarTaskViewModeEnum.Day}`, () => {
        const startDayOffset = 3;
        const endDayOffset = 2;
        const numberOfSlotsInFirstWeek = NUMBER_OF_DAYS_PER_WEEK - startDayOffset;
        const taskStart = cardTaskModel.start.clone().startOf('w').add(startDayOffset, 'd');
        const taskEnd = taskStart.clone().add(1, 'w').endOf('w').subtract(endDayOffset, 'd');
        const cardStart = taskStart.clone().startOf('w');
        const cardEnd = taskEnd.clone().endOf('w');
        const weeksDiff = taskEnd.diff(taskStart, 'w') + 1;
        const newCardTaskModel: TaskCardWeekModel = {...cardTaskModel, cardStart, cardEnd, start: taskStart, end: taskEnd};

        comp.cardTaskModel = newCardTaskModel;
        comp.taskViewMode = TaskCalendarTaskViewModeEnum.Day;
        comp.ngOnChanges({cardTaskModel: new SimpleChange(null, cardTaskModel, false)});
        fixture.detectChanges();

        const slots = flatten(comp.weeks.map(week => week.slots));
        const firstWeekSlots = slots.slice(0, numberOfSlotsInFirstWeek);
        const secondWeekSlots = slots.slice(numberOfSlotsInFirstWeek);

        expect(comp.weeks.length).toEqual(weeksDiff);
        expect(comp.weeks[0].slots).toEqual(firstWeekSlots);
        expect(comp.weeks[1].slots).toEqual(secondWeekSlots);
    });

    it('should compute weeks correctly when task start is before cardStart and ' +
        `task view mode is set to ${TaskCalendarTaskViewModeEnum.Day}`, () => {
        const startDayOffset = 3;
        const endDayOffset = 2;
        const taskStart = cardTaskModel.start.clone().startOf('w').add(startDayOffset, 'd');
        const taskStartBeforeCardStart = taskStart.clone().subtract(1, 'w');
        const taskEnd = taskStart.clone().add(1, 'w').endOf('w').subtract(endDayOffset, 'd');
        const cardStart = taskStart.clone().startOf('w');
        const cardEnd = taskEnd.clone().endOf('w');
        const weeksDiff = taskEnd.diff(taskStart, 'w') + 1;
        const newCardTaskModel: TaskCardWeekModel = {...cardTaskModel, cardStart, cardEnd, start: taskStartBeforeCardStart, end: taskEnd};

        comp.cardTaskModel = newCardTaskModel;
        comp.taskViewMode = TaskCalendarTaskViewModeEnum.Day;
        comp.ngOnChanges({cardTaskModel: new SimpleChange(null, cardTaskModel, false)});
        fixture.detectChanges();

        const slots = flatten(comp.weeks.map(week => week.slots));
        const firstWeekSlots = slots.slice(0, NUMBER_OF_DAYS_PER_WEEK);
        const secondWeekSlots = slots.slice(NUMBER_OF_DAYS_PER_WEEK);

        expect(comp.weeks.length).toEqual(weeksDiff);
        expect(comp.weeks[0].slots).toEqual(firstWeekSlots);
        expect(comp.weeks[1].slots).toEqual(secondWeekSlots);
    });

    it('should update weeks when expandedWeeks changes', () => {
        const expectedResult = comp.weeks;

        comp.weeks = null;

        comp.expandedWeeks = expandedWeeks;
        comp.ngOnChanges({expandedWeeks: new SimpleChange(null, expandedWeeks, false)});

        fixture.detectChanges();

        expect(comp.weeks).toEqual(expectedResult);
    });

    it('should not create new slots when expandedWeeks changes', () => {
        const initialWeeks = comp.weeks;

        comp.expandedWeeks = expandedWeeks;
        comp.ngOnChanges({expandedWeeks: new SimpleChange(null, expandedWeeks, false)});

        fixture.detectChanges();

        comp.weeks.forEach((week, weekIndex) => week.slots.forEach((slot, slotIndex) => {
            expect(initialWeeks[weekIndex].slots[slotIndex]).toBe(slot);
        }));
        expect(comp.weeks).not.toBe(initialWeeks);
    });

    it('should update weeks when cardTaskModel changes', () => {
        const expectedResult = comp.weeks;

        comp.weeks = null;

        comp.cardTaskModel = cardTaskModel;
        comp.ngOnChanges({cardTaskModel: new SimpleChange(null, cardTaskModel, false)});

        fixture.detectChanges();

        expect(comp.weeks).toEqual(expectedResult);
    });

    it('should update weeks when dayCards changes', () => {
        const expectedResult = comp.weeks;

        comp.weeks = null;

        comp.dayCards = daycards;
        comp.ngOnChanges({dayCards: new SimpleChange(null, daycards, false)});

        fixture.detectChanges();

        expect(comp.weeks).toEqual(expectedResult);
    });

    it('should update weeks when workDays changes', () => {
        const expectedResult = comp.weeks;

        comp.weeks = null;

        comp.workDays = MOCK_WORK_DAYS;
        comp.ngOnChanges({workDays: new SimpleChange(null, MOCK_WORK_DAYS, false)});

        fixture.detectChanges();

        expect(comp.weeks).toEqual(expectedResult);
    });

    it('should not update weeks when workDays changes but cardTaskModel was not set yet', () => {
        comp.cardTaskModel = null;
        comp.weeks = [];

        comp.workDays = MOCK_WORK_DAYS;
        comp.ngOnChanges({workDays: new SimpleChange(null, MOCK_WORK_DAYS, false)});

        fixture.detectChanges();

        expect(comp.weeks).toEqual([]);
    });

    describe('Task Daycards Component - Slots', () => {

        it('should have the correct slots', () => {
            const slots = flatten(comp.weeks.map(week => week.slots));
            const startMoment = moment(start);
            const endMoment = startMoment.clone().add(durationInDays - 1, 'd');

            const getStatus = (daycard: DayCard, isOutOfScope: boolean) => {
                const slotStatus = isOutOfScope ? DAY_CARD_STATUS_UNAVAILABLE : DAY_CARD_STATUS_EMPTY;
                return daycard ? daycard.status : slotStatus;
            };

            slots.forEach((slot, index) => {
                const isOutOfScope = !slot.date.isBetween(startMoment, endMoment, 'd', '[]');
                const expectedDate = moment(calendarStart).add(index, 'd');
                const expectedDayCard = daycards.find(daycard => moment(daycard.date).isSame(expectedDate, 'd'));
                const expectedStatus = getStatus(expectedDayCard, isOutOfScope);

                expect(slot.date.isSame(expectedDate, 'd')).toBeTruthy();
                expect(slot.outOfScope).toBe(isOutOfScope);
                expect(slot.dayCard).toBe(expectedDayCard);
                expect(slot.status).toBe(expectedStatus);
            });
        });

        it('should have the correct week slots number when task card model start does not start in the beginning of the week and ' +
            `does not end at end of the week and task view mode is set to ${TaskCalendarTaskViewModeEnum.Day}`, () => {
            const startDayOffset = 3;
            const endDayOffset = 2;
            const taskStart = cardTaskModel.start.clone().startOf('w').add(startDayOffset, 'd');
            const taskEnd = taskStart.clone().add(1, 'w').endOf('w').subtract(endDayOffset, 'd');
            const cardStart = taskStart.clone().startOf('w');
            const cardEnd = taskEnd.clone().endOf('w');
            const newCardTaskModel: TaskCardWeekModel = {...cardTaskModel, cardStart, cardEnd, start: taskStart, end: taskEnd};
            const expectedSlotsLength = taskEnd.diff(taskStart, 'd') + 1;

            comp.cardTaskModel = newCardTaskModel;
            comp.taskViewMode = TaskCalendarTaskViewModeEnum.Day;
            comp.ngOnChanges({cardTaskModel: new SimpleChange(null, cardTaskModel, false)});
            fixture.detectChanges();

            const slots = flatten(comp.weeks.map(week => week.slots));

            expect(slots.length).toBe(expectedSlotsLength);
        });

        it(`should not add class ${CSS_CLASS_SLOT_IS_NON_WORKING_DAY} when day is working day`, () => {
            const workingDaysIndex = MOCK_WORK_DAYS.workingDays.map(workDay => DateHelper.getWeekDayMomentNumber(workDay));

            workingDaysIndex.forEach(workDayIndex =>
                expect(getElements(dataAutomationSlots)[workDayIndex].classList).not.toContain(CSS_CLASS_SLOT_IS_NON_WORKING_DAY));
        });

        it(`should add class ${CSS_CLASS_SLOT_IS_NON_WORKING_DAY} when day is non working day`, () => {
            const nonWorkingDaySlots = [0, 6];

            nonWorkingDaySlots.forEach(nonWorkingDayIndex =>
                expect(getElements(dataAutomationSlots)[nonWorkingDayIndex].classList).toContain(CSS_CLASS_SLOT_IS_NON_WORKING_DAY));
        });

        it(`should not add class ${CSS_CLASS_SLOT_IS_NON_WORKING_DAY} when day is not an holiday`, () => {
            const holidays = [];
            const workingDaySlotsIndex = [0, 1, 2, 3, 4, 5, 6];
            const workingDays = fullWeekOfWorkingDays;
            const workDaysWithoutHolidays: WorkDaysResource = {
                ...MOCK_WORK_DAYS,
                holidays,
                workingDays,
                allowWorkOnNonWorkingDays: false,
            };

            comp.workDays = workDaysWithoutHolidays;
            comp.ngOnChanges({workDays: new SimpleChange(null, workDaysWithoutHolidays, false)});
            fixture.detectChanges();

            workingDaySlotsIndex.forEach(workDayIndex =>
                expect(getElements(dataAutomationSlots)[workDayIndex].classList).not.toContain(CSS_CLASS_SLOT_IS_NON_WORKING_DAY));
        });

        it(`should add class ${CSS_CLASS_SLOT_IS_NON_WORKING_DAY} when day is an holiday`, () => {
            const weekStartDate = daycards[0].date;
            const holidays: WorkDaysHoliday[] = new Array(7).fill(weekStartDate).map((day, i) => ({
                name: 'foo',
                date: moment(day).add(i, 'd').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            }));
            const nonWorkingDaySlotsIndex = [0, 1, 2, 3, 4, 5, 6];
            const workingDays = fullWeekOfWorkingDays;
            const workDaysWithHolidays: WorkDaysResource = {
                ...MOCK_WORK_DAYS,
                holidays,
                workingDays,
                allowWorkOnNonWorkingDays: false,
            };

            comp.workDays = workDaysWithHolidays;
            comp.ngOnChanges({workDays: new SimpleChange(null, workDaysWithHolidays, false)});
            fixture.detectChanges();

            nonWorkingDaySlotsIndex.forEach(workDayIndex =>
                expect(getElements(dataAutomationSlots)[workDayIndex].classList).toContain(CSS_CLASS_SLOT_IS_NON_WORKING_DAY));
        });

        it('should display slot locked when slot is a non working day and is not allowed to create day cards on non working days', () => {
            const nonWorkingDaySlots = [0, 6];
            const workDayWithAllowWorkOnNonWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, allowWorkOnNonWorkingDays: false};

            comp.workDays = workDayWithAllowWorkOnNonWorkingDays;
            comp.ngOnChanges({workDays: new SimpleChange(null, workDayWithAllowWorkOnNonWorkingDays, false)});

            fixture.detectChanges();

            nonWorkingDaySlots.forEach(nonWorkingDaySlot => {
                const slot = getElements(dataAutomationSlots)[nonWorkingDaySlot];

                expect(slot.querySelector(dataAutomationSlotsLocked)).toBeDefined();
            });
        });

        it('should not display slot locked when slot is a non working day and is allowed to create day cards on non working days', () => {
            const nonWorkingDaySlots = [0, 6];
            const workDayWithAllowWorkOnNonWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, allowWorkOnNonWorkingDays: true};

            comp.workDays = workDayWithAllowWorkOnNonWorkingDays;
            comp.ngOnChanges({workDays: new SimpleChange(null, workDayWithAllowWorkOnNonWorkingDays, false)});

            fixture.detectChanges();

            nonWorkingDaySlots.forEach(nonWorkingDaySlot => {
                const slot = getElements(dataAutomationSlots)[nonWorkingDaySlot];

                expect(slot.querySelector(dataAutomationSlotsLocked)).toBeNull();
            });
        });

        it('should display slot locked when slot is a holiday and is not allowed to create day cards on non working days', () => {
            const holiday = moment(daycards[0].date);
            const holidays: WorkDaysHoliday[] = [{name: 'foo', date: holiday.format(API_DATE_YEAR_MONTH_DAY_FORMAT)}];
            const nonWorkingDaySlots = [0];
            const workingDaySlots = [1, 2, 3, 4, 5, 6];
            const workingDays = [
                WeekDaysEnum.MONDAY,
                WeekDaysEnum.TUESDAY,
                WeekDaysEnum.WEDNESDAY,
                WeekDaysEnum.THURSDAY,
                WeekDaysEnum.FRIDAY,
                WeekDaysEnum.SATURDAY,
                WeekDaysEnum.SUNDAY,
            ];
            const workDaysWithHolidays: WorkDaysResource = {
                ...MOCK_WORK_DAYS,
                holidays,
                workingDays,
                allowWorkOnNonWorkingDays: false,
            };

            comp.workDays = workDaysWithHolidays;
            comp.ngOnChanges({workDays: new SimpleChange(null, workDaysWithHolidays, false)});
            fixture.detectChanges();

            nonWorkingDaySlots.forEach(nonWorkingDaySlot => {
                const slot = getElements(dataAutomationSlots)[nonWorkingDaySlot];

                expect(slot.querySelector(dataAutomationSlotsLocked)).toBeDefined();
            });

            workingDaySlots.forEach(nonWorkingDaySlot => {
                const slot = getElements(dataAutomationSlots)[nonWorkingDaySlot];

                expect(slot.querySelector(dataAutomationSlotsLocked)).toBeNull();
            });
        });

        it('should not display slot locked when slot is a holiday and is allowed to create day cards on non working days', () => {
            const holiday = moment(daycards[0].date);
            const holidays: WorkDaysHoliday[] = [{name: 'foo', date: holiday.format(API_DATE_YEAR_MONTH_DAY_FORMAT)}];
            const workingDaySlots = [0, 1, 2, 3, 4, 5, 6];
            const workingDays = [
                WeekDaysEnum.MONDAY,
                WeekDaysEnum.TUESDAY,
                WeekDaysEnum.WEDNESDAY,
                WeekDaysEnum.THURSDAY,
                WeekDaysEnum.FRIDAY,
                WeekDaysEnum.SATURDAY,
                WeekDaysEnum.SUNDAY,
            ];
            const workDaysWithHolidays: WorkDaysResource = {
                ...MOCK_WORK_DAYS,
                holidays,
                workingDays,
                allowWorkOnNonWorkingDays: true,
            };

            comp.workDays = workDaysWithHolidays;
            comp.ngOnChanges({workDays: new SimpleChange(null, workDaysWithHolidays, false)});
            fixture.detectChanges();

            workingDaySlots.forEach(nonWorkingDaySlot => {
                const slot = getElements(dataAutomationSlots)[nonWorkingDaySlot];

                expect(slot.querySelector(dataAutomationSlotsLocked)).toBeNull();
            });
        });

        it('should not display slot locked when slot is a non working day and is not allowed to create day cards on non working days and ' +
            'canCreatePermission is false', () => {
            const nonWorkingDaySlots = [0, 6];
            const workDayWithAllowWorkOnNonWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, allowWorkOnNonWorkingDays: false};

            comp.workDays = workDayWithAllowWorkOnNonWorkingDays;
            comp.canCreatePermission = false;
            comp.ngOnChanges({workDays: new SimpleChange(null, workDayWithAllowWorkOnNonWorkingDays, false)});

            fixture.detectChanges();

            nonWorkingDaySlots.forEach(nonWorkingDaySlot => {
                const slot = getElements(dataAutomationSlots)[nonWorkingDaySlot];

                expect(slot.querySelector(dataAutomationSlotsLocked)).toBeNull();
            });
        });
    });

    describe('Task Daycards Component - Move', () => {

        it('should emit moveDayCard when day card is dropped in a empty slot', () => {
            const slotToDrag = comp.weeks[0].slots[0];
            const slotToDragInTo = comp.weeks[0].slots[1];

            const expectedResult = new DayCardMove(slotToDrag.dayCard, slotToDragInTo.date);

            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 0);
            comp.handleEnter(0, 1);
            comp.handleDrop(0, 1);

            expect(comp.moveDayCard.emit).toHaveBeenCalledWith(expectedResult);
        });

        it('should emit moveDayCard when day card is dropped in a empty slot in a new week', () => {
            const slotToDrag = comp.weeks[0].slots[0];
            const slotToDragInTo = comp.weeks[1].slots[1];

            const expectedResult = new DayCardMove(slotToDrag.dayCard, slotToDragInTo.date);

            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 0);
            comp.handleEnter(1, 1);
            comp.handleDrop(1, 1);

            expect(comp.moveDayCard.emit).toHaveBeenCalledWith(expectedResult);
        });

        it('should emit moveDayCard when day card is dropped in a occupied slot', () => {
            const slotToDrag = comp.weeks[0].slots[0];
            const slotToDragInTo = comp.weeks[2].slots[0];

            const expectedResult = new DayCardMove(slotToDrag.dayCard, slotToDragInTo.date);

            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 0);
            comp.handleEnter(2, 0);
            comp.handleDrop(2, 0);

            expect(comp.moveDayCard.emit).toHaveBeenCalledWith(expectedResult);
        });

        it('should emit moveDayCard when day card is dropped in a occupied slot and there are day cards ' +
            'on locked slots of non-working days in the adjacent slots that also need to shift and there are available ' +
            'slots for the move', () => {
            const taskDaysDuration = 10;
            const oneWeekDaysRange = getDaysRange('2020-01-06', 7);
            const oneWeekFullOfDayCards = createDayCards(...oneWeekDaysRange);
            const workingDays = [
                WeekDaysEnum.MONDAY,
                WeekDaysEnum.TUESDAY,
                WeekDaysEnum.WEDNESDAY,
                WeekDaysEnum.THURSDAY,
                WeekDaysEnum.FRIDAY,
            ];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, allowWorkOnNonWorkingDays: false};
            const newCardTaskModel = createTaskCardWeekModel('2020-01-06', taskDaysDuration, '2020-01-06', numberOfWeeksInCalendar);

            when(dateParserStrategyMock.endOfWeek(newCardTaskModel.end)).thenReturn(newCardTaskModel.cardEnd);

            comp.dayCards = oneWeekFullOfDayCards;
            comp.workDays = newWorkDays;
            comp.cardTaskModel = newCardTaskModel;
            fixture.detectChanges();

            const thursdaySlot = comp.weeks[0].slots[4];
            const fridaySlot = comp.weeks[0].slots[5];
            const expectedResult = new DayCardMove(thursdaySlot.dayCard, fridaySlot.date);

            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 4);
            comp.handleEnter(0, 5);
            comp.handleDrop(0, 5);

            expect(comp.moveDayCard.emit).toHaveBeenCalledWith(expectedResult);
        });

        it('should not emit moveDayCard when day card is dropped in a occupied slot and there are day cards ' +
            'on locked slots of non-working days in the adjacent slots that also need to shift but there are no available ' +
            'slots for the move', () => {
            const taskDaysDuration = 9;
            const oneWeekDaysRange = getDaysRange('2020-01-06', 7);
            const oneWeekFullOfDayCards = createDayCards(...oneWeekDaysRange);
            const workingDays = [
                WeekDaysEnum.MONDAY,
                WeekDaysEnum.TUESDAY,
                WeekDaysEnum.WEDNESDAY,
                WeekDaysEnum.THURSDAY,
                WeekDaysEnum.FRIDAY,
            ];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, allowWorkOnNonWorkingDays: false};
            const newCardTaskModel = createTaskCardWeekModel('2020-01-06', taskDaysDuration, '2020-01-06', numberOfWeeksInCalendar);

            when(dateParserStrategyMock.endOfWeek(newCardTaskModel.end)).thenReturn(newCardTaskModel.cardEnd);

            comp.dayCards = oneWeekFullOfDayCards;
            comp.workDays = newWorkDays;
            comp.cardTaskModel = newCardTaskModel;
            comp.ngOnChanges({
                dayCards: new SimpleChange(null, oneWeekFullOfDayCards, false),
                workDays: new SimpleChange(null, newWorkDays, false),
                cardTaskModel: new SimpleChange(null, newCardTaskModel, false),
            });

            fixture.detectChanges();

            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 4);
            comp.handleEnter(0, 5);
            comp.handleDrop(0, 5);

            expect(comp.moveDayCard.emit).not.toHaveBeenCalled();
        });

        it('should emit moveDayCard when day card is dropped in a occupied slot and there are day cards ' +
            'on locked slots of holidays in the adjacent slots that also need to shift and there are available ' +
            'slots for the move', () => {
            const taskDaysDuration = 10;
            const oneWeekDaysRange = getDaysRange('2020-01-06', 7);
            const oneWeekFullOfDayCards = createDayCards(...oneWeekDaysRange);
            const workingDays = fullWeekOfWorkingDays;
            const holidays: WorkDaysHoliday[] = [...oneWeekDaysRange.splice(5, 2).map(day => ({name: 'foo', date: day}))];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, holidays, allowWorkOnNonWorkingDays: false};
            const newCardTaskModel = createTaskCardWeekModel('2020-01-06', taskDaysDuration, '2020-01-06', numberOfWeeksInCalendar);

            when(dateParserStrategyMock.endOfWeek(newCardTaskModel.end)).thenReturn(newCardTaskModel.cardEnd);

            comp.dayCards = oneWeekFullOfDayCards;
            comp.workDays = newWorkDays;
            comp.cardTaskModel = newCardTaskModel;
            fixture.detectChanges();

            const thursdaySlot = comp.weeks[0].slots[4];
            const fridaySlot = comp.weeks[0].slots[5];
            const expectedResult = new DayCardMove(thursdaySlot.dayCard, fridaySlot.date);

            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 4);
            comp.handleEnter(0, 5);
            comp.handleDrop(0, 5);

            expect(comp.moveDayCard.emit).toHaveBeenCalledWith(expectedResult);
        });

        it('should not emit moveDayCard when day card is dropped in a occupied slot and there are day cards ' +
            'on locked slots of holidays in the adjacent slots that also need to shift but there are no available ' +
            'slots for the move', () => {
            const taskDaysDuration = 9;
            const oneWeekDaysRange = getDaysRange('2020-01-06', 7);
            const oneWeekFullOfDayCards = createDayCards(...oneWeekDaysRange);
            const workingDays = fullWeekOfWorkingDays;
            const holidays: WorkDaysHoliday[] = [...oneWeekDaysRange.splice(5, 2).map(day => ({name: 'foo', date: day}))];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, holidays, allowWorkOnNonWorkingDays: false};
            const newCardTaskModel = createTaskCardWeekModel('2020-01-06', taskDaysDuration, '2020-01-06', numberOfWeeksInCalendar);

            when(dateParserStrategyMock.endOfWeek(newCardTaskModel.end)).thenReturn(newCardTaskModel.cardEnd);

            comp.dayCards = oneWeekFullOfDayCards;
            comp.workDays = newWorkDays;
            comp.cardTaskModel = newCardTaskModel;
            comp.ngOnChanges({
                dayCards: new SimpleChange(null, oneWeekFullOfDayCards, false),
                workDays: new SimpleChange(null, newWorkDays, false),
                cardTaskModel: new SimpleChange(null, newCardTaskModel, false),
            });

            fixture.detectChanges();

            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 4);
            comp.handleEnter(0, 5);
            comp.handleDrop(0, 5);

            expect(comp.moveDayCard.emit).not.toHaveBeenCalled();
        });

        it('should not emit moveDayCard when day card is dropped in the same slot', () => {
            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 0);
            comp.handleEnter(0, 0);
            comp.handleDrop(0, 0);

            expect(comp.moveDayCard.emit).not.toHaveBeenCalled();
        });

        it('should not emit moveDayCard when day card is dropped slot that affects a not draggable daycard', () => {
            const cards = createDayCards('2020-01-06', '2020-01-07', '2020-01-08');
            cards[2].permissions.canUpdate = false;

            comp.dayCards = cards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, cards, false)});
            fixture.detectChanges();

            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 0);
            comp.handleEnter(0, 1);
            comp.handleDrop(0, 1);

            expect(comp.moveDayCard.emit).not.toHaveBeenCalled();
        });

        it('should not emit moveDayCard when a day card on a non-locked slot is dropped in a locked slot of a non-working day', () => {
            const cards = createDayCards('2020-01-05', '2020-01-06');
            const workingDay = WEEK_DAYS_MOMENT_SORTED[moment(cards[0].date).day()];
            const workingDays = [workingDay];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, allowWorkOnNonWorkingDays: false};

            comp.dayCards = cards;
            comp.workDays = newWorkDays;
            fixture.detectChanges();

            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 0);
            comp.handleEnter(0, 1);
            comp.handleDrop(0, 1);

            expect(comp.moveDayCard.emit).not.toHaveBeenCalled();
        });

        it('should not emit moveDayCard when a day card on a non-locked slot is dropped in a locked slot of a holiday', () => {
            const cards = createDayCards('2020-01-05', '2020-01-06');
            const holidays: WorkDaysHoliday[] = [{
                name: 'foo',
                date: moment(cards[1].date).format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            }];
            const workingDays = fullWeekOfWorkingDays;
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, holidays, allowWorkOnNonWorkingDays: false};

            comp.dayCards = cards;
            comp.workDays = newWorkDays;
            fixture.detectChanges();

            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 0);
            comp.handleEnter(0, 1);
            comp.handleDrop(0, 1);

            expect(comp.moveDayCard.emit).not.toHaveBeenCalled();
        });

        it('should not emit moveDayCard when a day card in a locked slot is dropped on the same locked slot', () => {
            const cards = createDayCards('2020-01-05');
            const workingDays = [];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, allowWorkOnNonWorkingDays: false};

            comp.dayCards = cards;
            comp.workDays = newWorkDays;
            fixture.detectChanges();

            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 0);
            comp.handleEnter(0, 0);
            comp.handleDrop(0, 0);

            expect(comp.moveDayCard.emit).not.toHaveBeenCalled();
        });

        it('should not emit moveDayCard when day card is dropped in the same slot and it\'s copying', () => {
            comp.dayCards = createDayCards('2020-01-05');
            comp.isCopying = true;
            fixture.detectChanges();

            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 0);
            comp.handleEnter(0, 0);
            comp.handleDrop(0, 0);

            expect(comp.moveDayCard.emit).not.toHaveBeenCalled();
        });

        it('should not emit moveDayCard when escape key is pressed', () => {
            keyUpEvent.key = KeyEnum.Escape;

            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 0);
            comp.handleEnter(0, 1);
            window.dispatchEvent(keyUpEvent);
            comp.handleDrop(0, 1);

            expect(comp.moveDayCard.emit).not.toHaveBeenCalled();
        });
    });

    describe('Task Daycards Component - Copy', () => {

        it('should set isCopying when modifier key is pressed', () => {
            comp.isCopying = false;

            copyKeyPressedState$.next(true);

            expect(comp.isCopying).toBeTruthy();
        });

        it('should unset isCopying when modifier key is released', () => {
            comp.isCopying = true;

            copyKeyPressedState$.next(false);

            expect(comp.isCopying).toBeFalsy();
        });

        it('should not set copying cursor when modifier key is pressed and isMultiSelecting is true', () => {
            comp.hasSelectedItems = true;
            copyKeyPressedState$.next(true);

            expect(document.body.classList).not.toContain(CursorClassEnum.Copy);
        });

        it('should emit copyDayCard when day card is dropped in copy mode', () => {
            const slotToDrag = comp.weeks[0].slots[0];
            const slotToDragInTo = comp.weeks[0].slots[1];

            const expectedResult = new DayCardMove(slotToDrag.dayCard, slotToDragInTo.date);

            spyOn(comp.copyDayCard, 'emit').and.callThrough();

            comp.isCopying = true;
            comp.handleDragStart(0, 0);
            comp.handleEnter(0, 1);
            comp.handleDrop(0, 1);

            expect(comp.copyDayCard.emit).toHaveBeenCalledWith(expectedResult);
        });

        it('should cancel drag when leaving copy mode while dragging a copy that cannot be dragged', () => {
            const cards = createDayCards('2020-01-06');
            cards[0].permissions.canUpdate = false;

            spyOn(document, 'dispatchEvent').and.callThrough();

            comp.dayCards = cards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, cards, false)});
            comp.isCopying = true;

            fixture.detectChanges();

            comp.handleDragStart(0, 0);

            copyKeyPressedState$.next(false);

            expect(document.dispatchEvent).toHaveBeenCalledWith(new Event('mouseup'));
        });

        it('should have isValidDrag set to false when copying affects a daycard that cannot be moved', () => {
            const cards = createDayCards('2020-01-05', '2020-01-06', '2020-01-07');
            cards[2].permissions.canUpdate = false;

            comp.dayCards = cards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, cards, false)});
            comp.isCopying = true;

            fixture.detectChanges();

            comp.handleDragStart(0, 1);
            comp.handleEnter(0, 0);
            const isCopyValid = comp.isValidDrag;

            comp.isCopying = false;
            comp.handleEnter(0, 0);
            const isMoveValid = comp.isValidDrag;

            comp.handleDrop(0, 0);

            expect(isCopyValid).toBeFalsy();
            expect(isMoveValid).toBeTruthy();
        });

        it('should cancel drag when leaving copy mode while dragging a daycard in another task', () => {
            const cards = createDayCards('2020-01-06');
            cards[0].task.id = 'other-task';

            spyOn(document, 'dispatchEvent').and.callThrough();

            comp.dayCards = cards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, cards, false)});
            comp.isCopying = true;

            fixture.detectChanges();

            comp.handleDragStart(0, 0);

            copyKeyPressedState$.next(false);

            expect(document.dispatchEvent).toHaveBeenCalledWith(new Event('mouseup'));
        });
    });

    describe('Task Daycards Component - Drag', () => {

        it('should not allow drag daycards to slots out of scope', () => {
            const newCardTaskModel = createTaskCardWeekModel('2020-01-02', 7, '2020-01-01', 2);

            when(dateParserStrategyMock.endOfWeek(newCardTaskModel.end)).thenReturn(newCardTaskModel.cardEnd);

            comp.cardTaskModel = newCardTaskModel;
            comp.ngOnChanges({cardTaskModel: new SimpleChange(null, newCardTaskModel, false)});
            fixture.detectChanges();

            comp.handleDragStart(1, 0);

            expect(comp.enterSlotPredicateFn(0, 0)()).toBeFalsy();
            expect(comp.enterSlotPredicateFn(0, 4)()).toBeTruthy();
            expect(comp.enterSlotPredicateFn(1, 4)()).toBeFalsy();
        });

        it('should have isValidDrag set to true when drag is valid', () => {
            spyOn(comp.moveDayCard, 'emit').and.callThrough();

            comp.handleDragStart(0, 0);
            comp.handleEnter(0, 1);
            const isValid = comp.isValidDrag;
            comp.handleDrop(0, 1);

            expect(isValid).toBeTruthy();
        });

        it('should set isValidDrag to true when it\'s possible to shift the day cards on locked slots of non-working days', () => {
            const taskDaysDuration = 10;
            const oneWeekDaysRange = getDaysRange('2020-01-06', 7);
            const oneWeekFullOfDayCards = createDayCards(...oneWeekDaysRange);
            const workingDays = [
                WeekDaysEnum.MONDAY,
                WeekDaysEnum.TUESDAY,
                WeekDaysEnum.WEDNESDAY,
                WeekDaysEnum.THURSDAY,
                WeekDaysEnum.FRIDAY,
            ];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, allowWorkOnNonWorkingDays: false};
            const newCardTaskModel = createTaskCardWeekModel('2020-01-06', taskDaysDuration, '2020-01-06', numberOfWeeksInCalendar);

            when(dateParserStrategyMock.endOfWeek(newCardTaskModel.end)).thenReturn(newCardTaskModel.cardEnd);

            comp.dayCards = oneWeekFullOfDayCards;
            comp.workDays = newWorkDays;
            comp.cardTaskModel = newCardTaskModel;
            fixture.detectChanges();

            comp.handleDragStart(0, 4);
            comp.handleEnter(0, 5);
            comp.handleDrop(0, 5);

            expect(comp.isValidDrag).toBeTruthy();
        });

        it('should set isValidDrag to false when it\'s not possible to shift the day cards on locked slots of non-working days', () => {
            const taskDaysDuration = 9;
            const oneWeekDaysRange = getDaysRange('2020-01-06', 7);
            const oneWeekFullOfDayCards = createDayCards(...oneWeekDaysRange);
            const workingDays = [
                WeekDaysEnum.MONDAY,
                WeekDaysEnum.TUESDAY,
                WeekDaysEnum.WEDNESDAY,
                WeekDaysEnum.THURSDAY,
                WeekDaysEnum.FRIDAY,
            ];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, allowWorkOnNonWorkingDays: false};
            const newCardTaskModel = createTaskCardWeekModel('2020-01-06', taskDaysDuration, '2020-01-06', numberOfWeeksInCalendar);

            when(dateParserStrategyMock.endOfWeek(newCardTaskModel.end)).thenReturn(newCardTaskModel.cardEnd);

            comp.dayCards = oneWeekFullOfDayCards;
            comp.workDays = newWorkDays;
            comp.cardTaskModel = newCardTaskModel;
            comp.ngOnChanges({
                dayCards: new SimpleChange(null, oneWeekFullOfDayCards, false),
                workDays: new SimpleChange(null, newWorkDays, false),
                cardTaskModel: new SimpleChange(null, newCardTaskModel, false),
            });
            fixture.detectChanges();

            comp.handleDragStart(0, 4);
            comp.handleEnter(0, 5);
            comp.handleDrop(0, 5);

            expect(comp.isValidDrag).toBeFalsy();
        });

        it('should set isValidDrag to true when it\'s possible to shift the day cards on locked slots of holidays', () => {
            const taskDaysDuration = 10;
            const oneWeekDaysRange = getDaysRange('2020-01-06', 7);
            const oneWeekFullOfDayCards = createDayCards(...oneWeekDaysRange);
            const workingDays = fullWeekOfWorkingDays;
            const holidays: WorkDaysHoliday[] = [...oneWeekDaysRange.splice(5, 2).map(day => ({name: 'foo', date: day}))];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, holidays, allowWorkOnNonWorkingDays: false};
            const newCardTaskModel = createTaskCardWeekModel('2020-01-06', taskDaysDuration, '2020-01-06', numberOfWeeksInCalendar);

            when(dateParserStrategyMock.endOfWeek(newCardTaskModel.end)).thenReturn(newCardTaskModel.cardEnd);

            comp.dayCards = oneWeekFullOfDayCards;
            comp.workDays = newWorkDays;
            comp.cardTaskModel = newCardTaskModel;
            fixture.detectChanges();

            comp.handleDragStart(0, 4);
            comp.handleEnter(0, 5);
            comp.handleDrop(0, 5);

            expect(comp.isValidDrag).toBeTruthy();
        });

        it('should set isValidDrag to false when it\'s not possible to shift the day cards on locked slots of holidays', () => {
            const taskDaysDuration = 9;
            const oneWeekDaysRange = getDaysRange('2020-01-06', 7);
            const oneWeekFullOfDayCards = createDayCards(...oneWeekDaysRange);
            const workingDays = fullWeekOfWorkingDays;
            const holidays: WorkDaysHoliday[] = [...oneWeekDaysRange.splice(5, 2).map(day => ({name: 'foo', date: day}))];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, holidays, allowWorkOnNonWorkingDays: false};
            const newCardTaskModel = createTaskCardWeekModel('2020-01-06', taskDaysDuration, '2020-01-06', numberOfWeeksInCalendar);

            when(dateParserStrategyMock.endOfWeek(newCardTaskModel.end)).thenReturn(newCardTaskModel.cardEnd);

            comp.dayCards = oneWeekFullOfDayCards;
            comp.workDays = newWorkDays;
            comp.cardTaskModel = newCardTaskModel;
            comp.ngOnChanges({
                dayCards: new SimpleChange(null, oneWeekFullOfDayCards, false),
                workDays: new SimpleChange(null, newWorkDays, false),
                cardTaskModel: new SimpleChange(null, newCardTaskModel, false),
            });
            fixture.detectChanges();

            comp.handleDragStart(0, 4);
            comp.handleEnter(0, 5);
            comp.handleDrop(0, 5);

            expect(comp.isValidDrag).toBeFalsy();
        });

        it('should not have slots with drag flag after a drop', () => {
            comp.handleDragStart(0, 0);

            expect(comp.weeks[0].slots[0].isDragging).toBeTruthy();

            comp.handleEnter(0, 1);
            comp.handleDrop(0, 1);

            expect(comp.weeks[0].slots[0].isDragging).toBeFalsy();
        });

        it('should restore slots state after exit a slot  while dragging', () => {
            const cards = createDayCards('2020-01-05', '2020-01-06');
            comp.dayCards = cards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, cards, false)});
            comp.handleDragStart(0, 0);
            comp.handleEnter(0, 1);

            expect(comp.weeks[0].slots[2].dayCard).toBe(cards[1]);
            comp.handleExit();
            expect(comp.weeks[0].slots[1].dayCard).toBe(cards[1]);
        });

        it('should set isDragging flag when a drag start', () => {
            comp.isDragging = false;
            comp.handleDragStart(0, 0);
            expect(comp.isDragging).toBeTruthy();
        });

        it('should unset isDragging flag when a drag end', () => {
            comp.handleDragStart(0, 0);
            comp.handleDrop(0, 0);
            expect(comp.isDragging).toBeFalsy();
        });

        it('should add class to body to style cursor when moving record', () => {
            comp.isCopying = false;
            comp.handleDragStart(0, 0);
            expect(document.body.classList).toContain(CursorClassEnum.Grabbing);
        });

        it('should add class to body to style cursor when copying record', () => {
            comp.isCopying = true;
            comp.handleDragStart(0, 0);

            expect(document.body.classList).toContain(CursorClassEnum.Copy);
        });

        it('should remove class from body to style cursor when not moving record', () => {
            comp.isCopying = false;
            comp.handleDragStart(0, 0);
            expect(document.body.classList).toContain(CursorClassEnum.Grabbing);

            comp.handleDrop(0, 1);
            expect(document.body.classList).not.toContain(CursorClassEnum.Grabbing);
        });

        it('should remove class from body to style cursor when not copying record', () => {
            comp.isCopying = true;
            comp.handleDragStart(0, 0);
            expect(document.body.classList).toContain(CursorClassEnum.Copy);

            comp.handleDrop(0, 1);
            expect(document.body.classList).not.toContain(CursorClassEnum.Copy);
        });

        it('should toggle cursor styles while dragging and toggling between move and copy mode', () => {
            comp.handleDragStart(0, 0);
            copyKeyPressedState$.next(true);
            expect(document.body.classList).toContain(CursorClassEnum.Copy);

            copyKeyPressedState$.next(false);
            expect(document.body.classList).toContain(CursorClassEnum.Grabbing);
        });

        it('should add ss-task-daycards--dragging class while is dragging', () => {
            comp.handleDragStart(0, 0);

            expect(getElements(dataAutomationTaskDayCards)[0].classList).toContain(classIsDragging);

            comp.handleDrop(0, 0);

            expect(getElements(dataAutomationTaskDayCards)[0].classList).not.toContain(classIsDragging);
        });

        it('should compute correct Day Card slots for preview when drag is valid and there are day cards on locked slots ' +
            'of non-working days', () => {
            const taskDaysDuration = 10;
            const oneWeekDaysRange = getDaysRange('2020-01-06', 7);
            const oneWeekFullOfDayCards = createDayCards(...oneWeekDaysRange);
            const workingDays = [
                WeekDaysEnum.MONDAY,
                WeekDaysEnum.TUESDAY,
                WeekDaysEnum.WEDNESDAY,
                WeekDaysEnum.THURSDAY,
                WeekDaysEnum.FRIDAY,
            ];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, allowWorkOnNonWorkingDays: false};
            const newCardTaskModel = createTaskCardWeekModel('2020-01-06', taskDaysDuration, '2020-01-06', numberOfWeeksInCalendar);

            when(dateParserStrategyMock.endOfWeek(newCardTaskModel.end)).thenReturn(newCardTaskModel.cardEnd);

            comp.dayCards = oneWeekFullOfDayCards;
            comp.workDays = newWorkDays;
            comp.cardTaskModel = newCardTaskModel;
            comp.ngOnChanges({
                dayCards: new SimpleChange(null, oneWeekFullOfDayCards, false),
                workDays: new SimpleChange(null, newWorkDays, false),
                cardTaskModel: new SimpleChange(null, newCardTaskModel, false),
            });
            fixture.detectChanges();

            let saturdaySlot = comp.weeks[0].slots[6];
            let sundaySlot = comp.weeks[1].slots[0];
            let mondaySlot = comp.weeks[1].slots[1];
            let tuesdaySlot = comp.weeks[1].slots[2];
            let wednesdaySlot = comp.weeks[1].slots[3];

            expect(saturdaySlot.isLockedAndHasDayCard).toBeTruthy();
            expect(sundaySlot.isLockedAndHasDayCard).toBeTruthy();
            expect(mondaySlot.dayCard).toBeUndefined();
            expect(tuesdaySlot.dayCard).toBeUndefined();
            expect(wednesdaySlot.dayCard).toBeUndefined();

            comp.handleDragStart(0, 4);
            comp.handleEnter(0, 5);

            saturdaySlot = comp.weeks[0].slots[6];
            sundaySlot = comp.weeks[1].slots[0];
            mondaySlot = comp.weeks[1].slots[1];
            tuesdaySlot = comp.weeks[1].slots[2];
            wednesdaySlot = comp.weeks[1].slots[3];

            expect(comp.isValidDrag).toBeTruthy();
            expect(saturdaySlot.isLockedAndHasDayCard).toBeFalsy();
            expect(saturdaySlot.isLocked).toBeTruthy();
            expect(sundaySlot.isLockedAndHasDayCard).toBeFalsy();
            expect(sundaySlot.isLocked).toBeTruthy();
            expect(mondaySlot.dayCard.id).toBe(oneWeekFullOfDayCards[4].id);
            expect(tuesdaySlot.dayCard.id).toBe(oneWeekFullOfDayCards[5].id);
            expect(wednesdaySlot.dayCard.id).toBe(oneWeekFullOfDayCards[6].id);
            comp.handleDrop(0, 5);
        });

        it('should compute correct Day Card slots for preview when dragging a day card in a lock slot and drag is valid and ' +
            'there are day cards on locked slots of non-working days', () => {
            const taskDaysDuration = 9;
            const oneWeekDaysRange = getDaysRange('2020-01-06', 7);
            const oneWeekFullOfDayCards = createDayCards(...oneWeekDaysRange);
            const workingDays = [
                WeekDaysEnum.MONDAY,
                WeekDaysEnum.TUESDAY,
                WeekDaysEnum.WEDNESDAY,
                WeekDaysEnum.THURSDAY,
                WeekDaysEnum.FRIDAY,
            ];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, allowWorkOnNonWorkingDays: false};
            const newCardTaskModel = createTaskCardWeekModel('2020-01-06', taskDaysDuration, '2020-01-06', numberOfWeeksInCalendar);

            when(dateParserStrategyMock.endOfWeek(newCardTaskModel.end)).thenReturn(newCardTaskModel.cardEnd);

            comp.dayCards = oneWeekFullOfDayCards;
            comp.workDays = newWorkDays;
            comp.cardTaskModel = newCardTaskModel;
            comp.ngOnChanges({
                dayCards: new SimpleChange(null, oneWeekFullOfDayCards, false),
                workDays: new SimpleChange(null, newWorkDays, false),
                cardTaskModel: new SimpleChange(null, newCardTaskModel, false),
            });
            fixture.detectChanges();

            let fridaySlot = comp.weeks[0].slots[5];
            let saturdaySlot = comp.weeks[0].slots[6];
            let sundaySlot = comp.weeks[1].slots[0];
            let mondaySlot = comp.weeks[1].slots[1];
            let tuesdaySlot = comp.weeks[1].slots[2];

            expect(fridaySlot.dayCard).toBeDefined();
            expect(saturdaySlot.isLockedAndHasDayCard).toBeTruthy();
            expect(sundaySlot.isLockedAndHasDayCard).toBeTruthy();
            expect(mondaySlot.dayCard).toBeUndefined();
            expect(tuesdaySlot.dayCard).toBeUndefined();

            comp.handleDragStart(0, 6);
            comp.handleEnter(0, 5);

            fridaySlot = comp.weeks[0].slots[5];
            saturdaySlot = comp.weeks[0].slots[6];
            sundaySlot = comp.weeks[1].slots[0];
            mondaySlot = comp.weeks[1].slots[1];
            tuesdaySlot = comp.weeks[1].slots[2];

            expect(comp.isValidDrag).toBeTruthy();
            expect(fridaySlot.dayCard).toBeNull();
            expect(saturdaySlot.isLockedAndHasDayCard).toBeTruthy();
            expect(saturdaySlot.isLocked).toBeTruthy();
            expect(sundaySlot.isLockedAndHasDayCard).toBeFalsy();
            expect(sundaySlot.isLocked).toBeTruthy();
            expect(mondaySlot.dayCard.id).toBe(oneWeekFullOfDayCards[4].id);
            expect(tuesdaySlot.dayCard.id).toBe(oneWeekFullOfDayCards[6].id);
            comp.handleDrop(0, 5);
        });

        it('should compute correct Day Card slots for preview when drag is valid and there are day cards on locked slots ' +
            'of holidays', () => {
            const taskDaysDuration = 10;
            const oneWeekDaysRange = getDaysRange('2020-01-06', 7);
            const oneWeekFullOfDayCards = createDayCards(...oneWeekDaysRange);
            const workingDays = fullWeekOfWorkingDays;
            const holidays: WorkDaysHoliday[] = [...oneWeekDaysRange.splice(5, 2).map(day => ({name: 'foo', date: day}))];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, holidays, allowWorkOnNonWorkingDays: false};
            const newCardTaskModel = createTaskCardWeekModel('2020-01-06', taskDaysDuration, '2020-01-06', numberOfWeeksInCalendar);

            when(dateParserStrategyMock.endOfWeek(newCardTaskModel.end)).thenReturn(newCardTaskModel.cardEnd);

            comp.dayCards = oneWeekFullOfDayCards;
            comp.workDays = newWorkDays;
            comp.cardTaskModel = newCardTaskModel;
            comp.ngOnChanges({
                dayCards: new SimpleChange(null, oneWeekFullOfDayCards, false),
                workDays: new SimpleChange(null, newWorkDays, false),
                cardTaskModel: new SimpleChange(null, newCardTaskModel, false),
            });
            fixture.detectChanges();

            let saturdaySlot = comp.weeks[0].slots[6];
            let sundaySlot = comp.weeks[1].slots[0];
            let mondaySlot = comp.weeks[1].slots[1];
            let tuesdaySlot = comp.weeks[1].slots[2];
            let wednesdaySlot = comp.weeks[1].slots[3];

            expect(saturdaySlot.isLockedAndHasDayCard).toBeTruthy();
            expect(sundaySlot.isLockedAndHasDayCard).toBeTruthy();
            expect(mondaySlot.dayCard).toBeUndefined();
            expect(tuesdaySlot.dayCard).toBeUndefined();
            expect(wednesdaySlot.dayCard).toBeUndefined();

            comp.handleDragStart(0, 4);
            comp.handleEnter(0, 5);

            saturdaySlot = comp.weeks[0].slots[6];
            sundaySlot = comp.weeks[1].slots[0];
            mondaySlot = comp.weeks[1].slots[1];
            tuesdaySlot = comp.weeks[1].slots[2];
            wednesdaySlot = comp.weeks[1].slots[3];

            expect(comp.isValidDrag).toBeTruthy();
            expect(saturdaySlot.isLockedAndHasDayCard).toBeFalsy();
            expect(saturdaySlot.isLocked).toBeTruthy();
            expect(sundaySlot.isLockedAndHasDayCard).toBeFalsy();
            expect(sundaySlot.isLocked).toBeTruthy();
            expect(mondaySlot.dayCard.id).toBe(oneWeekFullOfDayCards[4].id);
            expect(tuesdaySlot.dayCard.id).toBe(oneWeekFullOfDayCards[5].id);
            expect(wednesdaySlot.dayCard.id).toBe(oneWeekFullOfDayCards[6].id);
            comp.handleDrop(0, 5);
        });

        it('should compute correct Day Card slots for preview when dragging a day card in a lock slot and drag is valid and ' +
            'there are day cards on locked slots of holidays', () => {
            const taskDaysDuration = 9;
            const oneWeekDaysRange = getDaysRange('2020-01-06', 7);
            const oneWeekFullOfDayCards = createDayCards(...oneWeekDaysRange);
            const workingDays = fullWeekOfWorkingDays;
            const holidays: WorkDaysHoliday[] = [...oneWeekDaysRange.splice(5, 2).map(day => ({name: 'foo', date: day}))];
            const newWorkDays: WorkDaysResource = {...MOCK_WORK_DAYS, workingDays, holidays, allowWorkOnNonWorkingDays: false};
            const newCardTaskModel = createTaskCardWeekModel('2020-01-06', taskDaysDuration, '2020-01-06', numberOfWeeksInCalendar);

            when(dateParserStrategyMock.endOfWeek(newCardTaskModel.end)).thenReturn(newCardTaskModel.cardEnd);

            comp.dayCards = oneWeekFullOfDayCards;
            comp.workDays = newWorkDays;
            comp.cardTaskModel = newCardTaskModel;
            comp.ngOnChanges({
                dayCards: new SimpleChange(null, oneWeekFullOfDayCards, false),
                workDays: new SimpleChange(null, newWorkDays, false),
                cardTaskModel: new SimpleChange(null, newCardTaskModel, false),
            });
            fixture.detectChanges();

            let fridaySlot = comp.weeks[0].slots[5];
            let saturdaySlot = comp.weeks[0].slots[6];
            let sundaySlot = comp.weeks[1].slots[0];
            let mondaySlot = comp.weeks[1].slots[1];
            let tuesdaySlot = comp.weeks[1].slots[2];

            expect(fridaySlot.dayCard).toBeDefined();
            expect(saturdaySlot.isLockedAndHasDayCard).toBeTruthy();
            expect(sundaySlot.isLockedAndHasDayCard).toBeTruthy();
            expect(mondaySlot.dayCard).toBeUndefined();
            expect(tuesdaySlot.dayCard).toBeUndefined();

            comp.handleDragStart(0, 6);
            comp.handleEnter(0, 5);

            fridaySlot = comp.weeks[0].slots[5];
            saturdaySlot = comp.weeks[0].slots[6];
            sundaySlot = comp.weeks[1].slots[0];
            mondaySlot = comp.weeks[1].slots[1];
            tuesdaySlot = comp.weeks[1].slots[2];

            expect(comp.isValidDrag).toBeTruthy();
            expect(fridaySlot.dayCard).toBeNull();
            expect(saturdaySlot.isLockedAndHasDayCard).toBeTruthy();
            expect(saturdaySlot.isLocked).toBeTruthy();
            expect(sundaySlot.isLockedAndHasDayCard).toBeFalsy();
            expect(sundaySlot.isLocked).toBeTruthy();
            expect(mondaySlot.dayCard.id).toBe(oneWeekFullOfDayCards[4].id);
            expect(tuesdaySlot.dayCard.id).toBe(oneWeekFullOfDayCards[6].id);
            comp.handleDrop(0, 5);
        });
    });

    describe('Task Daycards Component - Create', () => {

        it('should emit createDayCard when create day card button is clicked', () => {
            const expectedResult = comp.weeks[0].slots[1].date;

            spyOn(comp.createDayCard, 'emit').and.callThrough();

            getDebugElements(dataAutomationSlotsCreate)[0].nativeElement.dispatchEvent(clickEvent);

            expect(comp.createDayCard.emit).toHaveBeenCalledWith(expectedResult);
        });

        it('should display add daycard button when canCreate is true', () => {
            comp.dayCards = createDayCards('2020-01-06');
            comp.canCreate = true;

            fixture.detectChanges();

            expect(getElements(dataAutomationSlotsCreate)[0]).toBeTruthy();
        });

        it('should not display add daycard button when canCreate is false', () => {
            comp.dayCards = createDayCards('2020-01-06');
            comp.canCreate = false;

            fixture.detectChanges();

            expect(getElements(dataAutomationSlotsCreate)[0]).toBeFalsy();
        });

        it('should display add daycard button when canCreate is true and dragging card belongs to the task', () => {
            comp.dayCards = createDayCards('2020-01-05');
            comp.canCreate = true;
            comp.handleDragStart(0, 0);

            fixture.detectChanges();

            expect(getElements(dataAutomationSlotsCreate)[0]).toBeTruthy();
        });

        it('should not display add daycard button when canCreate is true and dragging card not belongs to the task', () => {
            const cards = createDayCards('2020-01-06');
            cards[0].task.id = 'another task';

            comp.dayCards = cards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, cards, false)});
            comp.canCreate = true;
            comp.handleDragStart(0, 0);

            fixture.detectChanges();

            expect(getElements(dataAutomationSlotsCreate)[0]).toBeFalsy();
        });

        it('should display add daycard button when canCreate is true and copying card not belongs to the task', () => {
            const cards = createDayCards('2020-01-06');
            cards[0].task.id = 'another task';

            comp.dayCards = cards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, cards, false)});
            comp.canCreate = true;
            comp.isCopying = true;
            comp.handleDragStart(0, 0);

            fixture.detectChanges();

            expect(getElements(dataAutomationSlotsCreate)[0]).toBeTruthy();
        });

        it('should not display add daycard button when canCreate is false and copying card not belongs to the task', () => {
            const cards = createDayCards('2020-01-06');
            cards[0].task.id = 'another task';

            comp.dayCards = cards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, cards, false)});
            comp.canCreate = false;
            comp.isCopying = true;
            comp.handleDragStart(0, 0);

            fixture.detectChanges();

            expect(getElements(dataAutomationSlotsCreate)[0]).toBeFalsy();
        });

        it('should get all connected drop lists', () => {
            const connectedDropLists = ['connected-list-id-1', 'connected-list-id-2', 'connected-list-id-3'];
            spyOn(dayCardDragHelper, 'onConnectedDropListsChange').and.callFake(() => of(connectedDropLists));

            comp.ngOnInit();

            expect(comp.connectedDropLists).toEqual(connectedDropLists);
        });

        it('should connect local drop lists after view inits', () => {
            spyOn(dayCardDragHelper, 'connectDropLists');

            comp.expandedWeeks = expandedWeeks;
            comp.ngOnChanges({expandedWeeks: new SimpleChange(null, expandedWeeks, false)});
            fixture.detectChanges();

            const localConnectedDropLists = getAllDropLists();

            comp.ngAfterViewInit();

            expect(dayCardDragHelper.connectDropLists).toHaveBeenCalledWith(localConnectedDropLists);
        });

        it('should disconnect local drop lists of elements that are removed from the view', () => {
            spyOn(dayCardDragHelper, 'connectDropLists');
            spyOn(dayCardDragHelper, 'disconnectDropLists');

            comp.expandedWeeks = expandedWeeks;
            comp.ngOnChanges({expandedWeeks: new SimpleChange(null, expandedWeeks, false)});
            fixture.detectChanges();

            comp.ngAfterViewInit();

            const localConnectedDropLists = getAllDropLists();

            expect(dayCardDragHelper.connectDropLists).toHaveBeenCalledWith(localConnectedDropLists);

            comp.expandedWeeks = [expandedWeeks[0]];
            comp.ngOnChanges({expandedWeeks: new SimpleChange(null, [expandedWeeks[0]], false)});
            fixture.detectChanges();

            const dropListsToBeConnected = getAllDropLists();
            const dropListsToBeDisconnected = difference(localConnectedDropLists, dropListsToBeConnected);

            expect(dayCardDragHelper.disconnectDropLists).toHaveBeenCalledWith(dropListsToBeDisconnected);
            expect(dayCardDragHelper.connectDropLists).toHaveBeenCalledWith(dropListsToBeConnected);
        });

        it('should disconnect local drop lists when component is destroyed', () => {
            spyOn(dayCardDragHelper, 'disconnectDropLists');

            comp.expandedWeeks = expandedWeeks;
            comp.ngOnChanges({expandedWeeks: new SimpleChange(null, expandedWeeks, false)});
            fixture.detectChanges();

            const localConnectedDropLists = getAllDropLists();

            comp.ngOnDestroy();

            expect(dayCardDragHelper.disconnectDropLists).toHaveBeenCalledWith(localConnectedDropLists);
        });

        it(`should add ${COLORS.dark_grey} color to create button icon when is non working day slot`, () => {
            const nonWorkingDaySlots = [0, 6];

            comp.dayCards = [];
            comp.ngOnChanges({dayCards: new SimpleChange(null, [], false)});

            nonWorkingDaySlots.forEach(nonWorkingDaySlot => {
                const slot = getElements(dataAutomationSlots)[nonWorkingDaySlot];

                expect(slot.querySelector(dataAutomationIconSlotsCreate).color).toEqual(COLORS.dark_grey);
            });
        });

        it(`should not add ${COLORS.dark_grey} color to create button icon when is working day slot`, () => {
            const workingDaysIndex = MOCK_WORK_DAYS.workingDays.map(workDay => DateHelper.getWeekDayMomentNumber(workDay));

            comp.dayCards = [];
            comp.ngOnChanges({dayCards: new SimpleChange(null, [], false)});

            workingDaysIndex.forEach(workDayIndex => {
                const slot = getElements(dataAutomationSlots)[workDayIndex];

                expect(slot.querySelector(dataAutomationIconSlotsCreate).color).not.toEqual(COLORS.dark_grey);
            });
        });

        it(`should add ${COLORS.dark_grey_75} color to create button icon when is working day slot`, () => {
            const workingDaysIndex = MOCK_WORK_DAYS.workingDays.map(workDay => DateHelper.getWeekDayMomentNumber(workDay));

            comp.dayCards = [];
            comp.ngOnChanges({dayCards: new SimpleChange(null, [], false)});

            workingDaysIndex.forEach(workDayIndex => {
                const slot = getElements(dataAutomationSlots)[workDayIndex];

                expect(slot.querySelector(dataAutomationIconSlotsCreate).color).toEqual(COLORS.dark_grey_75);
            });
        });

        it(`should not add ${COLORS.dark_grey_75} color to create button icon when is not working day slot`, () => {
            const nonWorkingDaySlots = [0, 6];

            comp.dayCards = [];
            comp.ngOnChanges({dayCards: new SimpleChange(null, [], false)});

            nonWorkingDaySlots.forEach(nonWorkingDaySlot => {
                const slot = getElements(dataAutomationSlots)[nonWorkingDaySlot];

                expect(slot.querySelector(dataAutomationIconSlotsCreate).color).not.toEqual(COLORS.dark_grey_75);
            });
        });
    });

    describe('Task Daycards Component - Focus', () => {

        it('should not open daycard flyout when focusedDaycardId is NULL', () => {
            spyOn(flyoutService, 'open').and.callThrough();

            comp.focusedDaycardId = null;

            expect(flyoutService.open).not.toHaveBeenCalled();
        });

        it('should not open daycard flyout when focusedDaycardId is not valid', () => {
            spyOn(flyoutService, 'open').and.callThrough();

            comp.focusedDaycardId = 'WRONG-ID';

            expect(flyoutService.open).not.toHaveBeenCalled();
        });

        it('should not open daycard flyout when focusedDaycardId is valid but flyout instance has not been initialized', () => {
            const dayCardId = dayCardFlyoutId;
            const dayCardList = createDayCards('2020-01-06', '2020-01-07');

            dayCardList[0].id = dayCardId;

            spyOn(flyoutService, 'open').and.callThrough();

            comp.dayCards = dayCardList;

            comp.focusedDaycardId = dayCardId;

            fixture.detectChanges();

            expect(flyoutService.open).not.toHaveBeenCalled();
        });

        it('should open daycard flyout when focusedDaycardId is valid and flyout instance has been initialized', () => {
            const dayCardId = dayCardFlyoutId;
            const dayCardList = createDayCards('2020-01-06', '2020-01-07');

            dayCardList[0].id = dayCardId;

            spyOn(flyoutService, 'open').and.callThrough();

            comp.dayCards = dayCardList;
            comp.ngOnChanges({dayCards: new SimpleChange(null, dayCardList, false)});

            comp.flyoutInitialized(dayCardFlyoutId);

            comp.focusedDaycardId = dayCardId;

            expect(flyoutService.open).toHaveBeenCalled();
        });

        it('should open daycard flyout when flyout instance is initialized and focusedDaycardId is valid', () => {
            const dayCardId = dayCardFlyoutId;
            const dayCardList = createDayCards('2020-01-06', '2020-01-07');

            dayCardList[0].id = dayCardId;

            spyOn(flyoutService, 'open').and.callThrough();

            comp.dayCards = dayCardList;
            comp.ngOnChanges({dayCards: new SimpleChange(null, dayCardList, false)});

            comp.focusedDaycardId = dayCardId;

            comp.flyoutInitialized(dayCardFlyoutId);

            expect(flyoutService.open).toHaveBeenCalled();
        });

        it('should open daycard flyout when handleDayCardClick is called', () => {
            const slot = comp.weeks[0].slots[0];

            spyOn(flyoutService, 'open').and.callThrough();

            comp.handleDayCardClick(slot);

            expect(flyoutService.open).toHaveBeenCalled();
        });

        it('should close daycard flyout when flyout is open and focusedDaycardId is NULL', () => {
            const dayCardId = dayCardFlyoutId;
            const dayCardList = createDayCards('2020-01-06', '2020-01-07');

            dayCardList[0].id = dayCardId;

            const openSpy = spyOn(flyoutService, 'open').and.callThrough();
            spyOn(flyoutService, 'close').and.callThrough();

            comp.dayCards = dayCardList;
            comp.ngOnChanges({dayCards: new SimpleChange(null, dayCardList, false)});

            comp.focusedDaycardId = dayCardId;

            comp.flyoutInitialized(dayCardFlyoutId);

            expect(flyoutService.open).toHaveBeenCalled();

            openSpy.calls.reset();

            comp.focusedDaycardId = null;

            expect(flyoutService.close).toHaveBeenCalled();
            expect(flyoutService.open).not.toHaveBeenCalled();
        });

        it('should close the daycard flyout if a focus is initiated on another daycard', () => {
            const cards = createDayCards('2020-01-06', '2020-01-07');

            comp.dayCards = cards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, cards, false)});

            const slotB = comp.weeks[0].slots[1];
            comp.handleDayCardClick(slotB);

            spyOn(flyoutService, 'close').and.callThrough();

            adjacentSelectionKeyPressedState$.next(true);

            dayCardFocusHelper.newCardFocus('notTheId');

            expect(flyoutService.close).toHaveBeenCalledWith(slotB.dayCard.id);
        });

        it('should mark slot as selected when daycard flyout is opened', () => {
            const slot = comp.weeks[0].slots[0];

            spyOn(slot, 'setSelected').and.callThrough();

            comp.handleDayCardClick(slot);

            expect(slot.setSelected).toHaveBeenCalled();
            expect(slot.isSelected).toBeTruthy();
        });

        it('should mark slot as unselected when daycard flyout is closed', () => {
            const slot = comp.weeks[0].slots[0];

            spyOn(slot, 'setSelected').and.callThrough();

            comp.handleDayCardClick(slot);

            comp.focusedDaycardId = null;

            expect(slot.setSelected).toHaveBeenCalledWith(false);
        });

        it('should keep slot as selected when daycard flyout was opened and weeks are updated', () => {
            const slot = comp.weeks[0].slots[0];

            comp.handleDayCardClick(slot);

            expect(slot.isSelected).toBeTruthy();

            comp.cardTaskModel = cardTaskModel;
            comp.ngOnChanges({cardTaskModel: new SimpleChange(null, cardTaskModel, false)});

            expect(slot.isSelected).toBeTruthy();
        });

        it('should reset the calendar selection when a daycard flyout is opened', () => {
            const slot = comp.weeks[0].slots[0];
            const actions = new CalendarSelectionActions.Initialize.All();

            comp.handleDayCardClick(slot);

            expect(store.dispatch).toHaveBeenCalledWith(actions);
        });
    });

    describe('Task Daycards Component - Multi selection', () => {

        it('should set canMultiSelect to true when canCreate change to true and observeCanSelectItemType emitted true', () => {
            observeCanSelectItemTypeSubject.next(true);
            comp.canCreate = false;
            comp.canCreate = true;

            expect(comp.canMultiSelect).toBe(true);
        });

        it('should set canMultiSelect to false when canCreate change to false and observeCanSelectItemType emitted true', () => {
            observeCanSelectItemTypeSubject.next(true);
            comp.canCreate = true;
            comp.canCreate = false;

            expect(comp.canMultiSelect).toBe(false);
        });

        it('should set canMultiSelect to true when observeCanSelectItemType emitted true and isRelevant is true', () => {
            comp.isRelevant = true;
            observeCanSelectItemTypeSubject.next(true);

            expect(comp.canMultiSelect).toBe(true);
        });

        it('should set canMultiSelect to false when observeCanSelectItemType emitted false and isRelevant is true', () => {
            comp.isRelevant = true;
            observeCanSelectItemTypeSubject.next(false);

            expect(comp.canMultiSelect).toBe(false);
        });

        it('should set isCherryPicking to true when calendar selection slice has isMultiSelecting set to true and context is null', () => {
            calendarSelectionSliceSubject$.next(calendarSelectionSliceIsMultiSelecting);

            expect(comp.isCherryPicking).toBeTruthy();
        });

        it('should set isCherryPicking to false when calendar selection slice has isMultiSelecting set to false', () => {
            comp.isCherryPicking = true;
            calendarSelectionSliceSubject$.next(defaultCalendarSelectionSlice);

            expect(comp.isCherryPicking).toBeFalsy();
        });

        it('should set isCherryPicking to false when calendar selection slice has isMultiSelecting set to true' +
            ' and context is different than null', () => {
            const calendarSelectionSliceNextState: CalendarSelectionSlice = {
                ...defaultCalendarSelectionSlice,
                context: CalendarSelectionContextEnum.TasksOfMilestones,
                isMultiSelecting: true,
            };

            comp.isCherryPicking = true;
            calendarSelectionSliceSubject$.next(calendarSelectionSliceNextState);

            expect(comp.isCherryPicking).toBeFalsy();
        });

        it('should set isAdjacentSelecting to true when adjacentSelection shortcut is pressed', () => {
            adjacentSelectionKeyPressedState$.next(true);

            expect(comp.isAdjacentSelecting).toBeTruthy();
        });

        it('should set isAdjacentSelecting to false when adjacentSelection shortcut is release', () => {
            comp.isAdjacentSelecting = true;
            adjacentSelectionKeyPressedState$.next(false);

            expect(comp.isAdjacentSelecting).toBeFalsy();
        });

        it('should set isMultiSelecting to true when calendar selection slice has isMultiSelecting set to true' +
            ' and context is null', () => {
            calendarSelectionSliceSubject$.next(calendarSelectionSliceIsMultiSelecting);

            expect(comp.isMultiSelecting).toBeTruthy();
        });

        it('should set isMultiSelecting to false when calendar selection slice has isMultiSelecting set to false' +
            ' and context is null', () => {
            comp.isMultiSelecting = true;
            calendarSelectionSliceSubject$.next(calendarSelectionSliceIsNotMultiSelecting);

            expect(comp.isMultiSelecting).toBeFalsy();
        });

        it('should set isMultiSelecting to true when adjacentSelection shortcut is pressed', () => {
            adjacentSelectionKeyPressedState$.next(true);

            expect(comp.isMultiSelecting).toBeTruthy();
        });

        it('should set isMultiSelecting to false when adjacentSelection shortcut is release', () => {
            comp.isMultiSelecting = true;
            adjacentSelectionKeyPressedState$.next(false);

            expect(comp.isMultiSelecting).toBeFalsy();
        });

        it('should set hasSelectedItems to true when observeCalendarSelectionItems emit with items', () => {
            const items = [
                new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo'),
            ];

            calendarSelectionItemsSubject.next(items);

            expect(comp.hasSelectedItems).toBe(true);
        });
        it('should set hasSelectedItems to false when observeCalendarSelectionItems emit without items', () => {
            calendarSelectionItemsSubject.next([]);

            expect(comp.hasSelectedItems).toBe(false);
        });

        it('should call toggleSelectionItem when daycard is cherry picked and can be selected', () => {
            const slot = comp.weeks[0].slots[0];

            spyOn(calendarSelectionHelper, 'toggleSelectionItem');

            comp.isCherryPicking = true;
            comp.canMultiSelect = true;
            comp.handleDayCardClick(slot);

            expect(calendarSelectionHelper.toggleSelectionItem).toHaveBeenCalledWith(slot.id, ObjectTypeEnum.DayCard);
        });

        it('should not call toggleSelectionItem when daycard is cherry picked but it can\'t be selected', () => {
            const slot = comp.weeks[0].slots[0];

            spyOn(calendarSelectionHelper, 'toggleSelectionItem');

            comp.isCherryPicking = true;
            comp.canMultiSelect = false;
            comp.handleDayCardClick(slot);

            expect(calendarSelectionHelper.toggleSelectionItem).not.toHaveBeenCalled();
        });

        it('should call toggleSelectionItem when the first daycard is adjacent selected and can be selected', () => {
            const slot = comp.weeks[0].slots[0];

            spyOn(calendarSelectionHelper, 'toggleSelectionItem');

            comp.isAdjacentSelecting = true;
            comp.canMultiSelect = true;
            comp.handleDayCardClick(slot);

            expect(calendarSelectionHelper.toggleSelectionItem).toHaveBeenCalledWith(slot.id, ObjectTypeEnum.DayCard);
        });

        it('should not call toggleSelectionItem when the first daycard is adjacent selected and can\'t be selected', () => {
            const slot = comp.weeks[0].slots[0];

            spyOn(calendarSelectionHelper, 'toggleSelectionItem');

            comp.isAdjacentSelecting = true;
            comp.canMultiSelect = false;
            comp.handleDayCardClick(slot);

            expect(calendarSelectionHelper.toggleSelectionItem).not.toHaveBeenCalled();
        });

        it('should call toggleSelectionItem for all slots in between the current and the last selected ' +
            'when daycard is adjacent selected ', () => {
            const cards = createDayCards('2020-01-05', '2020-01-06', '2020-01-07', '2020-01-08', '2020-01-09');

            spyOn(calendarSelectionHelper, 'toggleSelectionItem');

            comp.dayCards = cards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, cards, false)});

            const slots = range(0, 5).map(index => comp.weeks[0].slots[index]);

            comp.isAdjacentSelecting = true;
            comp.canMultiSelect = true;
            comp.handleDayCardClick(slots[0]);

            calendarSelectionItemsIdsByTypeSubject.next([slots[0].id]);

            comp.handleDayCardClick(slots[4]);

            slots.forEach(slot =>
                expect(calendarSelectionHelper.toggleSelectionItem).toHaveBeenCalledWith(slot.id, ObjectTypeEnum.DayCard)
            );
        });

        it('should call toggleSelectionItem for all slots in between the current and the last selected, except the ones ' +
            'that are already selected when daycard is adjacent selected ', () => {
            const cards = createDayCards('2020-01-05', '2020-01-06', '2020-01-07', '2020-01-08', '2020-01-09');
            const toggleSpy = spyOn(calendarSelectionHelper, 'toggleSelectionItem');

            comp.dayCards = cards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, cards, false)});

            const slots = range(0, 5).map(index => comp.weeks[0].slots[index]);

            comp.isAdjacentSelecting = true;
            comp.handleDayCardClick(slots[4]);
            calendarSelectionItemsIdsByTypeSubject.next([slots[4].id]);

            expect(calendarSelectionHelper.toggleSelectionItem).toHaveBeenCalledWith(slots[4].id, ObjectTypeEnum.DayCard);
            toggleSpy.calls.reset();

            comp.handleDayCardClick(slots[0]);

            expect(calendarSelectionHelper.toggleSelectionItem).toHaveBeenCalledWith(slots[0].id, ObjectTypeEnum.DayCard);
            expect(calendarSelectionHelper.toggleSelectionItem).toHaveBeenCalledWith(slots[1].id, ObjectTypeEnum.DayCard);
            expect(calendarSelectionHelper.toggleSelectionItem).toHaveBeenCalledWith(slots[2].id, ObjectTypeEnum.DayCard);
            expect(calendarSelectionHelper.toggleSelectionItem).toHaveBeenCalledWith(slots[3].id, ObjectTypeEnum.DayCard);
            expect(calendarSelectionHelper.toggleSelectionItem).not.toHaveBeenCalledWith(slots[4].id, ObjectTypeEnum.DayCard);
        });

        it('should call toggleSelectionItem for all slots in between the current and the last selected, even the ones in collapsed weeks' +
            'when daycard is adjacent selected ', () => {
            const cards = createDayCards('2020-01-05', '2020-01-12', '2020-01-19');
            const newExpandedWeeks = [moment('2020-01-05'), moment('2020-01-19')];

            spyOn(calendarSelectionHelper, 'toggleSelectionItem');

            comp.dayCards = cards;
            comp.expandedWeeks = newExpandedWeeks;
            comp.ngOnChanges({
                dayCards: new SimpleChange(null, cards, false),
                expandedWeeks: new SimpleChange(null, newExpandedWeeks, false),
            });

            const slots = range(0, 3).map(index => comp.weeks[index].slots[0]);

            comp.isAdjacentSelecting = true;
            comp.handleDayCardClick(slots[0]);
            calendarSelectionItemsIdsByTypeSubject.next([slots[0].id]);
            comp.handleDayCardClick(slots[2]);

            expect(calendarSelectionHelper.toggleSelectionItem).toHaveBeenCalledWith(slots[0].id, ObjectTypeEnum.DayCard);
            expect(calendarSelectionHelper.toggleSelectionItem).toHaveBeenCalledWith(slots[1].id, ObjectTypeEnum.DayCard);
            expect(calendarSelectionHelper.toggleSelectionItem).toHaveBeenCalledWith(slots[2].id, ObjectTypeEnum.DayCard);
        });

        it('should mark slots as selected when observeCalendarSelectionItemsIdsByType emits with selected daycards', () => {
            const dayCards = createDayCards('2020-01-05', '2020-01-06', '2020-01-07');
            const dayCardsIds = [
                dayCards[0].id,
                dayCards[2].id,
            ];

            comp.dayCards = dayCards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, dayCards, false)});

            expect(comp.weeks[0].slots[0].isSelected).toBe(false);
            expect(comp.weeks[0].slots[1].isSelected).toBe(false);
            expect(comp.weeks[0].slots[2].isSelected).toBe(false);

            calendarSelectionItemsIdsByTypeSubject.next(dayCardsIds);

            expect(comp.weeks[0].slots[0].isSelected).toBe(true);
            expect(comp.weeks[0].slots[1].isSelected).toBe(false);
            expect(comp.weeks[0].slots[2].isSelected).toBe(true);
        });

        it('should keep slot as selected when observeCalendarSelectionItemsIdsByType emits with selected daycards ' +
            'and weeks are updated', () => {
            const dayCards = createDayCards('2020-01-05', '2020-01-06', '2020-01-07');
            const dayCardsIds = [
                dayCards[0].id,
                dayCards[2].id,
            ];

            comp.dayCards = dayCards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, dayCards, false)});

            calendarSelectionItemsIdsByTypeSubject.next(dayCardsIds);

            expect(comp.weeks[0].slots[0].isSelected).toBe(true);
            expect(comp.weeks[0].slots[1].isSelected).toBe(false);
            expect(comp.weeks[0].slots[2].isSelected).toBe(true);

            comp.cardTaskModel = cardTaskModel;
            comp.ngOnChanges({cardTaskModel: new SimpleChange(null, cardTaskModel, false)});

            expect(comp.weeks[0].slots[0].isSelected).toBe(true);
            expect(comp.weeks[0].slots[1].isSelected).toBe(false);
            expect(comp.weeks[0].slots[2].isSelected).toBe(true);

        });

        it('should close the daycard flyout when a another daycard is cherry picked', () => {
            const cards = createDayCards('2020-01-05', '2020-01-06');

            comp.dayCards = cards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, cards, false)});

            const slotA = comp.weeks[0].slots[0];
            const slotB = comp.weeks[0].slots[1];
            comp.handleDayCardClick(slotB);

            spyOn(flyoutService, 'close').and.callThrough();

            comp.isCherryPicking = true;
            comp.handleDayCardClick(slotA);

            expect(flyoutService.close).toHaveBeenCalledWith(slotB.dayCard.id);
        });

        it('should close the daycard flyout when a another daycard is adjacent selected', () => {
            const cards = createDayCards('2020-01-05', '2020-01-06');

            comp.dayCards = cards;
            comp.ngOnChanges({dayCards: new SimpleChange(null, cards, false)});

            const slotA = comp.weeks[0].slots[0];
            const slotB = comp.weeks[0].slots[1];
            comp.handleDayCardClick(slotB);

            spyOn(flyoutService, 'close').and.callThrough();

            comp.isAdjacentSelecting = true;
            comp.handleDayCardClick(slotA);

            expect(flyoutService.close).toHaveBeenCalledWith(slotB.dayCard.id);
        });
    });
});
