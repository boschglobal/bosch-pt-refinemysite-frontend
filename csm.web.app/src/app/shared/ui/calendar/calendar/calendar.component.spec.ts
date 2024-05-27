/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    CdkDrag,
    CdkDragDrop,
    CdkDragEnter,
    DragDropModule,
} from '@angular/cdk/drag-drop';
import {
    DebugElement,
    ElementRef,
    NO_ERRORS_SCHEMA,
    SimpleChange,
    SimpleChanges,
} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {flatten} from 'lodash';
import * as moment from 'moment';
import {Moment} from 'moment';
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

import {updateWindowInnerWidth} from '../../../../../test/helpers';
import {MOCK_CALENDAR} from '../../../../../test/mocks/calendar';
import {MOCK_INTERSECTION_OBSERVER_ENTRY} from '../../../../../test/mocks/intersection-observer';
import {
    MOCK_RELATION_RESOURCE_1,
    MOCK_RELATION_RESOURCE_2
} from '../../../../../test/mocks/relations';
import {MOCK_RESIZE_OBSERVER_ENTRY_HEIGHT} from '../../../../../test/mocks/resize-observer';
import {DateParserStrategyStub} from '../../../../../test/stubs/date-parser.strategy.stub';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {ObjectIdentifierPair} from '../../../misc/api/datatypes/object-identifier-pair.datatype';
import {TimeScope} from '../../../misc/api/datatypes/time-scope.datatype';
import {CursorClassEnum} from '../../../misc/enums/cursor-class.enum';
import {KeyEnum} from '../../../misc/enums/key.enum';
import {ObjectTypeEnum} from '../../../misc/enums/object-type.enum';
import {Point} from '../../../misc/generic-types/point.type';
import {BreakpointHelper} from '../../../misc/helpers/breakpoint.helper';
import {IntersectionObserverHelper} from '../../../misc/helpers/intersection-observer.helper';
import {ResizeHelper} from '../../../misc/helpers/resize.helper';
import {ResizeObserverHelper} from '../../../misc/helpers/resize-observer.helper';
import {TranslationModule} from '../../../translation/translation.module';
import {BREAKPOINTS_RANGE as breakpointsRange} from '../../constants/breakpoints.constant';
import {DIMENSIONS} from '../../constants/dimensions.constant';
import {DateParserStrategy} from '../../dates/date-parser.strategy';
import {LoaderComponent} from '../../loader/loader.component';
import {TruncatedCounterPipe} from '../../pipes/truncated-counter.pipe';
import {CalendarHeaderComponent} from '../calendar-header/calendar-header.component';
import {CALENDAR_CONSTANTS} from '../contants/calendar.contants';
import {
    CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_ID_PREFIX,
    CalendarDependenciesHelper,
} from '../helpers/calendar-dependencies.helper';
import {
    MilestoneSlotsComponent,
    MoveMilestonePayload,
} from '../milestone-slots/milestone-slots.component';
import {
    CALENDAR_DEPENDENCIES_UPDATE_CARDS_VISIBILITY_DEBOUNCE_TIME_MS,
    CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS,
    CALENDAR_DEPENDENCIES_UPDATE_RESIZE_DEBOUNCE_TIME_MS,
    CALENDAR_DEPENDENCIES_VISIBILITY_TRANSITION_DELAY_TIME_MS,
    CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME,
    CalendarComponent,
    CalendarDependency,
    CalendarDependencyAnchorPointYBaseByStrategyAndObjectType,
    CalendarDependencyLine,
    CalendarDependencyOutOfScopeIndicator,
    CalendarMilestone,
    CalendarParsedRow,
    CalendarRecord,
    CalendarRow,
    CalendarWeek,
    CreateRecordPayload,
    MoveRecordPayload,
    NUMBER_OF_DAYS_PER_WEEK,
    Record,
    RowId,
} from './calendar.component';
import {CalendarTestComponent} from './calendar.test.component';
import {SlotIdentifier} from './slot-identifier';

describe('Calendar Component', () => {
    let draggingCalendarRecord: CalendarRecord;
    let fixture: ComponentFixture<CalendarTestComponent>;
    let testHostComp: CalendarTestComponent;
    let comp: CalendarComponent;
    let de: DebugElement;
    let dependenciesHelperGetCalendarLinesSpy: jasmine.Spy;
    let dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy: jasmine.Spy;
    let mockIntersectionObserverEntry: IntersectionObserverEntry;

    const resizeHelperMock: ResizeHelper = mock(ResizeHelper);
    const breakpointHelperMock: BreakpointHelper = mock(BreakpointHelper);
    const intersectionObserverHelperMock: IntersectionObserverHelper = mock(IntersectionObserverHelper);
    const resizeObserverHelperMock: ResizeObserverHelper = mock(ResizeObserverHelper);

    const resize$ = new Subject<void | Event>();
    const {leftColumnWidth, resizeDebounceTime} = CALENDAR_CONSTANTS;
    const endDate: Moment = moment('2018-12-01').endOf('week');
    const startDate: Moment = moment('2018-10-21').startOf('week');
    const initialInnerWidth: number = window.innerWidth;
    const resizeCalendarWrapper$: BehaviorSubject<ResizeObserverEntry> = new BehaviorSubject<ResizeObserverEntry>(null);
    const resizeCalendar$: BehaviorSubject<ResizeObserverEntry> = new BehaviorSubject<ResizeObserverEntry>(null);
    const hideScrollClass = 'ss-calendar--hide-scroll';

    const calendarSelector = '.ss-calendar';
    const calendarHeaderYearScope = '[data-automation="calendar-year__title"]';
    const calendarComponentSelector = 'ss-calendar';
    const calendarDependenciesArtboardSelector = '[data-automation="calendar-dependencies"]';
    const calendarDependencyLineSelector = '[data-automation^="calendar-dependencies-line-"]';
    const calendarDependencyOutOfScopeIndicatorSelector = `[data-automation^="${CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_ID_PREFIX}-"]`;
    const getCalendarDependencyLineSelector = (id) => `[data-automation^="calendar-dependencies-line-${id}"]`;
    const getCalendarDependencyGroupSelector = (id) => `[data-automation^="calendar-dependencies-group-${id}"]`;
    const calendarMilestonesCreationSlotsSelector = '[data-automation^="milestone-creation-row-"]';
    const calendarSlotSelector = `#${new SlotIdentifier(1, 1).stringify()}`;
    const getCalendarDragSlotSelector =
        (columnIndex: number, rowIndex: number): string => `#${new SlotIdentifier(columnIndex, rowIndex).stringify()}`;
    const calendarOriginSlotSelector = `#${new SlotIdentifier(0, 0).stringify()}`;
    const getCalendarMilestonesSlotsSelector = (rowId: RowId) => `[data-automation="milestone-slots-row-${rowId}"]`;
    const getCalendarDependencyOutOfScopeIndicatorLineSelector = (id) => `[data-automation^="indicator-line-${id}"]`;
    const getCalendarDependencyOutOfScopeIndicatorCircleSelector = (id) => `[data-automation^="indicator-circle-${id}"]`;
    const getCalendarDependencyOutOfScopeIndicatorTextSelector = (id) => `[data-automation^="indicator-text-${id}"]`;

    const keyUpEvent: any = new Event('keyup');
    const mouseDownEvent: any = new MouseEvent('mousedown');
    const touchStartEvent: any = new TouchEvent('touchstart');

    const createMockRecord = (id: string, startIndex: number, endIndex: number, groupId: string): Partial<Record> => ({
        id,
        groupId,
        start: startDate.clone().add(startIndex, 'w'),
        end: startDate.clone().add(endIndex - 1, 'w').endOf('w'),
    });

    const mapCalendarParsedRowToRecordIds = (parsedRow: CalendarParsedRow): string[][] =>
        parsedRow.lines.map(line => line.map(({record}) => record?.id).filter(id => id !== undefined));

    const createLine = (...durations: number[]) => {
        let startLine = startDate.clone();
        return [
            {
                id: '123',
                name: 'name1',
                position: 1,
                records: durations
                    .map((duration, index) => {
                        const start = startLine.clone();
                        startLine = startLine.clone().add(duration == null || duration === 0 ? 1 : duration, 'w');
                        const end = startLine.clone().subtract(1, 'd');

                        return duration == null || duration === 0 ? null : {
                            id: `record-${index}`,
                            position: null,
                            start,
                            end,
                        };
                    })
                    .filter(record => record != null),
            },
        ];
    };

    const createLineForDayGrid = (start: moment.Moment, end: moment.Moment): CalendarRow => {
        return {
            id: '123',
            name: 'name1',
            position: 1,
            records: [
                {
                    index: 'record-0',
                    position: null,
                    start,
                    end,
                },
            ],
        };
    };

    const getStylesFromRecordIndex = (recordIndex: number) => comp.parsedRows[0].lines[0][recordIndex].styles;

    const getStylesFromWeekIndex = (weekIndex: number) => comp.weeks[weekIndex].styles;

    const dragStartEvent: any = {
        source: {
            getPlaceholderElement: () => ({
                parentElement: {
                    getBoundingClientRect: () => ({
                        width: 152,
                        left: 0,
                    }),
                },
            }),
        },
    };

    Object.defineProperty(mouseDownEvent, 'clientX', {get: () => 0});
    Object.defineProperty(touchStartEvent, 'touches', {get: () => [{clientX: 0}]});

    const getElement = (selector) => de.query((By.css(selector))).nativeElement;
    const getElements = (selector) => de.queryAll((By.css(selector)));
    const getCalendar = () => de.query(By.css(calendarSelector)).nativeElement;
    const getCalendarSlot = () => de.query(By.css(calendarSlotSelector)).nativeElement;
    const getCalendarDragSlot =
        (columnIndex: number, rowIndex: number) => de.query(By.css(getCalendarDragSlotSelector(columnIndex, rowIndex))).nativeElement;
    const getCalendarOriginSlot = () => de.query(By.css(calendarOriginSlotSelector)).nativeElement;
    const getCalendarRecord = (id: string) => flatten(comp.parsedRows.map(row => flatten(row.lines)))
        .find(calendarRecord => calendarRecord.record && calendarRecord.record.id === id);

    const calendarDependencies: CalendarDependency[] = [
        MOCK_RELATION_RESOURCE_1,
        MOCK_RELATION_RESOURCE_2,
    ];
    const criticalCalendarDependencies: CalendarDependency[] = [
        {...MOCK_RELATION_RESOURCE_1, critical: false},
        {...MOCK_RELATION_RESOURCE_2, critical: true},
    ];

    const calendarDependenciesWithFocus: CalendarDependency[] = [
        {
            ...MOCK_RELATION_RESOURCE_1,
            critical: false,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'task-1'),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'milesone-1'),
        },
        {
            ...MOCK_RELATION_RESOURCE_2,
            critical: false,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'milestone-1'),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'task-2'),
        },
    ];

    const dependencyLinesWithFocus: CalendarDependencyLine[] = calendarDependenciesWithFocus.map(({id, critical}, index) => ({
        id,
        critical,
        dimmedOut: index === 0,
        line: {
            linePath: 'M536,266 L1176.734375,68',
            arrowHeadPath: 'M536,266 L1176.734375,68',
        },
    }));

    const dependencyLines: CalendarDependencyLine[] = calendarDependencies.map(({id, critical}) => ({
        id,
        critical,
        dimmedOut: false,
        line: {
            linePath: 'M536,266 L1176.734375,68',
            arrowHeadPath: 'M536,266 L1176.734375,68',
        },
    }));

    const dependencyLinesWithCriticalDependencies: CalendarDependencyLine[] = criticalCalendarDependencies.map(({id, critical}) =>
        ({
            id,
            critical,
            dimmedOut: false,
            line: {
                linePath: 'M536,266 L1176.734375,68',
                arrowHeadPath: 'M536,266 L1176.734375,68',
            },
        }));

    const dependencyOutOfScopeIndicators: CalendarDependencyOutOfScopeIndicator[] = [
        {
            id: `${CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_ID_PREFIX}-foo`,
            count: 3,
            critical: false,
            circle: {cx: 100, cy: 100, r: DIMENSIONS.base_dimension},
            text: {x: 100, y: 100},
            line: {
                d: 'M536,266 L1176.734375,68',
            },
            dimmedOut: false,
        },
    ];

    const dependencyOutOfScopeIndicatorsWithCriticalDependencies: CalendarDependencyOutOfScopeIndicator[] = [
        {
            id: `${CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_ID_PREFIX}-foo`,
            count: 3,
            critical: false,
            circle: {cx: 100, cy: 100, r: DIMENSIONS.base_dimension},
            text: {x: 100, y: 100},
            line: {
                d: 'M536,266 L1176.734375,68',
            },
            dimmedOut: false,
        },
        {
            id: `${CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_ID_PREFIX}-bar`,
            count: 3,
            critical: true,
            circle: {cx: 100, cy: 100, r: DIMENSIONS.base_dimension},
            text: {x: 100, y: 100},
            line: {
                d: 'M536,266 L1176.734375,68',
            },
            dimmedOut: false,
        },
    ];

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule,
            DragDropModule,
        ],
        declarations: [
            CalendarTestComponent,
            CalendarComponent,
            CalendarHeaderComponent,
            LoaderComponent,
            MilestoneSlotsComponent,
            TruncatedCounterPipe,
        ],
        providers: [
            {
                provide: BreakpointHelper,
                useFactory: () => instance(breakpointHelperMock),
            },
            {
                provide: DateParserStrategy,
                useClass: DateParserStrategyStub,
            },
            {
                provide: ResizeHelper,
                useFactory: () => instance(resizeHelperMock),
            },
            {
                provide: ResizeObserverHelper,
                useFactory: () => instance(resizeObserverHelperMock),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
            {
                provide: IntersectionObserverHelper,
                useFactory: () => instance(intersectionObserverHelperMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        when(breakpointHelperMock.isCurrentBreakpoint(breakpointsRange.xl)).thenReturn(true);
        when(resizeHelperMock.events$).thenReturn(resize$);
        when(intersectionObserverHelperMock.observe(anything(), anything())).thenCall(() => of(mockIntersectionObserverEntry));

        fixture = TestBed.createComponent(CalendarTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(calendarComponentSelector));
        comp = de.componentInstance;
        mockIntersectionObserverEntry = MOCK_INTERSECTION_OBSERVER_ENTRY;

        comp.addRecordPermission = true;
        comp.isExpanded = false;
        comp.canMoveRecord = () => true;
        comp.selectedRecordIds = [];
        comp.scope = {
            start: startDate,
            end: endDate,
        };

        fixture.detectChanges();

        testHostComp.rows = MOCK_CALENDAR;
        fixture.detectChanges();

        draggingCalendarRecord = getCalendarRecord(MOCK_CALENDAR[0].records[0].id);

        dependenciesHelperGetCalendarLinesSpy = spyOn(CalendarDependenciesHelper.prototype, 'getDependencyLines').and.returnValue([]);
        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy =
            spyOn(CalendarDependenciesHelper.prototype, 'getDependencyOutOfScopeIndicators').and.returnValue([]);
    });

    afterEach(() => {
        updateWindowInnerWidth(initialInnerWidth);
    });

    it('should transform Date into ISO format', () => {
        const date = moment('1995-12-25T00:00:00.000Z');
        const expectedResult = '1995-12-25T00:00:00.000Z';
        expect(comp.trackByDate(null, {date} as CalendarWeek)).toBe(expectedResult);
    });

    it('should return row id or -1 if id not set', () => {
        const record = {id: '123'} as Record;
        expect(comp.trackRecord(1, null)).toBe(1);
        expect(comp.trackRecord(1, {record} as CalendarRecord)).toBe('123');
    });

    it('should return line index', () => {
        expect(comp.trackLine(0)).toBe(0);
    });

    it('should return record id or -1 if id not set', () => {
        const record = {id: '123'} as Record;
        expect(comp.trackRecord(1, null)).toBe(1);
        expect(comp.trackRecord(1, {record} as CalendarRecord)).toBe('123');
    });

    it('should emit addRecord when onClickAddRecord is triggered', () => {
        const rowId = '123';
        const index = 0;
        const payload: CreateRecordPayload = {
            rowId,
            start: startDate.clone().startOf('week'),
            end: startDate.clone().endOf('week'),
        };

        spyOn(comp.addRecord, 'emit').and.callThrough();
        comp.onClickAddRecord(index, rowId);

        expect(comp.addRecord.emit).toHaveBeenCalledWith(payload);
    });

    it('should emit expandWeeks when handleHeaderClick is triggered', () => {
        const payload: Moment = moment();

        spyOn(comp.expandWeeks, 'emit').and.callThrough();
        comp.handleHeaderClick(payload);

        expect(comp.expandWeeks.emit).toHaveBeenCalledWith([payload]);
    });

    it('expandWeeks should emit expanded weeks more the new week being expanded', () => {
        const week = moment();
        const payload = [startDate, week];

        comp.expandedWeeks = [startDate];

        spyOn(comp.expandWeeks, 'emit').and.callThrough();
        comp.handleHeaderClick(week);

        expect(comp.expandWeeks.emit).toHaveBeenCalledWith(payload);
    });

    it('expandWeeks should emit startDate when handleHeaderClick is triggered and week already expanded', () => {
        const week = moment();
        const payload = [startDate];

        comp.expandedWeeks = [startDate, week];

        spyOn(comp.expandWeeks, 'emit').and.callThrough();
        comp.handleHeaderClick(week);

        expect(comp.expandWeeks.emit).toHaveBeenCalledWith(payload);
    });

    it('should set isExpanded to TRUE and expandedWeeks to the expandedWeek', () => {
        comp.expandedWeeks = [startDate];

        expect(comp.isExpanded).toBeTruthy();
        expect(comp.expandedWeeks).toEqual([startDate]);
    });

    it('should set isExpanded to FALSE and expandedWeeks to empty when null is passed as expandedWeeks', () => {
        comp.expandedWeeks = null;

        expect(comp.isExpanded).toBeFalsy();
        expect(comp.expandedWeeks).toEqual([]);
    });

    it('isWeekExpanded should retrieve true if passed week in expandedWeeks', () => {
        comp.expandedWeeks = [startDate];

        expect(comp.weeks[0].isExpanded).toBeTruthy();
    });

    it('should return line index', () => {
        expect(comp.trackLine(0)).toBe(0);
    });

    it('should transform Date into ISO format', () => {
        const date = moment('1995-12-25T00:00:00.000Z');
        const expectedResult = '1995-12-25T00:00:00.000Z';
        expect(comp.trackByDate(null, {date} as CalendarWeek)).toBe(expectedResult);
    });

    it('should return row id or -1 if id not set', () => {
        const row: CalendarParsedRow = {id: null, rowIndex: 0, lines: [], rowsLength: 0, isExpanded: false};

        expect(comp.trackRow(1, row)).toBe(1);
        expect(comp.trackRow(1, {...row, id: '123'})).toBe('123');
    });

    it('should return line index', () => {
        expect(comp.trackLine(0)).toBe(0);
    });

    it('should retrieve 154px when getRecordCellStyle is triggered with ' +
        'recordDuration 1 and indexExpanded does not intersect record', () => {
        const expectedResult = {
            ['min-width']: '154px',
            ['max-width']: '154px',
            width: '154px',
        };

        testHostComp.rows = createLine(1);
        fixture.detectChanges();

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});
        comp.ngOnInit();

        expect(getStylesFromRecordIndex(0)).toEqual(expectedResult);
    });

    it('should retrieve 504px when getRecordCellStyle is triggered with recordDuration 1 and one expanded week intersects record', () => {
        const expectedResult = {
            ['min-width']: '504px',
            ['max-width']: '504px',
            width: '504px',
        };

        testHostComp.rows = createLine(1);
        fixture.detectChanges();
        comp.expandedWeeks = [startDate];

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});
        comp.ngOnInit();

        expect(getStylesFromRecordIndex(0)).toEqual(expectedResult);
    });

    it('should retrieve 844px when getRecordCellStyle is triggered with recordDuration 3 and indexExpanded 2 intersects record', () => {
        const expectedResult = {
            ['min-width']: '844px',
            ['max-width']: '844px',
            width: '844px',
        };

        testHostComp.rows = createLine(null, null, 3);
        fixture.detectChanges();
        comp.expandedWeeks = [startDate.clone().add(2, 'w')];

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});
        comp.ngOnInit();

        expect(getStylesFromRecordIndex(2)).toEqual(expectedResult);
    });

    it('should retrieve 494px when getRecordCellStyle is triggered with recordDuration 3 ' +
        'and expanded weeks do not intersect record', () => {
        const expectedResult = {
            ['min-width']: '494px',
            ['max-width']: '494px',
            width: '494px',
        };

        testHostComp.rows = createLine(null, null, 3);
        fixture.detectChanges();
        comp.expandedWeeks = [startDate];

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});
        comp.ngOnInit();

        expect(getStylesFromRecordIndex(2)).toEqual(expectedResult);
    });

    it('should retrieve 844px when getRecordCellStyle is triggered with recordDuration 3 and indexExpanded 3 intersects record', () => {
        const expectedResult = {
            ['min-width']: '844px',
            ['max-width']: '844px',
            width: '844px',
        };

        testHostComp.rows = createLine(null, null, 3);
        fixture.detectChanges();
        comp.expandedWeeks = [startDate.clone().add(3, 'w')];

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});
        comp.ngOnInit();

        expect(getStylesFromRecordIndex(2)).toEqual(expectedResult);
    });

    it('should retrieve 674px when getRecordCellStyle is triggered with recordDuration 2 and one expanded week intersects record', () => {
        const expectedResult = {
            ['min-width']: '674px',
            ['max-width']: '674px',
            width: '674px',
        };

        testHostComp.rows = createLine(2, 2);
        fixture.detectChanges();
        comp.expandedWeeks = [startDate.clone().add(2, 'w')];

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});
        comp.ngOnInit();

        expect(getStylesFromRecordIndex(1)).toEqual(expectedResult);
    });

    it('should retrieve 1024px when getRecordCellStyle is triggered with recordDuration 2 and two expanded week intersects record', () => {
        const expectedResult = {
            ['min-width']: '1024px',
            ['max-width']: '1024px',
            width: '1024px',
        };

        testHostComp.rows = createLine(2, 2);
        fixture.detectChanges();
        comp.expandedWeeks = [
            startDate.clone().add(2, 'w'),
            startDate.clone().add(3, 'w'),
        ];

        expect(getStylesFromRecordIndex(1)).toEqual(expectedResult);
    });

    it('should retrieve 1024px when getRecordCellStyle is triggered with recordDuration 2 and ' +
        'two expanded week intersects record even with 3 weeks expanded', () => {
        const expectedResult = {
            ['min-width']: '1024px',
            ['max-width']: '1024px',
            width: '1024px',
        };

        testHostComp.rows = createLine(2, 2);
        fixture.detectChanges();
        comp.expandedWeeks = [
            startDate.clone().add(2, 'w'),
            startDate.clone().add(3, 'w'),
            startDate.clone().add(4, 'w'),
        ];

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});
        comp.ngOnInit();

        expect(getStylesFromRecordIndex(1)).toEqual(expectedResult);
    });

    it('should retrieve 154px when getStandardCellStyle is triggered for a collapsed cell', () => {
        const result = {
            ['min-width']: '154px',
            ['max-width']: '154px',
            width: '154px',
        };

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});
        comp.ngOnInit();

        expect(getStylesFromWeekIndex(0)).toEqual(result);
    });

    it('should retrieve 504px when getStandardCellStyle is triggered for a expanded cell', () => {
        const result = {
            ['min-width']: '504px',
            ['max-width']: '504px',
            width: '504px',
        };

        comp.expandedWeeks = [startDate];

        expect(getStylesFromWeekIndex(0)).toEqual(result);
    });

    it('should retrieve 284px when getRecordCellStyle is triggered with recordDuration 1 and indexExpanded does not intersect record ' +
        'for a calendar 2038px wide in a XL screen', (done) => {
        const expectedResult = {
            ['min-width']: '284px',
            ['max-width']: '284px',
            width: '284px',
        };
        const calendarWidth = 1800 + leftColumnWidth;

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: calendarWidth});
        when(breakpointHelperMock.isCurrentBreakpoint(breakpointsRange.xl)).thenReturn(true);

        testHostComp.rows = createLine(1);
        fixture.detectChanges();
        comp.ngOnInit();

        resize$.next();

        setTimeout(() => {
            expect(getStylesFromRecordIndex(0)).toEqual(expectedResult);
            done();
        }, resizeDebounceTime + 1);
    });

    it('should retrieve 154px when getRecordCellStyle is triggered with recordDuration 1 and indexExpanded does not intersect record ' +
        'for a calendar 1028px wide in a LG screen', (done) => {
        const expectedResult = {
            ['min-width']: '154px',
            ['max-width']: '154px',
            width: '154px',
        };
        const calendarWidth = 1020;

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: calendarWidth});
        when(breakpointHelperMock.isCurrentBreakpoint(breakpointsRange.xl)).thenReturn(false);

        testHostComp.rows = createLine(1);
        fixture.detectChanges();
        comp.ngOnInit();

        resize$.next();

        setTimeout(() => {
            expect(getStylesFromRecordIndex(0)).toEqual(expectedResult);
            done();
        }, resizeDebounceTime + 1);
    });

    it('should retrieve 284px when getStandardCellStyle is triggered with recordDuration for a collapsed cell, ' +
        'for a calendar 2038px wide in a XL screen', (done) => {
        const result = {
            ['min-width']: '284px',
            ['max-width']: '284px',
            width: '284px',
        };
        const calendarWidth = 1800 + leftColumnWidth;

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: calendarWidth});
        when(breakpointHelperMock.isCurrentBreakpoint(breakpointsRange.xl)).thenReturn(true);
        comp.ngOnInit();

        resize$.next();

        setTimeout(() => {
            expect(getStylesFromWeekIndex(0)).toEqual(result);
            done();
        }, resizeDebounceTime + 1);
    });

    it('should retrieve 154px when getStandardCellStyle is triggered for a collapsed cell, ' +
        'for a calendar 1028px wide in a LG screen', (done) => {
        const result = {
            ['min-width']: '154px',
            ['max-width']: '154px',
            width: '154px',
        };
        const calendarWidth = 1020;

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: calendarWidth});
        when(breakpointHelperMock.isCurrentBreakpoint(breakpointsRange.xl)).thenReturn(false);
        comp.ngOnInit();

        resize$.next();

        setTimeout(() => {
            expect(getStylesFromWeekIndex(0)).toEqual(result);
            done();
        }, resizeDebounceTime + 1);
    });

    it('should retrieve the correct record cell styles when getRecordCellStyle is triggered with a record with the duration of ' +
        '1 full week, indexExpanded does not intersect record and grid unit is \'day\'', () => {
        const start = startDate.clone().startOf('w');
        const end = start.clone().endOf('w');
        const expectedResult = {
            ['min-width']: '154px',
            ['max-width']: '154px',
            ['margin-left']: '8px',
            ['margin-right']: '8px',
            width: '154px',
        };

        testHostComp.recordGridUnit = 'day';
        testHostComp.rows = [createLineForDayGrid(start, end)];
        fixture.detectChanges();

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});
        comp.ngOnInit();

        expect(getStylesFromRecordIndex(0)).toEqual(expectedResult);
    });

    it('should retrieve the correct record cell styles when getRecordCellStyle is triggered with a record with the duration of 1 day, ' +
        'indexExpanded does not intersect record and grid unit is \'day\'', () => {
        const start = startDate.clone().startOf('w');
        const end = start;
        const expectedResult = {
            ['min-width']: '22px',
            ['max-width']: '22px',
            ['margin-left']: '8px',
            ['margin-right']: '140px',
            width: '22px',
        };

        testHostComp.recordGridUnit = 'day';
        testHostComp.rows = [createLineForDayGrid(start, end)];
        fixture.detectChanges();

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});
        comp.ngOnInit();

        expect(getStylesFromRecordIndex(0)).toEqual(expectedResult);
    });

    it('should retrieve the correct record cell styles when getRecordCellStyle is triggered with a record with the duration of ' +
        '1 full week, indexExpanded intersects record and grid unit is \'day\'', () => {
        const start = startDate.clone().startOf('w');
        const end = start.clone().endOf('w');
        const expectedResult = {
            ['min-width']: '504px',
            ['max-width']: '504px',
            ['margin-left']: '8px',
            ['margin-right']: '8px',
            width: '504px',
        };

        testHostComp.recordGridUnit = 'day';
        testHostComp.rows = [createLineForDayGrid(start, end)];
        fixture.detectChanges();
        comp.expandedWeeks = [startDate];

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});
        comp.ngOnInit();

        expect(getStylesFromRecordIndex(0)).toEqual(expectedResult);
    });

    it('should retrieve the correct record cell styles when getRecordCellStyle is triggered with a record with the duration of 1 day, ' +
        'indexExpanded intersects record and grid unit is \'day\'', () => {
        const start = startDate.clone().startOf('w');
        const end = start;
        const expectedResult = {
            ['min-width']: '72px',
            ['max-width']: '72px',
            ['margin-left']: '8px',
            ['margin-right']: '440px',
            width: '72px',
        };

        testHostComp.recordGridUnit = 'day';
        testHostComp.rows = [createLineForDayGrid(start, end)];
        fixture.detectChanges();
        comp.expandedWeeks = [startDate];

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});
        comp.ngOnInit();

        expect(getStylesFromRecordIndex(0)).toEqual(expectedResult);
    });

    it('should update record cell styles when recordGridUnit changes', () => {
        const start = startDate.clone().startOf('w');
        const end = start;
        const expectedFirstResult = {
            ['min-width']: '154px',
            ['max-width']: '154px',
            width: '154px',
        };
        const expectedSecondResult = {
            ['min-width']: '22px',
            ['max-width']: '22px',
            ['margin-left']: '8px',
            ['margin-right']: '140px',
            width: '22px',
        };

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});

        testHostComp.rows = [createLineForDayGrid(start, end)];
        fixture.detectChanges();
        comp.ngOnInit();
        expect(getStylesFromRecordIndex(0)).toEqual(expectedFirstResult);

        testHostComp.recordGridUnit = 'day';
        fixture.detectChanges();
        comp.ngOnInit();
        expect(getStylesFromRecordIndex(0)).toEqual(expectedSecondResult);
    });

    it('should set isDraggingRecord to true when drag starts', () => {
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);

        expect(comp.isDraggingRecord).toBeTruthy();
        expect(draggingCalendarRecord.isDragging).toBeTruthy();
    });

    it('should set isDraggingRecord to true for all selected records when drag starts', () => {
        const selectedRecordIds = [MOCK_CALENDAR[0].records[0].id, MOCK_CALENDAR[0].records[8].id];
        const selectedCalendarRecords = selectedRecordIds.map(getCalendarRecord);

        comp.selectedRecordIds = selectedRecordIds;
        comp.handleRecordDragStart(dragStartEvent, selectedCalendarRecords[0]);

        expect(selectedCalendarRecords.every(calendarRecord => calendarRecord.isDragging)).toBeTruthy();
    });

    it('should set isDraggingRecord to false when drag ends', () => {
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleRecordDragEnd();

        expect(comp.isDraggingRecord).toBeFalsy();
    });

    it('should set isDraggingRecord to false for all selected records when drag ends', () => {
        const selectedRecordIds = [MOCK_CALENDAR[0].records[0].id, MOCK_CALENDAR[0].records[8].id];
        const selectedCalendarRecords = selectedRecordIds.map(getCalendarRecord);

        comp.selectedRecordIds = selectedRecordIds;
        comp.handleRecordDragStart(dragStartEvent, selectedCalendarRecords[0]);
        comp.handleRecordRelease();

        expect(selectedCalendarRecords.every(calendarRecord => !calendarRecord.isDragging)).toBeTruthy();
    });

    it('should emit dragRecordStarted when handleRecordDragStart is called', () => {
        const selectedRecordIds = [MOCK_CALENDAR[0].records[0].id, MOCK_CALENDAR[0].records[8].id];
        const selectedCalendarRecords = selectedRecordIds.map(getCalendarRecord);

        spyOn(comp.dragRecordStarted, 'emit').and.callThrough();

        comp.handleRecordDragStart(dragStartEvent, selectedCalendarRecords[0]);

        expect(comp.dragRecordStarted.emit).toHaveBeenCalled();
    });

    it('should not emit moveRecords when drag is canceled by pressing ESQ', () => {
        spyOn(comp.moveRecords, 'emit').and.callThrough();

        const rowId = MOCK_CALENDAR[1].id;
        const target: Element = getCalendarSlot();
        keyUpEvent.key = KeyEnum.Escape;

        draggingCalendarRecord.record.rowId = rowId;
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        window.dispatchEvent(keyUpEvent);
        comp.handleDrop({
            item: {
                data: draggingCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.moveRecords.emit).not.toHaveBeenCalled();
    });

    it('should emit moveRecords when record is dropped and recordGridUnit is set to \'week\'', () => {
        const rowId = MOCK_CALENDAR[1].id;
        const target: Element = getCalendarSlot();
        const expectedPayload = [
            new MoveRecordPayload(draggingCalendarRecord.record.id, rowId, NUMBER_OF_DAYS_PER_WEEK),
        ];

        spyOn(comp.moveRecords, 'emit').and.callThrough();

        testHostComp.recordGridUnit = 'week';
        fixture.detectChanges();

        draggingCalendarRecord.record.rowId = rowId;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggingCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.moveRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit moveRecords when record is dropped and recordGridUnit is set to \'day\'', () => {
        const rowId = MOCK_CALENDAR[1].id;
        const target: Element = getCalendarSlot();
        const expectedPayload = [
            new MoveRecordPayload(draggingCalendarRecord.record.id, rowId, 1),
        ];

        spyOn(comp.moveRecords, 'emit').and.callThrough();

        testHostComp.recordGridUnit = 'day';
        fixture.detectChanges();

        draggingCalendarRecord.record.rowId = rowId;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggingCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.moveRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit moveRecords when multiple records are dropped and recordGridUnit is set to \'week\'', () => {
        const rowId = MOCK_CALENDAR[1].id;
        const selectedRecordIds = [MOCK_CALENDAR[0].records[0].id, MOCK_CALENDAR[0].records[8].id];
        const selectedRecords = selectedRecordIds.map(id => {
            const calendarRecord = getCalendarRecord(id);

            return {...calendarRecord, record: {...calendarRecord.record, rowId}};
        });
        const shiftDays = NUMBER_OF_DAYS_PER_WEEK;
        const target: Element = getCalendarSlot();
        const draggedCalendarRecord = selectedRecords[0];
        const expectedPayload: MoveRecordPayload[] = selectedRecords.map(record => {
            const {id} = record.record;

            return new MoveRecordPayload(id, rowId, shiftDays);
        }).reverse();

        spyOn(comp.moveRecords, 'emit').and.callThrough();

        testHostComp.recordGridUnit = 'week';
        fixture.detectChanges();

        comp.selectedRecordIds = selectedRecordIds;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggedCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggedCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.moveRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit moveRecords when multiple records are dropped and recordGridUnit is set to \'day\'', () => {
        const rowId = MOCK_CALENDAR[1].id;
        const selectedRecordIds = [MOCK_CALENDAR[0].records[0].id, MOCK_CALENDAR[0].records[8].id];
        const selectedRecords = selectedRecordIds.map(id => {
            const calendarRecord = getCalendarRecord(id);

            return {...calendarRecord, record: {...calendarRecord.record, rowId}};
        });
        const shiftDays = 1;
        const target: Element = getCalendarSlot();
        const draggedCalendarRecord = selectedRecords[0];
        const expectedPayload: MoveRecordPayload[] = selectedRecords.map(record => {
            const {id} = record.record;

            return new MoveRecordPayload(id, rowId, shiftDays);
        }).reverse();

        spyOn(comp.moveRecords, 'emit').and.callThrough();

        testHostComp.recordGridUnit = 'day';
        fixture.detectChanges();

        comp.selectedRecordIds = selectedRecordIds;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggedCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggedCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.moveRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit moveRecords for records outside the calendar scope and recordGridUnit is set to \'week\'', () => {
        const rowId = '456';
        const records = [
            {end: moment('2018-10-06'), id: '123', position: null, start: moment('2018-10-01')},
            {end: moment('2018-10-13'), id: '456', position: null, start: moment('2018-10-08')},
            {end: moment('2018-10-20'), id: '789', position: null, start: moment('2018-10-15')},
        ];
        const selectedRecords = [records[0], records[1]];
        const selectedRecordIds = selectedRecords.map(record => record.id);
        const shiftDays = NUMBER_OF_DAYS_PER_WEEK;

        testHostComp.rows = [
            {
                id: '123',
                name: 'name1',
                position: 0,
                records,
            }, {
                id: rowId,
                name: 'name2',
                position: 1,
                records: [],
            },
        ];

        comp.scope = {
            end: moment('2019-01-20').endOf('week'),
            start: moment('2018-10-08').endOf('week'),
        };
        comp.selectedRecordIds = selectedRecordIds;

        testHostComp.recordGridUnit = 'week';
        fixture.detectChanges();

        spyOn(comp.moveRecords, 'emit').and.callThrough();

        const expectedPayload: MoveRecordPayload[] = selectedRecords.map(record => {
            const {id} = record;

            return new MoveRecordPayload(id, rowId, shiftDays);
        });
        const draggedCalendarRecord = getCalendarRecord(selectedRecordIds[1]);
        const target: Element = getCalendarSlot();

        comp.selectedRecordIds = selectedRecordIds;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggedCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggedCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.moveRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit moveRecords for records outside the calendar scope and recordGridUnit is set to \'day\'', () => {
        const rowId = '456';
        const records = [
            {end: moment('2018-10-06'), id: '123', position: null, start: moment('2018-10-01')},
            {end: moment('2018-10-13'), id: '456', position: null, start: moment('2018-10-08')},
            {end: moment('2018-10-20'), id: '789', position: null, start: moment('2018-10-15')},
        ];
        const selectedRecords = [records[0], records[1]];
        const selectedRecordIds = selectedRecords.map(record => record.id);
        const shiftDays = 1;

        testHostComp.rows = [
            {
                id: '123',
                name: 'name1',
                position: 0,
                records,
            }, {
                id: rowId,
                name: 'name2',
                position: 1,
                records: [],
            },
        ];

        comp.scope = {
            end: moment('2019-01-20').endOf('week'),
            start: moment('2018-10-08').endOf('week'),
        };
        comp.selectedRecordIds = selectedRecordIds;

        testHostComp.recordGridUnit = 'day';
        fixture.detectChanges();

        spyOn(comp.moveRecords, 'emit').and.callThrough();

        const expectedPayload: MoveRecordPayload[] = selectedRecords.map(record => {
            const {id} = record;

            return new MoveRecordPayload(id, rowId, shiftDays);
        });
        const draggedCalendarRecord = getCalendarRecord(selectedRecordIds[1]);
        const target: Element = getCalendarSlot();

        comp.selectedRecordIds = selectedRecordIds;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggedCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggedCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.moveRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should not emit moveRecords when record is dropped but don\'t change position', () => {
        spyOn(comp.moveRecords, 'emit').and.callThrough();

        const target: Element = getCalendarOriginSlot();

        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggingCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.moveRecords.emit).not.toHaveBeenCalled();
    });

    it('should set preview styles when entering a container and recordGridUnit is set to \'week\'', () => {
        const container: Element = getCalendarSlot();
        const expectedResult: Object = {
            width: '154px',
            left: '-0px',
        };

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});

        testHostComp.recordGridUnit = 'week';
        fixture.detectChanges();

        comp.ngOnInit();

        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleEnterContainer({container: {element: {nativeElement: container}}} as CdkDragEnter);

        expect(comp.slotHighlightStyles).toEqual(expectedResult);
    });

    it('should set preview styles when entering a container and recordGridUnit is set to \'day\'', () => {
        const container: Element = getCalendarSlot();
        const expectedResult: Object = {
            width: '170px',
            left: '-0px',
        };

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});

        testHostComp.recordGridUnit = 'day';
        fixture.detectChanges();

        comp.ngOnInit();

        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleEnterContainer({container: {element: {nativeElement: container}}} as CdkDragEnter);

        expect(comp.slotHighlightStyles).toEqual(expectedResult);
    });

    it('should set preview styles depending on the selected tasks date interval and recordGridUnit is set to \'week\'', () => {
        comp.selectedRecordIds = [MOCK_CALENDAR[0].records[0].id, MOCK_CALENDAR[0].records[8].id];
        const container: Element = getCalendarSlot();
        const expectedResult: Object = {
            width: '324px',
            left: '-0px',
        };

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});

        testHostComp.recordGridUnit = 'week';
        fixture.detectChanges();

        comp.ngOnInit();
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleEnterContainer({container: {element: {nativeElement: container}}} as CdkDragEnter);
        expect(comp.slotHighlightStyles).toEqual(expectedResult);
    });

    it('should set preview styles depending on the selected tasks date interval and recordGridUnit is set to \'day\'', () => {
        comp.selectedRecordIds = [MOCK_CALENDAR[0].records[0].id, MOCK_CALENDAR[0].records[8].id];
        const container: Element = getCalendarSlot();
        const expectedResult: Object = {
            width: '340px',
            left: '-0px',
        };

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});

        testHostComp.recordGridUnit = 'day';
        fixture.detectChanges();

        comp.ngOnInit();
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleEnterContainer({container: {element: {nativeElement: container}}} as CdkDragEnter);
        expect(comp.slotHighlightStyles).toEqual(expectedResult);
    });

    it('should set preview for selected records outside calendar scope and recordGridUnit is set to \'week\'', () => {
        const container: Element = getCalendarSlot();
        const expectedResult: Object = {
            width: '324px',
            left: '-170px',
        };
        const records = [
            {end: moment('2018-10-06'), id: '123', position: null, start: moment('2018-10-01')},
            {end: moment('2018-10-13'), id: '456', position: null, start: moment('2018-10-08')},
            {end: moment('2018-10-20'), id: '789', position: null, start: moment('2018-10-15')},
        ];
        const selectedRecordIds = [records[0].id, records[1].id];

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});

        testHostComp.recordGridUnit = 'week';
        fixture.detectChanges();

        testHostComp.rows = [
            {
                id: '123',
                name: 'name1',
                position: 1,
                records,
            }, {
                id: null,
                name: 'without area',
                position: null,
                records: [],
            },
        ];

        comp.scope = {
            end: moment('2019-01-19').endOf('week'),
            start: moment('2018-10-07').endOf('week'),
        };
        comp.selectedRecordIds = selectedRecordIds;

        fixture.detectChanges();

        const draggingRecord = getCalendarRecord(selectedRecordIds[1]);

        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingRecord);
        comp.handleEnterContainer({container: {element: {nativeElement: container}}} as CdkDragEnter);

        expect(comp.slotHighlightStyles).toEqual(expectedResult);
    });

    it('should set preview for selected records outside calendar scope and recordGridUnit is set to \'day\'', () => {
        const container: Element = getCalendarSlot();
        const expectedResult: Object = {
            width: '44px',
            left: '-22px',
        };
        const records = [
            {end: moment('2018-10-06'), id: '123', position: null, start: moment('2018-10-01')},
            {end: moment('2018-10-13'), id: '456', position: null, start: moment('2018-10-08')},
            {end: moment('2018-10-20'), id: '789', position: null, start: moment('2018-10-15')},
        ];
        const selectedRecordIds = [records[0].id, records[1].id];

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});

        testHostComp.recordGridUnit = 'day';
        fixture.detectChanges();

        testHostComp.rows = [
            {
                id: '123',
                name: 'name1',
                position: 1,
                records,
            }, {
                id: null,
                name: 'without area',
                position: null,
                records: [],
            },
        ];

        comp.scope = {
            end: moment('2019-01-19').endOf('week'),
            start: moment('2018-10-07').endOf('week'),
        };
        comp.selectedRecordIds = selectedRecordIds;

        fixture.detectChanges();

        const draggingRecord = getCalendarRecord(selectedRecordIds[1]);

        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingRecord);
        comp.handleEnterContainer({container: {element: {nativeElement: container}}} as CdkDragEnter);

        expect(comp.slotHighlightStyles).toEqual(expectedResult);
    });

    it('should calculate shifted weeks when dragging between containers and recordGridUnit is set to \'week\'', () => {
        const currentWeek: Element = getCalendarOriginSlot();
        const nextWeek: Element = getCalendarSlot();
        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});

        comp.ngOnInit();

        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleEnterContainer({container: {element: {nativeElement: nextWeek}}} as CdkDragEnter);

        expect(comp.shiftAmount).toEqual(1);

        comp.handleEnterContainer({container: {element: {nativeElement: currentWeek}}} as CdkDragEnter);

        expect(comp.shiftAmount).toEqual(0);
    });

    it('should calculate shifted days when dragging between containers and recordGridUnit is set to \'day\'', () => {
        const currentDay: Element = getCalendarDragSlot(0, 1);
        const nextDay: Element = getCalendarDragSlot(1, 0);
        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});

        testHostComp.recordGridUnit = 'day';
        fixture.detectChanges();

        comp.ngOnInit();

        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleEnterContainer({container: {element: {nativeElement: nextDay}}} as CdkDragEnter);

        expect(comp.shiftAmount).toEqual(1);

        comp.handleEnterContainer({container: {element: {nativeElement: currentDay}}} as CdkDragEnter);

        expect(comp.shiftAmount).toEqual(0);
    });

    it('should set shiftAmount to zero when start dragging in the same week and the records don\'t start at the start of the week' +
        'and recordGridUnit is set to \'week\'', () => {
        const currentWeek: Element = getCalendarSlot();
        const recordThatStartOnTuesday = MOCK_CALENDAR[0].records[9].id;
        const selectedRecordIds = [recordThatStartOnTuesday, MOCK_CALENDAR[0].records[8].id];
        const draggingRecord = getCalendarRecord(selectedRecordIds[1]);

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});

        testHostComp.recordGridUnit = 'week';
        fixture.detectChanges();

        comp.ngOnInit();

        comp.selectedRecordIds = selectedRecordIds;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingRecord);
        comp.handleEnterContainer({container: {element: {nativeElement: currentWeek}}} as CdkDragEnter);

        expect(comp.shiftAmount).toEqual(0);
    });

    it('should set shiftAmount to zero when start dragging in the same day and the records don\'t start at the start of the week' +
        'and recordGridUnit is set to \'day\'', () => {
        const recordThatStartOnTuesday = MOCK_CALENDAR[0].records[9].id;
        const selectedRecordIds = [recordThatStartOnTuesday, MOCK_CALENDAR[0].records[8].id];
        const draggingRecord = getCalendarRecord(selectedRecordIds[1]);

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: 0});

        testHostComp.recordGridUnit = 'day';
        fixture.detectChanges();

        const currentDay: Element = getCalendarDragSlot(8, 1);

        comp.ngOnInit();

        comp.selectedRecordIds = selectedRecordIds;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingRecord);
        comp.handleEnterContainer({container: {element: {nativeElement: currentDay}}} as CdkDragEnter);

        expect(comp.shiftAmount).toEqual(0);
    });

    it('should reset preview styles when exiting a container', () => {
        const expectedResult: Object = {
            width: '0px',
            left: '-0px',
        };

        comp.handleExitContainer();

        expect(comp.slotHighlightStyles).toEqual(expectedResult);
    });

    it('should correctly detect collision between task when transitioning year', () => {
        comp.scope = {
            end: moment('2019-01-19').endOf('week'),
            start: moment('2018-12-09').endOf('week'),
        };
        testHostComp.rows = [
            {
                id: '123',
                name: 'name1',
                position: 1,
                records: [
                    {
                        end: moment('2019-01-02'),
                        id: '123',
                        position: null,
                        start: moment('2018-12-09'),
                    },
                    {
                        end: moment('2018-12-29'),
                        id: '456',
                        position: null,
                        start: moment('2018-12-28'),
                    },
                    {
                        end: moment('2019-01-05'),
                        id: '555',
                        position: null,
                        start: moment('2018-12-30'),
                    },
                ],
            },
        ];
        fixture.detectChanges();

        expect(comp.parsedRows[0].lines.length).toBe(2);
        expect(comp.parsedRows[0].lines[0].length).toBe(3);
        expect(comp.parsedRows[0].lines[1].length).toBe(6);
        expect(comp.parsedRows[0].lines[0][0]).not.toBeNull();
        expect(comp.parsedRows[0].lines[1][2]).not.toBeNull();
        expect(comp.parsedRows[0].lines[1][3]).not.toBeNull();
    });

    it('should correctly detect collision between task when transitioning year', () => {
        const expectedHeaders: Moment[] = [
            moment('2018-12-09'),
            moment('2018-12-16'),
        ];

        comp.scope = {
            end: moment('2018-12-22').endOf('week'),
            start: moment('2018-12-09').endOf('week'),
        };

        comp.weeks.forEach((header: CalendarWeek, index: number) => {
            expect(header.date.isSame(expectedHeaders[index], 'd')).toBeTruthy();
        });
    });

    it('should not call calendar scrollTo when card does not exist', fakeAsync(() => {
        const navigateToElement = {cardId: 'foo'};
        const calendarElement = getElement(calendarSelector);

        comp.ngAfterViewInit();

        spyOn(calendarElement, 'scrollTo').and.callThrough();

        comp.navigateToElement = navigateToElement;

        testHostComp.rows = [{
            id: '123',
            name: 'name1',
            position: 1,
            records: [],
        }];

        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(calendarElement.scrollTo).not.toHaveBeenCalled();
    }));

    it('should not call calendar scrollTo when navigateToElement is the same has the previous one for a card', fakeAsync(() => {
        const cardId = 'foo';
        const navigateToElement = {cardId};
        const calendarElement = getElement(calendarSelector);
        const scrollToSpy = spyOn(calendarElement, 'scrollTo').and.callThrough();

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;

        testHostComp.rows = [{
            id: '123',
            name: 'name1',
            position: 1,
            records: [
                {
                    end: moment('2018-10-27'),
                    id: cardId,
                    position: null,
                    start: moment('2018-10-22'),
                }],
        }];

        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
        expect(scrollToSpy).toHaveBeenCalledTimes(1);
        scrollToSpy.calls.reset();

        comp.navigateToElement = navigateToElement;
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
        expect(scrollToSpy).not.toHaveBeenCalled();
    }));

    it('should call calendar scrollTo for a card', fakeAsync(() => {
        const cardId = 'foo';
        const navigateToElement = {cardId};
        const calendarElement = getElement(calendarSelector);

        spyOn(calendarElement, 'scrollTo').and.callThrough();

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = [{
            id: '123',
            name: 'name1',
            position: 1,
            records: [{
                end: moment('2018-10-27'),
                id: cardId,
                position: null,
                start: moment('2018-10-22'),
            }],
        }];

        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(calendarElement.scrollTo).toHaveBeenCalledTimes(1);

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
    }));

    it('should debounce card list changes in order to call calendar scrollTo for a card', fakeAsync(() => {
        const cardId = 'foo';
        const navigateToElement = {cardId};
        const calendarElement = getElement(calendarSelector);

        comp.ngAfterViewInit();

        spyOn(calendarElement, 'scrollTo').and.callThrough();

        comp.navigateToElement = navigateToElement;

        testHostComp.rows = [{
            id: '123',
            name: 'name1',
            position: 1,
            records: [
                {
                    end: moment('2018-10-27'),
                    id: cardId,
                    position: null,
                    start: moment('2018-10-22'),
                }],
        }];

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME - 1);

        testHostComp.rows = [{
            id: '123',
            name: 'name1',
            position: 1,
            records: [
                {
                    end: moment('2018-10-27'),
                    id: cardId,
                    position: null,
                    start: moment('2018-10-22'),
                },
                {
                    end: moment('2018-10-27'),
                    id: 'bar',
                    position: null,
                    start: moment('2018-10-22'),
                },
            ],
        }];

        fixture.detectChanges();

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(calendarElement.scrollTo).toHaveBeenCalledTimes(1);

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
    }));

    it('should not call calendar scrollTo for a card when week is defined but does not exist in the ' +
        'calendar header cell list', fakeAsync(() => {
        const cardId = 'foo';
        const week = startDate.clone().subtract(1, 'w');
        const navigateToElement = {cardId, week};
        const calendarElement = getElement(calendarSelector);

        spyOn(calendarElement, 'scrollTo').and.callThrough();

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = [{
            id: '123',
            name: 'name1',
            position: 1,
            records: [{
                end: moment('2018-10-27'),
                id: cardId,
                position: null,
                start: moment('2018-10-22'),
            }],
        }];

        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(calendarElement.scrollTo).not.toHaveBeenCalled();
    }));

    it('should call calendar scrollTo for a card if when week is defined and week exist in the calendar header cell list', fakeAsync(() => {
        const cardId = 'foo';
        const week = startDate;
        const navigateToElement = {cardId, week};
        const calendarElement = getElement(calendarSelector);

        spyOn(calendarElement, 'scrollTo').and.callThrough();

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = [{
            id: '123',
            name: 'name1',
            position: 1,
            records: [{
                end: moment('2018-10-27'),
                id: cardId,
                position: null,
                start: moment('2018-10-22'),
            }],
        }];

        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(calendarElement.scrollTo).toHaveBeenCalledTimes(1);

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
    }));

    it('should debounce header cell list changes in order to call calendar scrollTo for a card', fakeAsync(() => {
        const midTimeScope: TimeScope = {
            start: startDate.clone().subtract(1, 'w'),
            end: endDate.clone().subtract(1, 'w'),
        };
        const finalTimeScope: TimeScope = {
            start: startDate.clone().subtract(2, 'w'),
            end: endDate.clone().subtract(2, 'w'),
        };
        const cardStart = startDate.clone().subtract(1, 'w');
        const cardId = 'foo';
        const week = cardStart;
        const navigateToElement = {cardId, week};
        const calendarElement = getElement(calendarSelector);

        spyOn(calendarElement, 'scrollTo').and.callThrough();

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = [{
            id: '123',
            name: 'name1',
            position: 1,
            records: [{
                end: moment('2018-10-27'),
                id: cardId,
                position: null,
                start: cardStart,
            }],
        }];
        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
        expect(calendarElement.scrollTo).not.toHaveBeenCalled();

        comp.scope = midTimeScope;
        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME - 1);
        expect(calendarElement.scrollTo).not.toHaveBeenCalled();

        comp.scope = finalTimeScope;
        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME * 2);
        expect(calendarElement.scrollTo).toHaveBeenCalledTimes(1);

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
    }));

    it('should not call calendar scrollTo when milestone does not exist', fakeAsync(() => {
        const milestoneId = 'foo';
        const navigateToElement = {milestoneId};
        const calendarElement = getElement(calendarSelector);

        spyOn(calendarElement, 'scrollTo').and.callThrough();

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = createLine(1);
        testHostComp.milestones = {};

        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(calendarElement.scrollTo).not.toHaveBeenCalled();

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
    }));

    it('should not call calendar scrollTo when navigateToElement is the same has the previous one ' +
        'for a milestone', fakeAsync(() => {
        const milestoneId = 'foo';
        const navigateToElement = {milestoneId};
        const calendarElement = getElement(calendarSelector);
        const scrollToSpy = spyOn(calendarElement, 'scrollTo').and.callThrough();

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = createLine(1);
        testHostComp.milestones = {};
        fixture.detectChanges();

        testHostComp.milestones = {
            header: [
                {id: milestoneId, date: startDate.clone().add(3, 'd')},
            ],
        };

        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
        expect(calendarElement.scrollTo).toHaveBeenCalledTimes(1);
        scrollToSpy.calls.reset();

        comp.navigateToElement = navigateToElement;
        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
        expect(calendarElement.scrollTo).not.toHaveBeenCalled();
    }));

    it('should call calendar scrollTo for a milestone', fakeAsync(() => {
        const milestoneId = 'foo';
        const navigateToElement = {milestoneId};
        const calendarElement = getElement(calendarSelector);

        spyOn(calendarElement, 'scrollTo').and.callThrough();

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = createLine(1);
        testHostComp.milestones = {};
        fixture.detectChanges();

        testHostComp.milestones = {
            header: [
                {id: milestoneId, date: startDate.clone().add(3, 'd')},
            ],
        };

        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(calendarElement.scrollTo).toHaveBeenCalledTimes(1);

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
    }));

    it('should debounce card list and milestone slot changes in order to call calendar scrollTo for a card', fakeAsync(() => {
        const milestoneId = 'foo';
        const navigateToElement = {milestoneId};
        const calendarElement = getElement(calendarSelector);

        spyOn(calendarElement, 'scrollTo').and.callThrough();

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = createLine(1);
        testHostComp.milestones = {
            header: [
                {id: milestoneId, date: startDate.clone().add(3, 'd')},
            ],
        };

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME - 1);
        fixture.detectChanges();

        testHostComp.rows = createLine(1);
        testHostComp.milestones = {
            header: [
                {id: milestoneId, date: startDate.clone().add(3, 'd')},
                {id: 'bar', date: startDate.clone().add(4, 'd')},
            ],
        };

        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(calendarElement.scrollTo).toHaveBeenCalledTimes(1);

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
    }));

    it('should call calendar scrollTo with the correct coordinates when scrollTo is called', () => {
        const calendarElement = getElement(calendarSelector);
        const point: Point = {x: 10, y: 10};
        const expectedResult = {top: point.y, left: point.x, behavior: 'smooth'};

        spyOn(calendarElement, 'scrollTo').and.callThrough();

        comp.scrollTo(point);

        expect(calendarElement.scrollTo).toHaveBeenCalledWith(expectedResult);
    });

    it('should call calendar scrollTo with the correct coordinates for XL breakpoint', fakeAsync(() => {
        const cardId = 'record-0';
        const navigateToElement = {cardId};
        const calendarElement = getElement(calendarSelector);
        const elementPosition = {x: 10, y: 10};
        const elementFinalXPosition = elementPosition.x - CALENDAR_CONSTANTS.leftColumnWidth;
        const elementFinalPosition = {x: elementFinalXPosition, y: elementPosition.y};
        const expectedResult = {top: elementFinalPosition.y, left: elementFinalPosition.x, behavior: 'smooth'};

        spyOn(calendarElement, 'scrollTo').and.callThrough();

        spyOn(comp.calendar.nativeElement, 'scrollTop').and.returnValue(0);
        spyOn(comp.calendar.nativeElement, 'scrollLeft').and.returnValue(0);
        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({x: 0, y: 0});
        spyOn(comp.calendarHeader.nativeElement, 'getBoundingClientRect').and.returnValue({height: 0});
        spyOn(Element.prototype, 'getBoundingClientRect').and.returnValue(elementPosition);

        when(breakpointHelperMock.isCurrentBreakpoint(breakpointsRange.xl)).thenReturn(true);

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = createLine(1);

        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(calendarElement.scrollTo).toHaveBeenCalledTimes(1);
        expect(calendarElement.scrollTo).toHaveBeenCalledWith(expectedResult);

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
    }));

    it('should call calendar scrollTo with the correct coordinates for breakpoints different then XL', fakeAsync(() => {
        const cardId = 'record-0';
        const navigateToElement = {cardId};
        const calendarElement = getElement(calendarSelector);
        const elementPosition = {x: 10, y: 10};
        const expectedResult = {top: elementPosition.y, left: elementPosition.x, behavior: 'smooth'};

        spyOn(calendarElement, 'scrollTo').and.callThrough();
        spyOn(comp.calendar.nativeElement, 'scrollTop').and.returnValue(0);
        spyOn(comp.calendar.nativeElement, 'scrollLeft').and.returnValue(0);
        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({x: 0, y: 0});
        spyOn(comp.calendarHeader.nativeElement, 'getBoundingClientRect').and.returnValue({height: 0});
        spyOn(comp.calendarColumn.first.nativeElement, 'getBoundingClientRect').and.returnValue({height: 0});
        spyOn(Element.prototype, 'getBoundingClientRect').and.returnValue(elementPosition);

        when(breakpointHelperMock.isCurrentBreakpoint(breakpointsRange.xl)).thenReturn(false);

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = createLine(1);

        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(calendarElement.scrollTo).toHaveBeenCalledTimes(1);
        expect(calendarElement.scrollTo).toHaveBeenCalledWith(expectedResult);

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
    }));

    it('should emit a navigate to element end after a navigation for a card succeeded', fakeAsync(() => {
        const cardId = 'foo';
        const navigateToElement = {cardId};

        spyOn(comp.navigateToElementEnd, 'emit').and.callThrough();

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = [{
            id: '123',
            name: 'name1',
            position: 1,
            records: [{
                end: moment('2018-10-27'),
                id: cardId,
                position: null,
                start: moment('2018-10-22'),
            }],
        }];

        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(comp.navigateToElementEnd.emit).toHaveBeenCalledWith(navigateToElement);

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
    }));

    it('should emit a navigate to element end after a navigation for a milestone succeeded', fakeAsync(() => {
        const milestoneId = 'foo';
        const navigateToElement = {milestoneId};

        spyOn(comp.navigateToElementEnd, 'emit').and.callThrough();

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = createLine(1);
        testHostComp.milestones = {};
        fixture.detectChanges();

        testHostComp.milestones = {
            header: [
                {id: milestoneId, date: startDate.clone().add(3, 'd')},
            ],
        };

        fixture.detectChanges();
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(comp.navigateToElementEnd.emit).toHaveBeenCalledWith(navigateToElement);

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
    }));

    it('should run a highlight animation on an element when highlightElementAnimation is called', fakeAsync(() => {
        const cardId = 'foo';
        const navigateToElement = {cardId};

        comp.ngAfterViewInit();

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = [{
            id: '123',
            name: 'name1',
            position: 1,
            records: [{
                end: moment('2018-10-27'),
                id: cardId,
                position: null,
                start: moment('2018-10-22'),
            }],
        }];
        fixture.detectChanges();

        const highlightElement = getElement(`#${cardId}`);

        spyOn(highlightElement, 'animate').and.returnValue({finished: Promise.resolve({} as Animation)} as Animation);

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(highlightElement.animate).toHaveBeenCalledTimes(1);
    }));

    it('should not call highlightElement.animate while the element is not on screen ' +
        'after navigateToElement is triggered', fakeAsync(() => {
        const cardId = 'foo';
        const navigateToElement = {cardId};

        comp.ngAfterViewInit();

        mockIntersectionObserverEntry = {
            ...MOCK_INTERSECTION_OBSERVER_ENTRY,
            isIntersecting: false,
        };

        comp.navigateToElement = navigateToElement;
        testHostComp.rows = [{
            id: '123',
            name: 'name1',
            position: 1,
            records: [{
                end: moment('2018-10-27'),
                id: cardId,
                position: null,
                start: moment('2018-10-22'),
            }],
        }];
        fixture.detectChanges();

        const highlightElement = getElement(`#${cardId}`);

        spyOn(highlightElement, 'animate').and.callThrough();

        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);
        tick(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME);

        expect(highlightElement.animate).not.toHaveBeenCalled();
    }));

    it('should trigger a visibility record validation when scope change', (done) => {
        const calendarHeight = spyOnProperty(getCalendar(), 'clientHeight', 'get').and.callThrough();

        comp.scope = {
            end: moment('2019-01-20').endOf('week'),
            start: moment('2018-12-10').endOf('week'),
        };

        setTimeout(() => {
            expect(calendarHeight).toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should trigger a visibility record validation when rows change', (done) => {
        const calendarHeight = spyOnProperty(getCalendar(), 'clientHeight', 'get').and.callThrough();

        testHostComp.rows = createLine(1);
        fixture.detectChanges();

        setTimeout(() => {
            expect(calendarHeight).toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should trigger a visibility record validation when view init', (done) => {
        const calendarHeight = spyOnProperty(getCalendar(), 'clientHeight', 'get').and.callThrough();

        comp.ngAfterViewInit();

        setTimeout(() => {
            expect(calendarHeight).toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should trigger a visibility record validation when elementsDimensionsChanged is called', (done) => {
        const calendarHeight = spyOnProperty(getCalendar(), 'clientHeight', 'get').and.callThrough();

        comp.elementsDimensionsChanged();

        setTimeout(() => {
            expect(calendarHeight).toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should trigger a visibility record validation when scroll', () => {
        const calendarHeight = spyOnProperty(getCalendar(), 'clientHeight', 'get').and.callThrough();

        comp.handleScroll();
        comp.handleScroll();

        expect(calendarHeight).toHaveBeenCalledTimes(3);
    });

    it('should have records flagged as not visible when outside viewport', (done) => {
        spyOnProperty(getCalendar(), 'clientHeight', 'get').and.returnValue(0);

        comp.elementsDimensionsChanged();

        setTimeout(() => {
            expect(comp.parsedRows
                .every(row => flatten(row.lines).every(calendarRecord => !calendarRecord.record || !calendarRecord.visible))).toBeTruthy();
            done();
        }, 1);
    });

    it('should have record flagged as visible when outside viewport but record being dragged', (done) => {
        spyOnProperty(getCalendar(), 'clientHeight', 'get').and.returnValue(0);
        const recordId = MOCK_CALENDAR[0].records[0].id;

        comp.handleRecordDragStart(dragStartEvent, getCalendarRecord(recordId));
        comp.elementsDimensionsChanged();

        setTimeout(() => {
            const record = getCalendarRecord(recordId);
            expect(record.isDragging).toBeTruthy();
            expect(record.visible).toBeTruthy();
            done();
        }, 1);
    });

    it('should have record flagged as visible when outside viewport but parent component does not allow hiding', (done) => {
        spyOnProperty(getCalendar(), 'clientHeight', 'get').and.returnValue(0);
        const recordId = MOCK_CALENDAR[0].records[0].id;

        comp.canHideRecord = (id: string) => id !== recordId;
        comp.elementsDimensionsChanged();

        setTimeout(() => {
            expect(getCalendarRecord(recordId).visible).toBeTruthy();
            done();
        }, 1);
    });

    it('should have records flagged as visible when inside viewport', (done) => {
        const calendar = getCalendar();
        spyOnProperty(calendar, 'clientHeight', 'get').and.returnValue(10000);
        spyOnProperty(calendar, 'clientWidth', 'get').and.returnValue(10000);

        comp.elementsDimensionsChanged();

        setTimeout(() => {
            expect(comp.parsedRows
                .every(row => flatten(row.lines).every(calendarRecord => !calendarRecord.record || calendarRecord.visible))).toBeTruthy();
            done();
        }, 1);
    });

    it('should emit copyRecords when one record is dropped and recordGridUnit is set to \'week\'', () => {
        comp.isCopying = true;
        spyOn(comp.copyRecords, 'emit').and.callThrough();

        const target: Element = getCalendarSlot();

        const rowId = MOCK_CALENDAR[1].id;
        const id = draggingCalendarRecord.record.id;
        const shiftDays = NUMBER_OF_DAYS_PER_WEEK;
        const expectedPayload = [new MoveRecordPayload(id, rowId, shiftDays)];

        testHostComp.recordGridUnit = 'week';
        fixture.detectChanges();

        draggingCalendarRecord.record.rowId = rowId;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggingCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.copyRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit copyRecords when one record is dropped and recordGridUnit is set to \'day\'', () => {
        comp.isCopying = true;
        spyOn(comp.copyRecords, 'emit').and.callThrough();

        const target: Element = getCalendarSlot();

        const rowId = MOCK_CALENDAR[1].id;
        const id = draggingCalendarRecord.record.id;
        const shiftDays = 1;
        const expectedPayload = [new MoveRecordPayload(id, rowId, shiftDays)];

        testHostComp.recordGridUnit = 'day';
        fixture.detectChanges();

        draggingCalendarRecord.record.rowId = rowId;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggingCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.copyRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit copyRecords when multiple records are dropped and recordGridUnit is set to \'week\'', () => {
        comp.isCopying = true;
        spyOn(comp.copyRecords, 'emit').and.callThrough();

        const target: Element = getCalendarSlot();
        const rowId = MOCK_CALENDAR[1].id;
        const selectedRecordIds = [MOCK_CALENDAR[0].records[0].id, MOCK_CALENDAR[0].records[8].id];
        const selectedRecords = selectedRecordIds.map(id => {
            const calendarRecord = getCalendarRecord(id);

            return {...calendarRecord, record: {...calendarRecord.record, rowId}};
        });
        const draggedCalendarRecord = selectedRecords[0];
        const shiftDays = NUMBER_OF_DAYS_PER_WEEK;
        const expectedPayload: MoveRecordPayload[] = selectedRecords.map(record => {
            const {id} = record.record;

            return new MoveRecordPayload(id, rowId, shiftDays);
        }).reverse();

        testHostComp.recordGridUnit = 'week';
        fixture.detectChanges();

        comp.selectedRecordIds = selectedRecordIds;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggedCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggedCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.copyRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit copyRecords when multiple records are dropped and recordGridUnit is set to \'day\'', () => {
        comp.isCopying = true;
        spyOn(comp.copyRecords, 'emit').and.callThrough();

        const target: Element = getCalendarSlot();
        const rowId = MOCK_CALENDAR[1].id;
        const selectedRecordIds = [MOCK_CALENDAR[0].records[0].id, MOCK_CALENDAR[0].records[8].id];
        const selectedRecords = selectedRecordIds.map(id => {
            const calendarRecord = getCalendarRecord(id);

            return {...calendarRecord, record: {...calendarRecord.record, rowId}};
        });
        const draggedCalendarRecord = selectedRecords[0];
        const shiftDays = 1;
        const expectedPayload: MoveRecordPayload[] = selectedRecords.map(record => {
            const {id} = record.record;

            return new MoveRecordPayload(id, rowId, shiftDays);
        }).reverse();

        testHostComp.recordGridUnit = 'day';
        fixture.detectChanges();

        comp.selectedRecordIds = selectedRecordIds;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggedCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggedCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.copyRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit copyRecords for records outside the calendar scope and recordGridUnit is set to \'week\'', () => {
        const rowId = '456';
        const records = [
            {end: moment('2018-10-06'), id: '123', position: null, start: moment('2018-10-01')},
            {end: moment('2018-10-13'), id: '456', position: null, start: moment('2018-10-08')},
            {end: moment('2018-10-20'), id: '789', position: null, start: moment('2018-10-15')},
        ];
        const selectedRecords = [records[0], records[1]];
        const selectedRecordIds = selectedRecords.map(record => record.id);

        testHostComp.rows = [
            {
                id: '123',
                name: 'name1',
                position: 0,
                records,
            }, {
                id: rowId,
                name: 'name2',
                position: 1,
                records: [],
            },
        ];
        testHostComp.recordGridUnit = 'week';

        comp.scope = {
            end: moment('2019-01-20').endOf('week'),
            start: moment('2018-10-08').endOf('week'),
        };
        comp.selectedRecordIds = selectedRecordIds;
        comp.isCopying = true;
        fixture.detectChanges();

        spyOn(comp.copyRecords, 'emit').and.callThrough();

        const shiftDays = NUMBER_OF_DAYS_PER_WEEK;
        const expectedPayload: MoveRecordPayload[] = selectedRecords.map(record => {
            const {id} = record;

            return new MoveRecordPayload(id, rowId, shiftDays);
        });
        const draggedCalendarRecord = getCalendarRecord(selectedRecordIds[1]);
        const target = getCalendarSlot();

        comp.selectedRecordIds = selectedRecordIds;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggedCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggedCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.copyRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit copyRecords for records outside the calendar scope and recordGridUnit is set to \'day\'', () => {
        const rowId = '456';
        const records = [
            {end: moment('2018-10-06'), id: '123', position: null, start: moment('2018-10-01')},
            {end: moment('2018-10-13'), id: '456', position: null, start: moment('2018-10-08')},
            {end: moment('2018-10-20'), id: '789', position: null, start: moment('2018-10-15')},
        ];
        const selectedRecords = [records[0], records[1]];
        const selectedRecordIds = selectedRecords.map(record => record.id);

        testHostComp.rows = [
            {
                id: '123',
                name: 'name1',
                position: 0,
                records,
            }, {
                id: rowId,
                name: 'name2',
                position: 1,
                records: [],
            },
        ];
        testHostComp.recordGridUnit = 'day';

        comp.scope = {
            end: moment('2019-01-20').endOf('week'),
            start: moment('2018-10-08').endOf('week'),
        };
        comp.selectedRecordIds = selectedRecordIds;
        comp.isCopying = true;
        fixture.detectChanges();

        spyOn(comp.copyRecords, 'emit').and.callThrough();

        const shiftDays = 1;
        const expectedPayload: MoveRecordPayload[] = selectedRecords.map(record => {
            const {id} = record;

            return new MoveRecordPayload(id, rowId, shiftDays);
        });
        const draggedCalendarRecord = getCalendarRecord(selectedRecordIds[1]);
        const target = getCalendarSlot();

        comp.selectedRecordIds = selectedRecordIds;
        comp.handleRecordMouseDown(mouseDownEvent);
        comp.handleRecordDragStart(dragStartEvent, draggedCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggedCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.copyRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit copyRecords when record is dropped but don\'t change position and recordGridUnit is set to \'week\'', () => {
        comp.isCopying = true;
        spyOn(comp.copyRecords, 'emit').and.callThrough();

        const target: Element = getCalendarOriginSlot();

        const rowId = MOCK_CALENDAR[0].id;
        const id = draggingCalendarRecord.record.id;
        const shiftDays = 0;
        const expectedPayload = [new MoveRecordPayload(id, rowId, shiftDays)];

        testHostComp.recordGridUnit = 'week';
        fixture.detectChanges();

        comp.handleRecordMouseDown(mouseDownEvent);
        draggingCalendarRecord.record.rowId = rowId;
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggingCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.copyRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit copyRecords when record is dropped but don\'t change position and recordGridUnit is set to \'day\'', () => {
        comp.isCopying = true;
        spyOn(comp.copyRecords, 'emit').and.callThrough();

        const target: Element = getCalendarOriginSlot();

        const rowId = MOCK_CALENDAR[0].id;
        const id = draggingCalendarRecord.record.id;
        const shiftDays = 0;
        const expectedPayload = [new MoveRecordPayload(id, rowId, shiftDays)];

        testHostComp.recordGridUnit = 'day';
        fixture.detectChanges();

        comp.handleRecordMouseDown(mouseDownEvent);
        draggingCalendarRecord.record.rowId = rowId;
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleDrop({
            item: {
                data: draggingCalendarRecord,
            },
            container: target,
        } as unknown as CdkDragDrop<CalendarRecord>);

        expect(comp.copyRecords.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should have all records with drag disabled when they can\'t be dragged and can be moved', () => {
        comp.canDragRecord = () => false;
        comp.canMoveRecord = () => true;
        comp.isCopying = false;
        comp.rows = MOCK_CALENDAR;

        comp.parsedRows.forEach(row => {
            row.lines.forEach(calendarRecords => {
                calendarRecords.forEach(calendarRecord => {
                    expect(calendarRecord.dragRecordDisabled).toBeTruthy();
                });
            });
        });
    });

    it('should have all records with drag disabled when they can\'t be dragged and can be copied', () => {
        comp.canDragRecord = () => false;
        comp.canMoveRecord = () => false;
        comp.isCopying = true;
        comp.rows = MOCK_CALENDAR;

        comp.parsedRows.forEach(row => {
            row.lines.forEach(calendarRecords => {
                calendarRecords.forEach(calendarRecord => {
                    expect(calendarRecord.dragRecordDisabled).toBeTruthy();
                });
            });
        });
    });

    it('should have all records with drag enable when they can be dragged and moved', () => {
        comp.canDragRecord = () => true;
        comp.canMoveRecord = () => true;
        comp.isCopying = false;
        comp.rows = MOCK_CALENDAR;

        comp.parsedRows.forEach(row => {
            row.lines.forEach(calendarRecords => {
                calendarRecords.forEach(calendarRecord => {
                    expect(calendarRecord.dragRecordDisabled).toBe(!calendarRecord.record);
                });
            });
        });
    });

    it('should have all records with drag enabled when they can be dragged and copied', () => {
        comp.canDragRecord = () => true;
        comp.canMoveRecord = () => false;
        comp.isCopying = true;
        testHostComp.rows = MOCK_CALENDAR;
        fixture.detectChanges();

        comp.parsedRows.forEach(row => {
            row.lines.forEach(calendarRecords => {
                calendarRecords.forEach(calendarRecord => {
                    expect(calendarRecord.dragRecordDisabled).toBe(!calendarRecord.record);
                });
            });
        });
    });

    it('should update records dragging state when selectedRecordIds changes', () => {
        const selectedRecordIds = [MOCK_CALENDAR[0].records[0].id, MOCK_CALENDAR[0].records[8].id];
        const numberOfTasks = flatten(comp.parsedRows.map(row => flatten(row.lines)))
            .filter(calendarRecord => calendarRecord.record)
            .length;

        comp.selectedRecordIds = [];

        spyOn(comp, 'canMoveRecord').and.callThrough();

        comp.selectedRecordIds = selectedRecordIds;

        expect(comp.canMoveRecord).toHaveBeenCalledTimes(numberOfTasks);
    });

    it('should cancel drag when leaving copy mode while dragging a task that cannot be dragged', () => {
        spyOn(document, 'dispatchEvent').and.callThrough();
        comp.canMoveRecord = () => false;
        comp.isCopying = true;
        testHostComp.rows = MOCK_CALENDAR;
        fixture.detectChanges();

        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.isCopying = false;

        expect(document.dispatchEvent).toHaveBeenCalledWith(new Event('mouseup'));
    });

    it('should add class to body to style cursor when moving record', () => {
        comp.isCopying = false;
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        expect(document.body.classList).toContain(CursorClassEnum.Grabbing);
    });

    it('should add class to body to style cursor when copying record', () => {
        comp.isCopying = true;
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);

        expect(document.body.classList).toContain(CursorClassEnum.Copy);
    });

    it('should remove class from body to style cursor when not moving record', () => {
        comp.isCopying = false;
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        expect(document.body.classList).toContain(CursorClassEnum.Grabbing);

        comp.handleRecordDragEnd();
        expect(document.body.classList).not.toContain(CursorClassEnum.Grabbing);
    });

    it('should remove class from body to style cursor when not copying record', () => {
        comp.isCopying = true;
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        expect(document.body.classList).toContain(CursorClassEnum.Copy);

        comp.handleRecordDragEnd();
        expect(document.body.classList).not.toContain(CursorClassEnum.Copy);
    });

    it('should toggle cursor styles while dragging and toggling between move and copy mode', () => {
        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.isCopying = true;
        expect(document.body.classList).toContain(CursorClassEnum.Copy);

        comp.isCopying = false;
        expect(document.body.classList).toContain(CursorClassEnum.Grabbing);
    });

    it('should emit weekWidthChange when the column width changes', (done) => {
        spyOn(comp.weekWidthChange, 'emit').and.callThrough();
        const expectedResult = 284;
        const calendarWidth = 1800 + leftColumnWidth;

        spyOn(comp.calendar.nativeElement, 'getBoundingClientRect').and.returnValue({width: calendarWidth});
        when(breakpointHelperMock.isCurrentBreakpoint(breakpointsRange.xl)).thenReturn(true);

        testHostComp.rows = createLine(1);
        fixture.detectChanges();
        comp.ngOnInit();

        resize$.next();

        setTimeout(() => {
            expect(comp.weekWidthChange.emit).toHaveBeenCalledWith(expectedResult);
            done();
        }, resizeDebounceTime + 1);
    });

    it('should add class to calendar when hideScroll is true', () => {
        testHostComp.hideScroll = true;
        fixture.detectChanges();
        expect(comp.calendar.nativeElement.classList).toContain(hideScrollClass);
    });

    it('should remove class from calendar when hideScroll is false', () => {
        testHostComp.hideScroll = true;
        fixture.detectChanges();
        expect(comp.calendar.nativeElement.classList).toContain(hideScrollClass);
        testHostComp.hideScroll = false;
        fixture.detectChanges();
        expect(comp.calendar.nativeElement.classList).not.toContain(hideScrollClass);
    });

    it('should set multipleRecordsSelected to true when multiple records are selected', () => {
        const selectedRecordIds = [MOCK_CALENDAR[0].records[0].id, MOCK_CALENDAR[0].records[8].id];

        comp.selectedRecordIds = selectedRecordIds;

        expect(comp.multipleRecordsSelected).toBeTruthy();
    });

    it('should set multipleRecordsSelected to false when only one record is selected', () => {
        const selectedRecordIds = [MOCK_CALENDAR[0].records[8].id];

        comp.selectedRecordIds = selectedRecordIds;

        expect(comp.multipleRecordsSelected).toBeFalsy();
    });

    it('should return selected records ids with the last dragged record at the end when currentRecordsIds is called', () => {
        const recordA = MOCK_CALENDAR[0].records[0].id;
        const recordB = MOCK_CALENDAR[0].records[8].id;
        const expectedResult = [recordB, recordA];
        const selectedRecordIds = [recordA, recordB];
        const draggedCalendarRecord = getCalendarRecord(recordA);

        comp.selectedRecordIds = selectedRecordIds;
        comp.handleRecordDragStart(dragStartEvent, draggedCalendarRecord);

        expect(comp.currentRecordsIds).toEqual(expectedResult);
    });

    it('should return selected record ids of records outside the calendar scope whe currentRecordsIds is called', () => {
        const records = [
            {end: moment('2018-10-06'), id: '123', position: null, start: moment('2018-10-01')},
            {end: moment('2018-10-13'), id: '456', position: null, start: moment('2018-10-08')},
            {end: moment('2018-10-20'), id: '789', position: null, start: moment('2018-10-15')},
        ];
        const expectedResult = [records[0].id, records[1].id];
        const selectedRecordIds = [records[0].id, records[1].id];

        testHostComp.rows = [
            {
                id: '123',
                name: 'name1',
                position: 0,
                records,
            },
        ];
        comp.scope = {
            end: moment('2019-01-20').endOf('week'),
            start: moment('2018-10-08').endOf('week'),
        };
        comp.selectedRecordIds = selectedRecordIds;
        fixture.detectChanges();
        const draggedCalendarRecord = getCalendarRecord(selectedRecordIds[1]);
        comp.handleRecordDragStart(dragStartEvent, draggedCalendarRecord);

        expect(comp.currentRecordsIds).toEqual(expectedResult);
    });

    it('should display correct year scope label when calendar time scope is in the same year', (done) => {
        const expectedResult = startDate.get('y').toString();

        comp.scope = {
            end: endDate,
            start: startDate,
        };

        setTimeout(() => {
            expect(comp.yearScopeLabel).toBe(expectedResult);
            expect(getElement(calendarHeaderYearScope).innerText).toBe(expectedResult);
            done();
        }, 1);
    });

    it('should display correct year scope label when calendar time scope spans for more then 1 year', (done) => {
        const startScope = moment('2018-10-08').startOf('week');
        const endScope = moment('2019-01-20').endOf('week');
        const expectedResult = `${startScope.get('y').toString()} / ${endScope.get('y').toString()}`;

        comp.scope = {
            end: endScope,
            start: startScope,
        };

        setTimeout(() => {
            expect(comp.yearScopeLabel).toBe(expectedResult);
            expect(getElement(calendarHeaderYearScope).innerText).toBe(expectedResult);
            done();
        }, 1);
    });

    it('should show milestones creation slots in header and on every row when enableMilestoneCreation is true', (done) => {
        const expectedNumberOfCreationSlots = MOCK_CALENDAR.length + 1;

        comp.enableMilestoneCreation = true;

        setTimeout(() => {
            expect(getElements(calendarMilestonesCreationSlotsSelector).length).toBe(expectedNumberOfCreationSlots);
            done();
        }, 1);
    });

    it('should not show milestones creation slots when enableMilestoneCreation is false', (done) => {
        comp.enableMilestoneCreation = false;

        setTimeout(() => {
            expect(getElements(calendarMilestonesCreationSlotsSelector).length).toBe(0);
            done();
        }, 1);
    });

    it('should set the daySlotsWithMilestones of every week to false when there are no milestones', () => {
        testHostComp.milestones = {};

        comp.weeks.forEach(week => {
            expect(week.daySlotsWithMilestones.length).toBe(NUMBER_OF_DAYS_PER_WEEK);
            expect(week.daySlotsWithMilestones).not.toContain(true);
        });
    });

    it('should set the daySlotsWithMilestones of the days with milestones to true', () => {
        const headerMilestones: CalendarMilestone[] = [
            {id: '1', date: startDate.clone().add(3, 'd')},
            {id: '2', date: startDate.clone().add(9, 'd')},
        ];
        const noRowMilestones: CalendarMilestone[] = [
            {id: '3', date: startDate.clone().add(9, 'd')},
            {id: '4', date: startDate.clone().add(15, 'd')},
        ];

        const fooMilestones: CalendarMilestone[] = [
            {id: '5', date: startDate.clone().add(17, 'd')},
            {id: '6', date: startDate.clone().add(18, 'd')},
        ];
        const milestones = [...headerMilestones, ...noRowMilestones, ...fooMilestones];

        testHostComp.milestones = {
            header: headerMilestones,
            ['no-row']: noRowMilestones,
            foo: fooMilestones,
        };
        fixture.detectChanges();

        flatten(comp.weeks.map(week => week.daySlotsWithMilestones))
            .forEach((isDayHighlighted, index) => {
                const day = startDate.clone().add(index, 'd');
                const hasMilestone = milestones.some(milestone => milestone.date.isSame(day, 'd'));

                expect(hasMilestone).toBe(isDayHighlighted);
            });
    });

    it('should allow a calendar record to enter a container', () => {
        const cdkDrag = {
            data: draggingCalendarRecord,
        } as CdkDrag;

        expect(comp.canEnterContainer(cdkDrag)).toBeTruthy();
    });

    it('should not allow a non calendar record to enter a container', () => {
        const cdkDrag = {
            data: {isNotCalendarRecord: true},
        } as CdkDrag;

        expect(comp.canEnterContainer(cdkDrag)).toBeFalsy();
    });

    it('should emit moveMilestone when handleMoveMilestone is called', () => {
        const moveMilestonePayload: MoveMilestonePayload = {
            id: 'foo',
            date: startDate.clone().add(3, 'd'),
            rowId: 'header',
            position: 0,
        };

        spyOn(comp.moveMilestone, 'emit').and.callThrough();

        comp.handleMoveMilestone(moveMilestonePayload);

        expect(comp.moveMilestone.emit).toHaveBeenCalledWith(moveMilestonePayload);
    });

    it('should keep scroll on the provided element when keepScrollOnElement is called', (done) => {
        const calendar: HTMLElement = getCalendar();
        const calendarHeight = 200;
        const elementGrowingNewHeight = 50;

        calendar.style.height = `${calendarHeight}px`;

        testHostComp.milestones = {
            ['456']: [{id: '1', date: startDate.clone().add(3, 'd')}],
        };

        fixture.detectChanges();

        const elementGrowing: HTMLElement = getElement(getCalendarMilestonesSlotsSelector('123'));
        const elementToKeepScroll: HTMLElement = getElement(getCalendarMilestonesSlotsSelector('456'));

        elementGrowing.style.height = `${0}px`;
        comp.keepScrollOnElement(new ElementRef(elementToKeepScroll));
        elementGrowing.style.height = `${elementGrowingNewHeight}px`;

        setTimeout(() => {
            expect(calendar.scrollTop).toBe(elementGrowingNewHeight);
            done();
        }, 1);
    });

    it('should set header focusDay when milestone is dragging on a specific day', () => {
        const expectedDay = startDate.clone().add(3, 'd');

        comp.handleMilestoneDraggingOnDay(expectedDay);

        expect(comp.calendarHeaderFocusedDay).toBe(expectedDay);
    });

    it('should render dependencies artboard', () => {
        expect(getElement(calendarDependenciesArtboardSelector)).toBeTruthy();
    });

    it('should render dependency lines when there are calendar dependency lines', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], calendarDependencies, false)};

        dependenciesHelperGetCalendarLinesSpy.and.returnValue(dependencyLines);

        comp.dependencies = calendarDependencies;
        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(getElements(calendarDependencyLineSelector).length).toBe(calendarDependencies.length);

        calendarDependencies.forEach(({id}, index) => {
            const expectedPath = dependencyLines[index].line.linePath;

            expect(getElement(getCalendarDependencyLineSelector(id)).getAttribute('d')).toBe(expectedPath);
        });
    }));

    it('should render dependency lines dimmed out except the ones directly connected when an element is focused.', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], calendarDependencies, false)};

        dependenciesHelperGetCalendarLinesSpy.and.returnValue(dependencyLinesWithFocus);

        comp.dependencies = calendarDependenciesWithFocus;
        comp.focusedElementId = calendarDependenciesWithFocus[0].source.id;
        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(getElements(calendarDependencyLineSelector).length).toBe(calendarDependencies.length);

        calendarDependencies.forEach(({id}, index) => {
            const dimmedOut = dependencyLinesWithFocus[index].dimmedOut;
            const element = getElement(getCalendarDependencyGroupSelector(id));
            expect(element.classList.contains('ss-calendar-dependency--dimmed-out')).toBe(dimmedOut);
        });
    }));

    it('should not render dependency lines when there are no calendar dependency lines', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], [], false)};

        dependenciesHelperGetCalendarLinesSpy.and.returnValue([]);

        comp.dependencies = [];
        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(getElements(calendarDependencyLineSelector).length).toBe(0);
    }));

    it('should add the CSS class ss-calendar-dependency--critical only for critical dependency lines', fakeAsync(() => {
        const criticalDependencyLineCSSClass = 'ss-calendar-dependency--critical';
        const changes: SimpleChanges = {dependencies: new SimpleChange([], calendarDependencies, false)};

        dependenciesHelperGetCalendarLinesSpy.and.returnValue(dependencyLinesWithCriticalDependencies);

        comp.dependencies = calendarDependencies;
        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        criticalCalendarDependencies.forEach(({id}, index) => {
            if (dependencyLinesWithCriticalDependencies[index].critical) {
                expect(getElement(getCalendarDependencyGroupSelector(id)).classList).toContain(criticalDependencyLineCSSClass);
            } else {
                expect(getElement(getCalendarDependencyGroupSelector(id)).classList).not.toContain(criticalDependencyLineCSSClass);
            }
        });
    }));

    it('should add dimmed out class modifiers to out of scope indicators where dimmedOut is set to true', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], [], false)};
        const myDependencyOutOfScopeIndicators = [
            ...dependencyOutOfScopeIndicators,
            ...dependencyOutOfScopeIndicators,
        ];
        myDependencyOutOfScopeIndicators[0].id = `${CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_ID_PREFIX}-foo`;
        myDependencyOutOfScopeIndicators[0].dimmedOut = false;

        myDependencyOutOfScopeIndicators[1].id = `${CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_ID_PREFIX}-bar`;
        myDependencyOutOfScopeIndicators[1].dimmedOut = true;
        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.and.returnValue(myDependencyOutOfScopeIndicators);

        comp.dependencies = [];
        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(getElements(calendarDependencyOutOfScopeIndicatorSelector).length).toBe(myDependencyOutOfScopeIndicators.length);
        myDependencyOutOfScopeIndicators.forEach(({id}, index) => {
            const expectedDimmedOut = myDependencyOutOfScopeIndicators[index].dimmedOut;
            const line = getElement(getCalendarDependencyOutOfScopeIndicatorLineSelector(id));
            const circle = getElement(getCalendarDependencyOutOfScopeIndicatorCircleSelector(id));
            const text = getElement(getCalendarDependencyOutOfScopeIndicatorTextSelector(id));
            expect(line.classList.contains('ss-calendar-out-of-scope-indicator__line--dimmed-out')).toBe(expectedDimmedOut);
            expect(circle.classList.contains('ss-calendar-out-of-scope-indicator__circle--dimmed-out')).toBe(expectedDimmedOut);
            expect(text.classList.contains('ss-calendar-out-of-scope-indicator__text--dimmed-out')).toBe(expectedDimmedOut);
        });

    }));

    it('should render dependency out of scope indicators when they exist', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], [], false)};

        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.and.returnValue(dependencyOutOfScopeIndicators);

        comp.dependencies = [];
        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(getElements(calendarDependencyOutOfScopeIndicatorSelector).length).toBe(dependencyOutOfScopeIndicators.length);

        dependencyOutOfScopeIndicators.forEach(({id}, index) => {
            const expectedPath = dependencyOutOfScopeIndicators[index].line.d;
            const expectedCircleCoordinates = dependencyOutOfScopeIndicators[index].circle;
            const expectedTextCoordinates = dependencyOutOfScopeIndicators[index].text;
            const expectedNumber = dependencyOutOfScopeIndicators[index].count;

            expect(getElement(getCalendarDependencyOutOfScopeIndicatorLineSelector(id)).getAttribute('d')).toBe(expectedPath);
            expect(getElement(getCalendarDependencyOutOfScopeIndicatorTextSelector(id)).textContent).toBe(expectedNumber.toString());
            expect(getElement(getCalendarDependencyOutOfScopeIndicatorCircleSelector(id)).getAttribute('cx'))
                .toBe(expectedCircleCoordinates.cx.toString());
            expect(getElement(getCalendarDependencyOutOfScopeIndicatorCircleSelector(id)).getAttribute('cy'))
                .toBe(expectedCircleCoordinates.cy.toString());
            expect(getElement(getCalendarDependencyOutOfScopeIndicatorCircleSelector(id)).getAttribute('r'))
                .toBe(expectedCircleCoordinates.r.toString());
            expect(getElement(getCalendarDependencyOutOfScopeIndicatorTextSelector(id)).getAttribute('x'))
                .toBe(expectedTextCoordinates.x.toString());
            expect(getElement(getCalendarDependencyOutOfScopeIndicatorTextSelector(id)).getAttribute('y'))
                .toBe(expectedTextCoordinates.y.toString());
        });
    }));

    it('should not render dependency out of scope indicators when there are no dependencies out of scope', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], [], false)};

        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.and.returnValue([]);

        comp.dependencies = [];
        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(getElements(calendarDependencyOutOfScopeIndicatorSelector).length).toBe(0);
    }));

    it('should call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when rows changes', fakeAsync(() => {
        const changes: SimpleChanges = {rows: new SimpleChange([], [], false)};

        expect(dependenciesHelperGetCalendarLinesSpy).not.toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).not.toHaveBeenCalled();

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalled();
    }));

    it('should call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when ' +
        'enableMilestoneCreation changes', fakeAsync(() => {
        const changes: SimpleChanges = {enableMilestoneCreation: new SimpleChange([], true, false)};

        expect(dependenciesHelperGetCalendarLinesSpy).not.toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).not.toHaveBeenCalled();

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalled();
    }));

    it('should call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when milestones changes', fakeAsync(() => {
        const changes: SimpleChanges = {milestones: new SimpleChange([], [], false)};

        expect(dependenciesHelperGetCalendarLinesSpy).not.toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).not.toHaveBeenCalled();

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalled();
    }));

    it('should call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when dependencies changes', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], calendarDependencies, false)};

        expect(dependenciesHelperGetCalendarLinesSpy).not.toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).not.toHaveBeenCalled();

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalled();
    }));

    it('should call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when target ' +
        'anchor coordinates input changes', fakeAsync(() => {
        const targetAnchorPointByObjectType = {['foo']: () => null};
        const changes: SimpleChanges = {
            targetAnchorPointByObjectType: new SimpleChange(null, targetAnchorPointByObjectType, false),
        };

        expect(dependenciesHelperGetCalendarLinesSpy).not.toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).not.toHaveBeenCalled();

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalled();
    }));

    it('should call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when ' +
        'source anchor coordinates input changes', fakeAsync(() => {
        const sourceAnchorPointByObjectType = {['foo']: () => null};
        const changes: SimpleChanges = {
            sourceAnchorPointByObjectType: new SimpleChange(null, sourceAnchorPointByObjectType, false),
        };

        expect(dependenciesHelperGetCalendarLinesSpy).not.toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).not.toHaveBeenCalled();

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalled();
    }));

    it('should call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when anchor point Y base by strategy and ' +
        'object type input changes', fakeAsync(() => {
        const anchorPointYBaseByStrategyAndObjectType: CalendarDependencyAnchorPointYBaseByStrategyAndObjectType =
            {['mocked-object-type' as ObjectTypeEnum]: 0};
        const changes: SimpleChanges = {
            anchorPointYBaseByStrategyAndObjectType: new SimpleChange(null, anchorPointYBaseByStrategyAndObjectType, false),
        };

        expect(dependenciesHelperGetCalendarLinesSpy).not.toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).not.toHaveBeenCalled();

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalled();
    }));

    it('should not call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when handleIsMilestoneDragging ' +
        'is called with TRUE and there are dependencies', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], calendarDependencies, false)};
        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        dependenciesHelperGetCalendarLinesSpy.calls.reset();
        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.calls.reset();

        comp.handleIsMilestoneDragging(true);
        fixture.detectChanges();

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).not.toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).not.toHaveBeenCalled();
    }));

    it('should call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when handleIsMilestoneDragging ' +
        'is called with FALSE and there are dependencies', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], calendarDependencies, false)};
        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        dependenciesHelperGetCalendarLinesSpy.calls.reset();
        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.calls.reset();

        comp.handleIsMilestoneDragging(false);
        fixture.detectChanges();

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalled();
    }));

    it('should not call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when handleRecordDragStart ' +
        'is called and there are dependencies', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], calendarDependencies, false)};
        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        dependenciesHelperGetCalendarLinesSpy.calls.reset();
        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.calls.reset();

        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        fixture.detectChanges();

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).not.toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).not.toHaveBeenCalled();
    }));

    it('should call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when handleRecordDragEnd ' +
        'is called and there are dependencies', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], calendarDependencies, false)};
        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        dependenciesHelperGetCalendarLinesSpy.calls.reset();
        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.calls.reset();

        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleRecordDragEnd();
        fixture.detectChanges();

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalled();
    }));

    it('should not call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when isResizingRecord ' +
        'is set to TRUE and there are dependencies', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], calendarDependencies, false)};
        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        dependenciesHelperGetCalendarLinesSpy.calls.reset();
        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.calls.reset();

        comp.isResizingRecord = true;
        fixture.detectChanges();

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).not.toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).not.toHaveBeenCalled();
    }));

    it('should call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when isResizingRecord ' +
        'is set to FALSE and there are dependencies', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], calendarDependencies, false)};
        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        dependenciesHelperGetCalendarLinesSpy.calls.reset();
        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.calls.reset();

        comp.isResizingRecord = false;
        fixture.detectChanges();

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalled();
    }));

    it('should call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when ' +
        'handleScroll is called and scroll has reached threshold', fakeAsync(() => {
        expect(dependenciesHelperGetCalendarLinesSpy).not.toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).not.toHaveBeenCalled();

        comp.handleScroll();

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalled();
    }));

    it('should add the CSS class ss-calendar-out-of-scope-indicator__circle--has-critical-dependencies only for critical ' +
        'dependency lines', fakeAsync(() => {
        const criticalDependenciesCSSClass = 'ss-calendar-out-of-scope-indicator__circle--has-critical-dependencies';
        const changes: SimpleChanges = {dependencies: new SimpleChange([], [], false)};

        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.and.returnValue(dependencyOutOfScopeIndicatorsWithCriticalDependencies);

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        dependencyOutOfScopeIndicatorsWithCriticalDependencies.forEach(({id, critical}) => {
            if (critical) {
                expect(getElement(getCalendarDependencyOutOfScopeIndicatorCircleSelector(id)).classList)
                    .toContain(criticalDependenciesCSSClass);
            } else {
                expect(getElement(getCalendarDependencyOutOfScopeIndicatorCircleSelector(id)).classList)
                    .not.toContain(criticalDependenciesCSSClass);
            }
        });
    }));

    it('should set showDependencies to FALSE when handleIsMilestoneDragging is called with TRUE', () => {
        expect(comp.showDependencies).toBeTruthy();

        comp.handleIsMilestoneDragging(true);

        fixture.detectChanges();

        expect(comp.showDependencies).toBeFalsy();
    });

    it('should set showDependencies to TRUE when handleIsMilestoneDragging is called with FALSE ', () => {
        expect(comp.showDependencies).toBeTruthy();

        comp.handleIsMilestoneDragging(false);

        fixture.detectChanges();

        expect(comp.showDependencies).toBeTruthy();
    });

    it('should set showDependencies to FALSE when handleRecordDragStart is called', () => {
        expect(comp.showDependencies).toBeTruthy();

        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);

        fixture.detectChanges();

        expect(comp.showDependencies).toBeFalsy();
    });

    it('should set showDependencies to TRUE when handleRecordDragEnd is called and ', () => {
        expect(comp.showDependencies).toBeTruthy();

        comp.handleRecordDragStart(dragStartEvent, draggingCalendarRecord);
        comp.handleRecordDragEnd();

        fixture.detectChanges();

        expect(comp.showDependencies).toBeTruthy();
    });

    it('should set showDependencies to FALSE when isResizingRecord input is set to TRUE', () => {
        expect(comp.showDependencies).toBeTruthy();

        comp.isResizingRecord = true;

        fixture.detectChanges();

        expect(comp.showDependencies).toBeFalsy();
    });

    it('should set showDependencies to TRUE when isResizingRecord input is set to FALSE', () => {
        expect(comp.showDependencies).toBeTruthy();

        comp.isResizingRecord = false;

        fixture.detectChanges();

        expect(comp.showDependencies).toBeTruthy();
    });

    it('should add the CSS modifier class ss-calendar-dependencies--hidden to SVG calendar dependencies if ' +
        'showDependencies is set to FALSE', fakeAsync(() => {
        expect(getElement(calendarDependenciesArtboardSelector).classList).not.toContain('ss-calendar-dependencies--hidden');

        fixture.whenStable().then(() => {
            comp.showDependencies = false;
            fixture.detectChanges();
            expect(getElement(calendarDependenciesArtboardSelector).classList).toContain('ss-calendar-dependencies--hidden');
        });
    }));

    it('should not add the CSS modifier class ss-calendar-dependencies--hidden to SVG calendar dependencies if ' +
        'showDependencies is set to TRUE', () => {
        expect(getElement(calendarDependenciesArtboardSelector).classList).not.toContain('ss-calendar-dependencies--hidden');

        fixture.whenStable().then(() => {
            comp.showDependencies = true;
            fixture.detectChanges();
            expect(getElement(calendarDependenciesArtboardSelector).classList).not.toContain('ss-calendar-dependencies--hidden');
        });
    });

    it('should trigger a dependencies visibility transition and call Calendar Dependencies Helper Get Lines and ' +
        'Get Out of Scope Indicators when current scope end is different from the previous one and there are dependencies',
    fakeAsync(() => {
        const newEndDate = endDate.clone().add(1, 'w');
        const previousScope = {start: startDate, end: endDate};
        const newScope = {start: startDate, end: newEndDate};
        const changes: SimpleChanges = {dependencies: new SimpleChange([], [], false)};
        const scopeChanges: SimpleChanges = {scope: new SimpleChange(previousScope, newScope, false)};

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        comp.ngOnChanges(scopeChanges);
        fixture.detectChanges();

        expect(comp.showDependencies).toBeFalsy();

        tick(CALENDAR_DEPENDENCIES_VISIBILITY_TRANSITION_DELAY_TIME_MS);

        expect(comp.showDependencies).toBeTruthy();

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalledTimes(2);
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalledTimes(2);
    }));

    it('should trigger a dependencies visibility transition and call Calendar Dependencies Helper Get Lines and ' +
        'Get Out of Scope Indicators when current scope start is different from the previous one and there are dependencies',
    fakeAsync(() => {
        const newStartDate = startDate.clone().add(1, 'w');
        const previousScope = {start: startDate, end: endDate};
        const newScope = {start: newStartDate, end: endDate};
        const changes: SimpleChanges = {dependencies: new SimpleChange([], [], false)};
        const scopeChanges: SimpleChanges = {scope: new SimpleChange(previousScope, newScope, false)};

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        comp.ngOnChanges(scopeChanges);
        fixture.detectChanges();

        expect(comp.showDependencies).toBeFalsy();

        tick(CALENDAR_DEPENDENCIES_VISIBILITY_TRANSITION_DELAY_TIME_MS);

        expect(comp.showDependencies).toBeTruthy();

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalledTimes(2);
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalledTimes(2);
    }));

    it('should not trigger a dependencies visibility transition and not call Calendar Dependencies Helper Get Lines and ' +
        'Get Out of Scope Indicators when current scope is the same as the previous one and there are dependencies',
    fakeAsync(() => {
        const scope = {start: startDate, end: endDate};
        const previousScope = scope;
        const newScope = scope;
        const changes: SimpleChanges = {dependencies: new SimpleChange([], [], false)};
        const scopeChanges: SimpleChanges = {scope: new SimpleChange(previousScope, newScope, false)};

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        dependenciesHelperGetCalendarLinesSpy.calls.reset();
        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.calls.reset();

        comp.ngOnChanges(scopeChanges);
        fixture.detectChanges();

        expect(comp.showDependencies).toBeTruthy();
        expect(dependenciesHelperGetCalendarLinesSpy).not.toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).not.toHaveBeenCalled();
    }));

    it('should trigger a dependencies visibility transition and call Calendar Dependencies Helper Get Lines and ' +
        'Get Out of Scope Indicators when current expandedWeeks has 1 more week expanded then the previous one and there are dependencies',
    fakeAsync(() => {
        const week = moment();
        const previousExpandedWeeks = [week];
        const currentExpandedWeeks = [...previousExpandedWeeks, week.clone().add(1, 'w')];
        const changes: SimpleChanges = {dependencies: new SimpleChange([], [], false)};
        const expandedWeekChanges = {expandedWeeks: new SimpleChange(previousExpandedWeeks, currentExpandedWeeks, false)};

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        comp.ngOnChanges(expandedWeekChanges);
        fixture.detectChanges();

        expect(comp.showDependencies).toBeFalsy();

        tick(CALENDAR_DEPENDENCIES_VISIBILITY_TRANSITION_DELAY_TIME_MS);

        expect(comp.showDependencies).toBeTruthy();

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalledTimes(2);
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalledTimes(2);
    }));

    it('should trigger a dependencies visibility transition and call Calendar Dependencies Helper Get Lines and ' +
        'Get Out of Scope Indicators when current expandedWeeks has 1 less week expanded then the previous one and there are dependencies',
    fakeAsync(() => {
        const week = moment();
        const previousExpandedWeeks = [week, week.clone().add(1, 'w')];
        const currentExpandedWeeks = [week];
        const changes: SimpleChanges = {dependencies: new SimpleChange([], [], false)};
        const expandedWeekChanges = {expandedWeeks: new SimpleChange(previousExpandedWeeks, currentExpandedWeeks, false)};

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        comp.ngOnChanges(expandedWeekChanges);
        fixture.detectChanges();

        expect(comp.showDependencies).toBeFalsy();

        tick(CALENDAR_DEPENDENCIES_VISIBILITY_TRANSITION_DELAY_TIME_MS);

        expect(comp.showDependencies).toBeTruthy();

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalledTimes(2);
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalledTimes(2);
    }));

    it('should not trigger a dependencies visibility transition and not call Calendar Dependencies Helper Get Lines and ' +
        'Get Out of Scope Indicators when current expandedWeeks is the same has the previous ones and there are dependencies',
    fakeAsync(() => {
        const week = moment();
        const previousExpandedWeeks = [week];
        const currentExpandedWeeks = [week];
        const changes: SimpleChanges = {dependencies: new SimpleChange([], [], false)};
        const expandedWeekChanges = {expandedWeeks: new SimpleChange(previousExpandedWeeks, currentExpandedWeeks, false)};

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        dependenciesHelperGetCalendarLinesSpy.calls.reset();
        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.calls.reset();

        comp.ngOnChanges(expandedWeekChanges);
        fixture.detectChanges();

        expect(comp.showDependencies).toBeTruthy();
        expect(dependenciesHelperGetCalendarLinesSpy).not.toHaveBeenCalled();
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).not.toHaveBeenCalled();
    }));

    it('should trigger a dependencies visibility transition and call Calendar Dependencies Helper Get Lines and ' +
        'Get Out of Scope Indicators when Resize Helper events emit with an event and there are dependencies',
    fakeAsync(() => {
        const event = new Event('resize');
        const changes: SimpleChanges = {dependencies: new SimpleChange([], [], false)};

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalledTimes(1);
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalledTimes(1);

        resize$.next(event);

        fixture.detectChanges();

        tick(CALENDAR_DEPENDENCIES_UPDATE_RESIZE_DEBOUNCE_TIME_MS);

        expect(comp.showDependencies).toBeFalsy();

        tick(CALENDAR_DEPENDENCIES_VISIBILITY_TRANSITION_DELAY_TIME_MS);

        expect(comp.showDependencies).toBeTruthy();
        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalledTimes(3);
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalledTimes(3);
    }));

    it('should call Calendar Dependencies Helper Get Lines and Get Out of Scope Indicators when Resize Helper events ' +
        'emit without an event and there are dependencies', fakeAsync(() => {
        const changes: SimpleChanges = {dependencies: new SimpleChange([], [], false)};

        comp.ngOnChanges(changes);

        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalledTimes(1);
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalledTimes(1);

        resize$.next();

        fixture.detectChanges();

        tick(CALENDAR_DEPENDENCIES_UPDATE_RESIZE_DEBOUNCE_TIME_MS + CALENDAR_DEPENDENCIES_UPDATE_RESIZE_DEBOUNCE_TIME_MS);

        expect(dependenciesHelperGetCalendarLinesSpy).toHaveBeenCalledTimes(2);
        expect(dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy).toHaveBeenCalledTimes(2);
    }));

    it('should update dependency lines and indicators when elementsDimensionsChanged is called', fakeAsync(() => {
        dependenciesHelperGetCalendarLinesSpy.and.returnValue([]);
        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.and.returnValue([]);

        comp.elementsDimensionsChanged();
        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS + CALENDAR_DEPENDENCIES_UPDATE_CARDS_VISIBILITY_DEBOUNCE_TIME_MS);

        expect(comp.calendarDependencyLines).toEqual([]);
        expect(comp.calendarDependencyOutOfScopeIndicators).toEqual([]);

        dependenciesHelperGetCalendarLinesSpy.and.returnValue(dependencyLines);
        dependenciesHelperGetCalendarOutOfScopeIndicatorsSpy.and.returnValue(dependencyOutOfScopeIndicators);

        comp.elementsDimensionsChanged();
        tick(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS + CALENDAR_DEPENDENCIES_UPDATE_CARDS_VISIBILITY_DEBOUNCE_TIME_MS);

        expect(comp.calendarDependencyLines).toBe(dependencyLines);
        expect(comp.calendarDependencyOutOfScopeIndicators).toBe(dependencyOutOfScopeIndicators);
    }));

    it('should draw the calendar records from left to right and saving as much vertical space as possible ' +
        'when the drawing strategy is set to "default"', () => {
        const expectedRows = [
            ['1A', '3D'],
            ['2C', '4A'],
            ['5B'],
            ['6D'],
        ];

        testHostComp.drawingStrategy = 'default';
        testHostComp.rows = [{
            id: null,
            name: 'without area',
            position: null,
            records: [
                createMockRecord('1A', 0, 2, 'A'),
                createMockRecord('2C', 1, 3, 'C'),
                createMockRecord('3D', 2, 5, 'D'),
                createMockRecord('4A', 3, 5, 'A'),
                createMockRecord('5B', 3, 5, 'B'),
                createMockRecord('6D', 3, 5, 'D'),
            ],
        }];
        fixture.detectChanges();

        expect(mapCalendarParsedRowToRecordIds(comp.parsedRows[0])).toEqual(expectedRows);
    });

    it('should draw the calendar records by grouping them by their groupId and starting the new group ' +
        'in the same line that the last group ended when the drawing strategy is set to "group-same-line"', () => {
        const expectedRows = [
            ['1A', '2A'],
            ['4C', '3B'],
            ['5D'],
            ['6D'],
        ];

        testHostComp.drawingStrategy = 'group-same-line';
        testHostComp.rows = [{
            id: null,
            name: 'without area',
            position: null,
            records: [
                createMockRecord('1A', 0, 2, 'A'),
                createMockRecord('2A', 3, 5, 'A'),
                createMockRecord('3B', 3, 5, 'B'),
                createMockRecord('4C', 1, 3, 'C'),
                createMockRecord('5D', 2, 5, 'D'),
                createMockRecord('6D', 3, 5, 'D'),
            ],
        }];
        fixture.detectChanges();

        expect(mapCalendarParsedRowToRecordIds(comp.parsedRows[0])).toEqual(expectedRows);
    });

    it('should draw the calendar records by grouping them by their groupId and starting the new group' +
        ' in the line after on where the last group ended when the drawing strategy is set to "group-same-line"', () => {
        const expectedRows = [
            ['1A', '2A'],
            ['3B'],
            ['4C'],
            ['5D'],
            ['6D'],
        ];

        testHostComp.drawingStrategy = 'group-next-line';
        testHostComp.rows = [{
            id: null,
            name: 'without area',
            position: null,
            records: [
                createMockRecord('1A', 0, 2, 'A'),
                createMockRecord('2A', 3, 5, 'A'),
                createMockRecord('3B', 3, 5, 'B'),
                createMockRecord('4C', 1, 3, 'C'),
                createMockRecord('5D', 2, 5, 'D'),
                createMockRecord('6D', 3, 5, 'D'),
            ],
        }];
        fixture.detectChanges();

        expect(mapCalendarParsedRowToRecordIds(comp.parsedRows[0])).toEqual(expectedRows);
    });

    describe('Calendar Component - Today line', () => {
        const weekAfterToday = moment().clone().add(1, 'week');
        const twoWeeksAfterToday = moment().clone().add(2, 'week');

        const weekBeforeToday = moment().clone().subtract(1, 'week');
        const twoWeeksBeforeToday = moment().clone().subtract(2, 'week');

        const todayInCalendarScope: TimeScope = {
            end: moment(weekAfterToday).endOf('week'),
            start: moment(weekBeforeToday).startOf('week'),
        };
        const todayInCalendarScopeAnotherEndWeek: TimeScope = {
            end: moment(twoWeeksAfterToday).endOf('week'),
            start: moment(weekBeforeToday).startOf('week'),
        };
        const todayInCalendarScopeAnotherStartWeek: TimeScope = {
            end: moment(weekAfterToday).endOf('week'),
            start: moment(twoWeeksBeforeToday).startOf('week'),
        };
        const todayOutsideCalendarScope: TimeScope = {
            end: moment(weekBeforeToday).endOf('week'),
            start: moment(twoWeeksBeforeToday).startOf('week'),
        };

        const resizeObserverMediumHeight = Object.assign({}, MOCK_RESIZE_OBSERVER_ENTRY_HEIGHT, {
            contentRect: {
                height: 450,
            },
        });

        const resizeObserverSmallerHeight = Object.assign({}, MOCK_RESIZE_OBSERVER_ENTRY_HEIGHT, {
            contentRect: {
                height: 400,
            },
        });

        beforeEach(() => {
            when(resizeObserverHelperMock.observe(comp.calendarWrapper.nativeElement)).thenReturn(resizeCalendarWrapper$);
            when(resizeObserverHelperMock.observe(comp.calendar.nativeElement)).thenReturn(resizeCalendar$);

            resizeCalendarWrapper$.next(MOCK_RESIZE_OBSERVER_ENTRY_HEIGHT);
            resizeCalendar$.next(resizeObserverSmallerHeight);
        });

        it('should set lowestCalendarRelatedHeight with calendar height when today is in the scope of the calendar' +
            ' and calendar height is lower than calendar wrapper height', () => {
            const expectedCalendarHeightAsLowest = resizeObserverSmallerHeight.contentRect.height;
            comp.scope = todayInCalendarScope;

            resizeCalendarWrapper$.next(MOCK_RESIZE_OBSERVER_ENTRY_HEIGHT);
            resizeCalendar$.next(resizeObserverSmallerHeight);

            expect(comp.lowestCalendarRelatedHeight).toBe(expectedCalendarHeightAsLowest);
        });

        it('should set lowestCalendarRelatedHeight with calendar wrapper height when today is in the scope of the calendar' +
            ' and calendar wrapper height is lower than calendar height', () => {
            const expectedCalendarWrapperHeightAsLowest = resizeObserverSmallerHeight.contentRect.height;
            comp.scope = todayInCalendarScope;

            resizeCalendarWrapper$.next(resizeObserverSmallerHeight);
            resizeCalendar$.next(MOCK_RESIZE_OBSERVER_ENTRY_HEIGHT);

            expect(comp.lowestCalendarRelatedHeight).toBe(expectedCalendarWrapperHeightAsLowest);
        });

        it('should set lowestCalendarRelatedHeight when calendar wrapper size changes', () => {
            const expectedLowestCalendarRelatedHeight = resizeObserverSmallerHeight.contentRect.height;
            comp.scope = todayInCalendarScope;
            comp.lowestCalendarRelatedHeight = null;

            resizeCalendarWrapper$.next(resizeObserverSmallerHeight);

            expect(comp.lowestCalendarRelatedHeight).toBe(expectedLowestCalendarRelatedHeight);
        });

        it('should set lowestCalendarRelatedHeight when calendar size changes', () => {
            const expectedLowestCalendarRelatedHeight = resizeObserverMediumHeight.contentRect.height;
            comp.scope = todayInCalendarScope;
            comp.lowestCalendarRelatedHeight = null;

            resizeCalendar$.next(resizeObserverMediumHeight);

            expect(comp.lowestCalendarRelatedHeight).toBe(expectedLowestCalendarRelatedHeight);
        });

        it('should set lowestCalendarRelatedHeight in AfterViewInit when it is in the scope of the calendar', () => {
            const expectedLowestCalendarRelatedHeight = resizeObserverSmallerHeight.contentRect.height;
            comp.scope = todayInCalendarScope;
            comp.lowestCalendarRelatedHeight = null;

            comp.ngAfterViewInit();

            expect(comp.lowestCalendarRelatedHeight).toBe(expectedLowestCalendarRelatedHeight);
        });

        it('should set lowestCalendarRelatedHeight when we change the week of the end of the scope', () => {
            comp.scope = todayInCalendarScope;
            comp.lowestCalendarRelatedHeight = null;

            resizeCalendarWrapper$.next(resizeObserverSmallerHeight);
            comp.scope = todayInCalendarScopeAnotherEndWeek;

            expect(comp.lowestCalendarRelatedHeight).toBe(resizeObserverSmallerHeight.contentRect.height);
        });

        it('should set lowestCalendarRelatedHeight when we change the week of the start of the scope', () => {
            comp.scope = todayInCalendarScope;
            comp.lowestCalendarRelatedHeight = null;

            resizeCalendarWrapper$.next(resizeObserverSmallerHeight);
            comp.scope = todayInCalendarScopeAnotherStartWeek;

            expect(comp.lowestCalendarRelatedHeight).toBe(resizeObserverSmallerHeight.contentRect.height);
        });

        it('should not set lowestCalendarRelatedHeight when today is not in the scope of the calendar', () => {
            comp.scope = todayOutsideCalendarScope;

            expect(comp.lowestCalendarRelatedHeight).toBeUndefined();
        });

        it('should not set lowestCalendarRelatedHeight when we do not change the calendar scope', () => {
            comp.scope = todayInCalendarScope;
            comp.lowestCalendarRelatedHeight = null;

            comp.scope = todayInCalendarScope;

            expect(comp.lowestCalendarRelatedHeight).toBeNull();
        });
    });

    it('should retrieve the correct slot id when getSlotId is called', () => {
        const columnId = 1;
        const rowId = 1;
        const expectedResult = new SlotIdentifier(columnId, rowId).stringify();

        expect(comp.getSlotId(columnId, rowId)).toBe(expectedResult);
    });

    it('should retrieve the correct day slot id when getDaySlotId is called', () => {
        const columnId = 1;
        const dayId = 0;
        const rowId = 1;
        const expectedResult = new SlotIdentifier(7, rowId).stringify();

        expect(comp.getDaySlotId(columnId, rowId, dayId)).toBe(expectedResult);
    });
});
