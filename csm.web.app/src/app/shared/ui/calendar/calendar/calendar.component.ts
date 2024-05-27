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
    CdkDragStart,
    DragStartDelay
} from '@angular/cdk/drag-drop';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    Renderer2,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewChildren
} from '@angular/core';
import {
    flatten,
    range,
    uniq,
} from 'lodash';
import * as moment from 'moment';
import {unitOfTime} from 'moment/moment';
import {
    BehaviorSubject,
    combineLatest,
    from,
    fromEvent,
    merge,
    Subject,
    Subscription,
} from 'rxjs';
import {
    debounceTime,
    delay,
    distinctUntilChanged,
    filter,
    map,
    startWith,
    switchMap,
    take,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import {RelationResource} from '../../../../project/project-common/api/relations/resources/relation.resource';
import {WorkDaysHoliday} from '../../../../project/project-common/api/work-days/resources/work-days.resource';
import {TimeScope} from '../../../misc/api/datatypes/time-scope.datatype';
import {CursorClassEnum} from '../../../misc/enums/cursor-class.enum';
import {KeyEnum} from '../../../misc/enums/key.enum';
import {ObjectTypeEnum} from '../../../misc/enums/object-type.enum';
import {WeekDaysEnum} from '../../../misc/enums/weekDays.enum';
import {Point} from '../../../misc/generic-types/point.type';
import {BreakpointHelper} from '../../../misc/helpers/breakpoint.helper';
import {IntersectionObserverHelper} from '../../../misc/helpers/intersection-observer.helper';
import {ResizeHelper} from '../../../misc/helpers/resize.helper';
import {ResizeObserverHelper} from '../../../misc/helpers/resize-observer.helper';
import {BREAKPOINTS_RANGE as breakpointsRange} from '../../constants/breakpoints.constant';
import {COLORS} from '../../constants/colors.constant';
import {DIMENSIONS} from '../../constants/dimensions.constant';
import {DateParserStrategy} from '../../dates/date-parser.strategy';
import {CALENDAR_CONSTANTS} from '../contants/calendar.contants';
import {CalendarDependenciesHelper} from '../helpers/calendar-dependencies.helper';
import {
    MILESTONE_SLOT_ID_PREFIX,
    MilestoneSlotsComponent,
    MoveMilestonePayload
} from '../milestone-slots/milestone-slots.component';
import {SlotIdentifier} from './slot-identifier';

const CALENDAR_RECORD_DRAG_START_DELAY_TOUCH = 100;
const CSS_CLASS_CALENDAR_BODY_CELL_DRAGGING = 'ss-calendar-body-cell--dragging';
const EMPTY_CELL_DURATION = 1;

export const NUMBER_OF_DAYS_PER_WEEK = 7;
export const CALENDAR_DEPENDENCIES_VISIBILITY_TRANSITION_DELAY_TIME_MS = 500;
export const CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS = 50;
export const CALENDAR_DEPENDENCIES_UPDATE_CARDS_VISIBILITY_DEBOUNCE_TIME_MS = 1;
export const CALENDAR_DEPENDENCIES_UPDATE_RESIZE_DEBOUNCE_TIME_MS = 300;
export const CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME = 250;
export const CALENDAR_NAVIGATE_TO_ELEMENT_ANIMATION_DURATION = 2400;
export const CALENDAR_NAVIGATE_TO_ELEMENT_HIGHLIGHT_OPACITY = '0.3';

export class MoveRecordPayload {
    public id: string;
    public rowId: string;
    public shiftDays: number;

    constructor(id: string, rowId: string, shiftDays: number) {
        this.id = id;
        this.rowId = rowId;
        this.shiftDays = shiftDays;
    }
}

@Component({
    selector: 'ss-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
    @Input()
    public set scope(scope: TimeScope) {
        this.calendarScope = scope;

        this._updateWeeks();
        this._updateRows();
        this._updateYear();
        this._setWeekWidth();
        this.elementsDimensionsChanged();
        this._calendarScope$.next(scope);
    }

    @Input()
    public set rows(rows: CalendarRow[]) {
        this._setRows(rows);
        this.elementsDimensionsChanged();
    }

    @Input()
    public dependencies: CalendarDependency[] = [];

    @Input()
    public drawingStrategy: CalendarDrawingStrategy;

    @Input()
    public addRecordPermission: boolean;

    @Input()
    public set expandedWeeks(expandedWeeks: moment.Moment[]) {
        const weeks = expandedWeeks || [];

        this._expandedWeeks = weeks.map(week => this._dateParser.startOfWeek(week.clone()));
        this.isExpanded = this._expandedWeeks.length > 0;

        this._updateRecordsStyles();
        this._updateWeeks();
    }

    public get expandedWeeks(): moment.Moment[] {
        return this._expandedWeeks;
    }

    @Input()
    public canMoveMilestone: (milestoneId: string) => boolean = (): boolean => true;

    @Input()
    public canDragRecord: (recordId: string) => boolean = (): boolean => true;

    @Input()
    public canMoveRecord: (recordId: string) => boolean = (): boolean => true;

    @Input()
    public canHideRecord: (recordId: string) => boolean = (): boolean => true;

    @Input()
    public recordGridUnit: CalendarRecordGridUnit = 'week';

    @Input()
    public sourceAnchorPointByObjectType: CalendarDependencyAnchorPointByObjectType;

    @Input()
    public targetAnchorPointByObjectType: CalendarDependencyAnchorPointByObjectType;

    @Input()
    public anchorPointYBaseByStrategyAndObjectType: CalendarDependencyAnchorPointYBaseByStrategyAndObjectType;

    @Input()
    public set isCopying(isCopying: boolean) {
        this._updateCopyingStatus(isCopying);
    }

    public get isCopying(): boolean {
        return this._isCopying;
    }

    @Input()
    public isLoading: boolean;

    @Input()
    public set isResizingRecord(isResizing: boolean) {
        this._handleIsDraggingOrResizingCalendarItem(isResizing);
    }

    @Input()
    public enableMilestoneCreation: boolean;

    @Input()
    public set selectedRecordIds(selectedRecordIds: string[]) {
        this._selectedRecordIds = selectedRecordIds;
        this.multipleRecordsSelected = selectedRecordIds.length > 1;

        this._updateRecordsDraggingState();
    }

    @Input()
    public set navigateToElement(navigateToElement: CalendarNavigateToElement) {
        this._navigateToElement$.next(navigateToElement);
    }

    @Input()
    public set focusedElementId(elementId: string) {
        this._focusedElementId = elementId;
    }

    @Input()
    public hideScroll = false;

    @Input()
    public set milestones(milestones: CalendarMilestones<CalendarMilestone>) {
        this._milestones = milestones;

        this._setMilestoneDates();
        this._updateWeeks();
    }

    public get milestones(): CalendarMilestones<CalendarMilestone> {
        return this._milestones;
    }

    @Input()
    public holidays: WorkDaysHoliday[] = [];

    @Input()
    public workingDays: WeekDaysEnum[] = [];

    @Output()
    public expandWeeks: EventEmitter<moment.Moment[]> = new EventEmitter<moment.Moment[]>();

    @Output()
    public addRecord: EventEmitter<CreateRecordPayload> = new EventEmitter<CreateRecordPayload>();

    @Output()
    public dragRecordStarted: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    public moveMilestone = new EventEmitter<MoveMilestonePayload>();

    @Output()
    public moveRecords: EventEmitter<MoveRecordPayload[]> = new EventEmitter<MoveRecordPayload[]>();

    @Output()
    public copyRecords: EventEmitter<MoveRecordPayload[]> = new EventEmitter<MoveRecordPayload[]>();

    @Output()
    public weekWidthChange: EventEmitter<number> = new EventEmitter<number>();

    @Output()
    public navigateToElementEnd: EventEmitter<CalendarNavigateToElement> = new EventEmitter<CalendarNavigateToElement>();

    @ContentChild('cardTemplate')
    public cardTemplate: TemplateRef<any>;

    @ContentChild('cardPlaceholderTemplate')
    public cardPlaceholderTemplate: TemplateRef<any>;

    @ContentChild('columnTemplate')
    public columnTemplate: TemplateRef<any>;

    @ContentChild('creationSlotsTemplate')
    public creationSlotsTemplate: TemplateRef<any>;

    @ContentChild('cardDragPreviewTemplate')
    public cardDragPreviewTemplate: TemplateRef<any>;

    @ContentChild('milestoneTemplate')
    public milestoneTemplate: TemplateRef<any>;

    @ContentChild('filterAlertMessageTemplate')
    public filterAlertMessageTemplate: TemplateRef<any>;

    @ViewChildren('calendarColumn')
    public calendarColumn: QueryList<ElementRef>;

    @ViewChildren('calendarRow')
    public calendarRow: QueryList<ElementRef>;

    @ViewChild('calendarWrapper', {static: true})
    public calendarWrapper: ElementRef<HTMLElement>;

    @ViewChild('calendar', {static: true})
    public calendar: ElementRef;

    @ViewChild('calendarDependencies', {static: true})
    public calendarDependencies: ElementRef;

    @ViewChild('calendarHeader', {static: true})
    public calendarHeader: ElementRef;

    @ViewChildren('cardList')
    private _cardList: QueryList<ElementRef>;

    @ViewChildren('calendarHeaderCell')
    private _calendarHeaderCell: QueryList<ElementRef>;

    @ViewChildren(MilestoneSlotsComponent)
    private _milestoneSlots: QueryList<MilestoneSlotsComponent>;

    public calendarDependencyLines: CalendarDependencyLine[];

    public calendarDependencyOutOfScopeIndicators: CalendarDependencyOutOfScopeIndicator[];

    public calendarHeaderFocusedDay: moment.Moment;

    public calendarRecordDragStartDelay: DragStartDelay = {mouse: 0, touch: CALENDAR_RECORD_DRAG_START_DELAY_TOUCH};

    public calendarScope: TimeScope;

    public currentRecordsIds: string[] = [];

    public parsedRows: CalendarParsedRow[] = [];

    public isExpanded: boolean;

    public addRecordStyles = {
        icon: 'more',
        size: 'small',
        mobileColor: COLORS.dark_blue,
        desktopColor: COLORS.dark_grey_75,
    };

    public isDraggingRecord: boolean;

    public lowestCalendarRelatedHeight: number;

    public multipleRecordsSelected: boolean;

    public weeks: CalendarWeek[] = [];

    public shiftAmount: number;

    public showDependencies = true;

    public standardCellStyle: Object;

    public slotHighlightStyles: Object;

    public weekWidth = 0;

    public weekDays: number[] = range(NUMBER_OF_DAYS_PER_WEEK);

    public yearScopeLabel: string;

    private _dependenciesHelper: CalendarDependenciesHelper;

    private _selectionDuration: number;

    private _calendarRecords: CalendarRecord[];

    private _currentCalendarRecords: CalendarRecord[] = [];

    private _currentRecords: Record[] = [];

    private _currentRecordGrabIndex: number;

    private _currentRecordHiddenDurationToTheLeftOfTheCalendar: number;

    private _cursorX: number;

    private _currentRecordPreviewOffset: number;

    private _currentRecordPreviewSize: number;

    private _focusedElementId: string;

    private _keyupSubscription: Subscription;

    private _dragCanceled: boolean;

    private _calendarWidth = 0;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _expandedWeeks: moment.Moment[] = [];

    private _initialDragColumnIndex: number;

    private _isCopying: boolean;

    private _milestoneDates: moment.Moment[] = [];

    private _milestones: CalendarMilestones<CalendarMilestone> = {};

    private _navigateToElement$ = new BehaviorSubject<CalendarNavigateToElement>(null);

    private _lastNavigateToElement$ = new BehaviorSubject<CalendarNavigateToElement>(null);

    private _updateDependenciesSVG = new Subject<void>();

    private _updateDependenciesVisibility = new Subject<boolean>();

    private _updateCardsVisibility = new Subject<void>();

    private _triggerDependenciesVisibilityTransition = new Subject<void>();

    private _calendarScope$ = new BehaviorSubject<TimeScope>(null);

    private _lastScrollPosition: { scrollTop: number; scrollLeft: number } = null;

    private _records: Record[];

    private _selectedRecordIds: string[] = [];

    private readonly _drawingStrategyMap: { [key in CalendarDrawingStrategy]: (records: Record[]) => Record[][] } = {
        ['default']: records => this._getLinesWithRecords(records),
        ['group-same-line']: records => this._getLinesWithRecordsGrouped(records, 0),
        ['group-next-line']: records => this._getLinesWithRecordsGrouped(records, 1),
    };

    private readonly _getRecordTimeScopeByGridUnitMap: { [key in CalendarRecordGridUnit]: (timeScope: TimeScope) => TimeScope } = {
        week: ({start, end}): TimeScope => ({start: this._dateParser.startOfWeek(start), end: this._dateParser.endOfWeek(end)}),
        day: ({start, end}): TimeScope => ({start, end}),
    };

    private readonly _getNumberOfColumnsByRecordGridUnitMap: { [key in CalendarRecordGridUnit]: () => number } = {
        week: (): number => this.weeks.length,
        day: (): number => this.weeks.length * NUMBER_OF_DAYS_PER_WEEK,
    };

    private readonly _getMoveShiftDaysAmountByRecordGridUnitMap: { [key in CalendarRecordGridUnit]: (columnIndex: number) => number } = {
        week: (columnIndex: number): number => this._getColumnsMoveShiftAmount(columnIndex) * NUMBER_OF_DAYS_PER_WEEK,
        day: (columnIndex: number): number => this._getColumnsMoveShiftAmount(columnIndex),
    };

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _breakpointHelper: BreakpointHelper,
                private _dateParser: DateParserStrategy,
                private _intersectionObserverHelper: IntersectionObserverHelper,
                private _renderer: Renderer2,
                private _resizeHelper: ResizeHelper,
                private _resizeObserverHelper: ResizeObserverHelper) {
    }

    ngOnInit(): void {
        this._setCalendarWidth(this._placeholderWidth);
        this._setWeekWidth();
        this._setSubscriptions();
        this._setDependenciesHelper();
    }

    ngAfterViewInit(): void {
        this.elementsDimensionsChanged();
        this._setAfterViewInitSubscriptions();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (('rows' in changes) ||
            ('enableMilestoneCreation' in changes) ||
            ('milestones' in changes) ||
            ('dependencies' in changes) ||
            ('sourceAnchorPointByObjectType' in changes) ||
            ('targetAnchorPointByObjectType' in changes) ||
            ('anchorPointYBaseByStrategyAndObjectType' in changes)) {
            this._updateDependenciesSVG.next();
        }

        if (('expandedWeeks' in changes) ||
            ('scope' in changes)) {
            const {previousValue: previousWeeks, currentValue: currentWeeks} = changes.expandedWeeks || {};
            const expandedWeeksUpdated = !!previousWeeks && !!currentWeeks &&
                (
                    previousWeeks.some(previousWeek => !currentWeeks.some(currentWeek => previousWeek.isSame(currentWeek, 'd'))) ||
                    currentWeeks.some(currentWeek => !previousWeeks.some(previousWeek => currentWeek.isSame(previousWeek, 'd')))
                );

            const {previousValue: previousScope, currentValue: currentScope} = changes.scope || {};
            const scopeUpdated = !!previousScope && !!currentScope &&
                (!previousScope.start.isSame(currentScope.start, 'd') || !previousScope.end.isSame(currentScope.end, 'd'));

            if (expandedWeeksUpdated || scopeUpdated) {
                this._triggerDependenciesVisibilityTransition.next();
            }
        }

        if ('recordGridUnit' in changes) {
            this._updateRecordsStyles();
        }
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public trackByDate(index: number, week: CalendarWeek): string {
        return week.date.toISOString();
    }

    public trackByWeekDay(index: number, day: number): string {
        return day.toString();
    }

    public trackDependencyLine(index: number, calendarDependencyLine: CalendarDependencyLine): string {
        return calendarDependencyLine.id;
    }

    public trackDependencyOutOfScopeIndicator(index: number, indicator: CalendarDependencyOutOfScopeIndicator): string {
        return indicator.id;
    }

    public trackRow(index: number, elem: CalendarParsedRow): string | number {
        return elem.id != null ? elem.id : index;
    }

    public trackLine(index: number): number {
        return index;
    }

    public trackRecord(index: number, calendarRecord: CalendarRecord): string | number {
        return calendarRecord && calendarRecord.record ? calendarRecord.record.id : index;
    }

    public onClickAddRecord(index: number, rowId: string): void {
        const record: CreateRecordPayload = {
            rowId,
            start: this._dateParser.startOfWeek(this.weeks[index].date),
            end: this._dateParser.endOfWeek(this.weeks[index].date),
        };

        this.addRecord.emit(record);
    }

    public handleHeaderClick(header: moment.Moment): void {
        const weeks = this._expandedWeeks.filter(w => !this._dateParser.isSame(w, header, 'w'));
        const newExpandedWeeks = weeks.length === this._expandedWeeks.length ? weeks.concat(header.clone()) : weeks;

        this.expandWeeks.emit(newExpandedWeeks);
    }

    public getSlotId(columnId: number, rowId: number): string {
        return new SlotIdentifier(columnId, rowId).stringify();
    }

    public getDaySlotId(columnId: number, rowId: number, dayId: number): string {
        const parsedColumnId = (columnId * NUMBER_OF_DAYS_PER_WEEK) + dayId;

        return this.getSlotId(parsedColumnId, rowId);
    }

    public handleRecordDragStart(event: CdkDragStart, calendarRecord: CalendarRecord): void {
        this._setRecordDraggingState(true);
        this._setCurrentRecords(calendarRecord);
        this._setPreviewArea(event, calendarRecord);
        this._setKeyupSubscription();
        this._setDragCancelState(false);
        this._setCursorStyle();
        this.dragRecordStarted.emit();
    }

    public handleRecordDragEnd(): void {
        this._setRecordDraggingState(false);
        this._unsetCurrentRecordPreview();
        this._unsetKeyupSubscription();
        this._unsetCursorStyle();
    }

    public canEnterContainer({data}: CdkDrag<CalendarRecord>): boolean {
        return 'isCalendarRecord' in data;
    }

    public handleEnterContainer(event: CdkDragEnter): void {
        const container: Element = event.container.element.nativeElement;
        const currentHoveredColumnIndex = SlotIdentifier.fromString(container.id).parse().columnIndex;
        this._setCurrentRecordPreview(currentHoveredColumnIndex);
        this.shiftAmount = this._getColumnsMoveShiftAmount(currentHoveredColumnIndex);
    }

    public handleExitContainer(): void {
        this._unsetCurrentRecordPreview();
    }

    public handleDrop(event: CdkDragDrop<CalendarRecord>): void {
        if (!this._dragCanceled) {
            this._moveCurrentRecords(event.item.data, event.container.id);
        }
    }

    public handleIsMilestoneDragging(isDragging: boolean): void {
        this._handleIsDraggingOrResizingCalendarItem(isDragging);
    }

    public handleMilestoneDraggingOnDay(date: moment.Moment): void {
        this.calendarHeaderFocusedDay = date;
    }

    public handleMoveMilestone(moveMilestonePayload: MoveMilestonePayload): void {
        this.moveMilestone.emit(moveMilestonePayload);
    }

    public handleRecordMouseDown(event: MouseEvent): void {
        this._setCursor(event.clientX);
    }

    public handleRecordRelease(): void {
        this._resetCurrentRecordsDraggingState(false);
    }

    public handleRecordTouchStart(event: TouchEvent): void {
        this._setCursor(event.touches[0].clientX);
    }

    public handleScroll(): void {
        if (this._hasReachScrollThreshold(this.calendar)) {
            this._updateRecordsVisibility();
            this._updateDependenciesSVG.next();
        }
    }

    public keepScrollOnElement(element: ElementRef): void {
        const calendar: HTMLElement = this.calendar.nativeElement;
        const initialY = element.nativeElement.getBoundingClientRect().y;
        const resizeObserver = new ResizeObserver(() => {
            const updatedY = element.nativeElement.getBoundingClientRect().y;

            calendar.scrollTop += updatedY - initialY;
            resizeObserver.disconnect();
        });

        resizeObserver.observe(calendar);
    }

    public elementsDimensionsChanged(): void {
        this._updateCardsVisibility.next();
    }

    public scrollTo({x, y}: Point): void {
        this.calendar.nativeElement.scrollTo({top: y, left: x, behavior: 'smooth'});
    }

    private _setSlotHighlightStyles(): void {
        this.slotHighlightStyles = {
            width: `${this._currentRecordPreviewSize}px`,
            left: `-${this._currentRecordPreviewOffset}px`,
        };
    }

    private _getStandardCellStyle(isExpanded: boolean): Object {
        const width = this._getRecordWidth(1, isExpanded ? 1 : 0);

        return this._getCellStyles(width);
    }

    private _isWeekExpanded(week: moment.Moment): boolean {
        return this._expandedWeeks.some(weekExpanded => this._dateParser.isSame(weekExpanded, week, 'w'));
    }

    private _isDraggingRecord(record: Record): boolean {
        const draggingRecord = record ? this._currentCalendarRecords.find(calendarRecord => calendarRecord.record.id === record.id) : null;

        return this.isDraggingRecord && draggingRecord && draggingRecord.isDragging;
    }

    private _getRecordCellClasses(record: Record): Object {
        return {
            [CSS_CLASS_CALENDAR_BODY_CELL_DRAGGING]: this._isDraggingRecord(record),
        };
    }

    private _getRecordCellStyle(line: Record[], record: Record, recordIndex: number): Object {
        const recordDuration = record ? record.duration : EMPTY_CELL_DURATION;
        const width = this._getRecordWidth(recordDuration, this._recordMatchesHowManyExpandedWeek(line, recordDuration, recordIndex));

        return this.recordGridUnit === 'week'
            ? this._getCellStyles(width)
            : this._getCellStylesByDayGridUnit(width, record);
    }

    private _getCellStyles(width: number): Object {
        return {
            ['min-width']: `${width}px`,
            ['max-width']: `${width}px`,
            width: `${width}px`,
        };
    }

    private _getCellStylesByDayGridUnit(baseWidth: number, record: Record): Object {
        if (!record) {
            return this._getCellStyles(baseWidth);
        }

        const {truncatedStart: recordStart, truncatedEnd: recordEnd} = record;

        const recordStartWeek = this._dateParser.startOfWeek(recordStart);
        const recordEndWeek = this._dateParser.endOfWeek(recordEnd);

        const diffStart = recordStart.diff(recordStartWeek, 'd');
        const diffEnd = recordEndWeek.diff(recordEnd, 'd');

        const startWeekExpanded = this._expandedWeeks.some(week => this._dateParser.isSame(week, recordStartWeek, 'w'));
        const endWeekExpanded = this._expandedWeeks.some(week => this._dateParser.isSame(week, recordEndWeek, 'w'));

        const startWeekWidthOffset = startWeekExpanded
            ? (CALENDAR_CONSTANTS.expandedWeekWidth / NUMBER_OF_DAYS_PER_WEEK) * diffStart
            : (this.weekWidth / NUMBER_OF_DAYS_PER_WEEK) * diffStart;
        const endWeekWidthOffset = endWeekExpanded
            ? (CALENDAR_CONSTANTS.expandedWeekWidth / NUMBER_OF_DAYS_PER_WEEK) * diffEnd
            : (this.weekWidth / NUMBER_OF_DAYS_PER_WEEK) * diffEnd;

        const width = baseWidth - startWeekWidthOffset - endWeekWidthOffset;
        const recordCellMargin = DIMENSIONS.base_dimension;

        return {
            ['margin-left']: `${startWeekWidthOffset + recordCellMargin}px`,
            ['margin-right']: `${endWeekWidthOffset + recordCellMargin}px`,
            ['min-width']: `${width}px`,
            ['max-width']: `${width}px`,
            width: `${width}px`,
        };
    }

    private _getHeaderCellId(date = moment()): string {
        const weekId = date.format('W-YYYY');
        return `ss-calendar-header__week-${weekId}`;
    }

    private _getCollapsedRecordWidth(recordDuration: number, expanded: number): number {
        const weekSpacer = CALENDAR_CONSTANTS.weekSpacer;
        const weekWidth = this.weekWidth;
        const collapsedRecordWidth = (recordDuration * (weekWidth + weekSpacer)) - weekSpacer;

        return collapsedRecordWidth - (weekWidth * expanded);
    }

    private _getExpandedRecordWidth(expanded: number): number {
        return CALENDAR_CONSTANTS.expandedWeekWidth * expanded;
    }

    private _getDaySlotsWithMilestones(week: moment.Moment): boolean[] {
        return new Array(NUMBER_OF_DAYS_PER_WEEK)
            .fill(week)
            .map((date, index) => date.clone().add(index, 'd'))
            .map(date => this._hasMilestoneInSameDate(date));
    }

    private _getRecordWidth(recordDuration: number, expanded = 0): number {
        return this._getCollapsedRecordWidth(recordDuration, expanded) + this._getExpandedRecordWidth(expanded);
    }

    private _getRecordWidthForDayGridUnit(recordDuration: number, numberOfWeekSpans: number): number {
        const slotWidth = this.weekWidth / NUMBER_OF_DAYS_PER_WEEK;
        const slotsWidth = slotWidth * recordDuration;
        const weeksSpanOffset = numberOfWeekSpans * CALENDAR_CONSTANTS.weekSpacer;

        return slotsWidth + weeksSpanOffset;
    }

    private _setMilestoneDates(): void {
        const flattenMilestones = flatten(Object.values(this._milestones));

        this._milestoneDates = uniq(flattenMilestones.map(({date}) => date));
    }

    private _setKeyupSubscription(): void {
        this._keyupSubscription = fromEvent(window, 'keyup')
            .pipe(filter((event: KeyboardEvent) => this.isDraggingRecord && event.key === KeyEnum.Escape))
            .subscribe(() => this._cancelDrag());
    }

    private _unsetKeyupSubscription(): void {
        this._keyupSubscription.unsubscribe();
    }

    private _setCalendarRecords(): void {
        this._calendarRecords = flatten(this.parsedRows.map(row => flatten(row.lines).filter(calendarRecord => calendarRecord.record)));
    }

    private _setRecords(recordsRows: Record[][]): void {
        this._records = flatten(recordsRows);
    }

    private _setRows(rows: any[]): void {
        const recordsVisibility = this._getRecordsVisibility();
        const recordsRows = rows.map((row: CalendarRow, rowIndex: number) => this._getParsedRecords(row.records, row.id, rowIndex));
        const filteredRecordsRows = recordsRows.map(records => this._getFilteredRecords(records));

        this.parsedRows = rows.map((row: CalendarRow, rowIndex: number) =>
            Object.assign({}, row, {
                rowIndex,
                lines: row.records.length ? this._getLines(filteredRecordsRows[rowIndex], recordsVisibility) : [],
                id: row.id,
                rowsLength: rows.length,
                isExpanded: this.isExpanded,
            }));

        this._setRecords(recordsRows);
        this._setCalendarRecords();
    }

    private _updateRows(): void {
        const recordsVisibility = this._getRecordsVisibility();

        this.parsedRows = this.parsedRows.map((row, rowIndex) => {
            const records = this._getFilteredRecords(flatten(row.lines)
                .map(calendarRecord => calendarRecord.record)
                .filter(record => record != null));

            return {
                ...row,
                lines: records.length ? this._getLines(this._getParsedRecords(records, row.id, rowIndex), recordsVisibility) : [],
            };
        });
    }

    private _getLines(records: Record[], currentRecordsVisibility: { [key: string]: boolean }): CalendarRecord[][] {
        const linesWithRecords = this._drawingStrategyMap[this.drawingStrategy](records);

        return this._addEmptyLinesCells(linesWithRecords)
            .map(line => line.map((record, index) => {
                const currentVisibility = record == null || !!currentRecordsVisibility[record.id];
                return this._mapRecordToCalendarRecord(record, index, line, currentVisibility);
            }));
    }

    private _getRecordsVisibility(): { [key: string]: boolean } {
        const result = {};
        this.parsedRows.forEach(row => {
            flatten(row.lines).forEach(calendarRecord => {
                if (calendarRecord.record) {
                    result[calendarRecord.record.id] = calendarRecord.visible;
                }
            });
        });

        return result;
    }

    private _mapRecordToCalendarRecord(record: Record, index: number, line: Record[], currentVisibility: boolean): CalendarRecord {
        return {
            isCalendarRecord: true,
            record,
            visible: currentVisibility,
            isDragging: this._isDraggingRecord(record),
            styles: this._getRecordCellStyle(line, record, index),
            classes: this._getRecordCellClasses(record),
            dragRecordDisabled: !this._canDragRecord(record),
        };
    }

    private _canDragRecord(record: Record): boolean {
        return record && this.canDragRecord(record.id) && (this.canMoveRecord(record.id) || this._canCopyRecord());
    }

    private _canCopyRecord(): boolean {
        return this.isCopying && this.addRecordPermission && !this.isExpanded;
    }

    private _getAffectedIndexes(record: Record): { firstCellIndex: number; lastCellIndex: number } {
        const recordStart = this._dateParser.startOfWeek(record.truncatedStart);
        const firstCellIndex = recordStart.diff(this.calendarScope?.start, 'w');
        const lastCellIndex = firstCellIndex + record.duration - 1;

        return {firstCellIndex, lastCellIndex};
    }

    private _findAvailableLine(lines: boolean[][], firstCellIndex: number, lastCellIndex: number, minLineIndex = 0): number {
        const availableLineIndex = lines.findIndex((line, lineIndex) => lineIndex >= minLineIndex && line
            .filter((isWeekAvailable, index) => index >= firstCellIndex && index <= lastCellIndex)
            .every(isWeekAvailable => isWeekAvailable)
        );

        return availableLineIndex > -1 ? availableLineIndex : lines.length;
    }

    private _addNewLine(lines: Record[][], linesAvailability: boolean[][]): void {
        const newLine = new Array(this.weeks.length).fill(true);

        linesAvailability.push(newLine);
        lines.push([]);
    }

    private _addRecordToLine(
        linesAvailability: boolean[][],
        lines: Record[][],
        record: Record,
        lineIndex: number,
        firstCellIndex: number,
        lastCellIndex: number,
    ): void {
        lines[lineIndex].push(record);
        linesAvailability[lineIndex].fill(false, firstCellIndex, lastCellIndex + 1);
    }

    private _getGroupedRecordsByGroupId(records: Record[]): Record[][] {
        const groups: Record[][] = [];
        const groupsIndex: { [key: string]: number } = {};

        for (const record of records) {
            const groupIndex = groupsIndex[record.groupId];

            if (groupIndex !== undefined) {
                groups[groupIndex].push(record);
            } else {
                groupsIndex[record.groupId] = groups.length;
                groups.push([record]);
            }
        }

        return groups;
    }

    private _getLinesWithRecords(records: Record[]): Record[][] {

        const lines: Record[][] = [];
        const linesAvailability: boolean[][] = [];

        for (const record of records) {
            const {firstCellIndex, lastCellIndex} = this._getAffectedIndexes(record);
            const lineIndex = this._findAvailableLine(linesAvailability, firstCellIndex, lastCellIndex);

            if (lineIndex === linesAvailability.length) {
                this._addNewLine(lines, linesAvailability);
            }

            this._addRecordToLine(linesAvailability, lines, record, lineIndex, firstCellIndex, lastCellIndex);
        }

        return lines;
    }

    private _getLinesWithRecordsGrouped(records: Record[], lineIncrement: number): Record[][] {
        let lastGroupLine = 0;
        const lines: Record[][] = [];
        const linesAvailability: boolean[][] = [];
        const groupedItems = this._getGroupedRecordsByGroupId(records);

        for (const group of groupedItems) {
            let groupLineIndex = 0;

            for (const record of group) {
                const {firstCellIndex, lastCellIndex} = this._getAffectedIndexes(record);
                const lineIndex = this._findAvailableLine(linesAvailability, firstCellIndex, lastCellIndex, lastGroupLine);

                if (lineIndex === linesAvailability.length) {
                    this._addNewLine(lines, linesAvailability);
                }

                groupLineIndex = Math.max(lineIndex, groupLineIndex);
                this._addRecordToLine(linesAvailability, lines, record, lineIndex, firstCellIndex, lastCellIndex);
            }

            lastGroupLine = groupLineIndex + lineIncrement;
        }

        return lines;
    }

    /**
     * @description Return each calendar record cells
     * @param {Record[][]} lines
     * @returns {Record[][]}
     */
    private _addEmptyLinesCells(lines: Record[][]): Record[][] {
        return lines.map((line: Record[]) => {
            let i = 0;
            const cells = [];

            while (i < this.weeks.length) {
                const record = line.find(item => this._dateParser.isSame(item.truncatedStart, this.weeks[i].date, 'w')) || null;
                const increment = record ? record.duration : EMPTY_CELL_DURATION;
                cells.push(record);

                i += Math.max(increment, 1);
            }

            return cells;
        });
    }

    private _getFilteredRecords(records: Record[]): Record[] {
        const {start, end} = this.calendarScope;

        return records.filter((record: Record) =>
            this._dateParser.isSameOrAfter(record.end, start, 'w') &&
            this._dateParser.isSameOrBefore(record.start, end));
    }

    /**
     * @description Return parsed records
     * @param {Record[]} records
     * @param {string} rowId
     * @param {number} rowIndex
     * @returns {Record[]}
     */
    private _getParsedRecords(records: Record[], rowId: string, rowIndex: number): Record[] {
        return records.map((item: Record) => this._getParsedRecord(item, rowId, rowIndex));
    }

    private _getParsedRecord(item: Record, rowId: string, rowIndex: number = null): Record | undefined {
        if (!this.calendarScope) {
            return;
        }
        const {start: startDate, end: endDate} = this.calendarScope;
        const {start, end, id, groupId} = item;
        const truncatedStart: moment.Moment = this._getTruncatedRecordStart(startDate, start);
        const truncatedEnd: moment.Moment = this._getTruncatedRecordEnd(endDate, end);

        return {
            id,
            start,
            end,
            groupId,
            rowId,
            rowIndex,
            truncatedStart,
            truncatedEnd,
            duration: this._getRecordDurationByUnitOfTime(truncatedStart, truncatedEnd, 'week'),
            originalDuration: this._getRecordDurationByUnitOfTime(start, end, 'week'),
        };
    }

    private _getRecordDurationByUnitOfTime(startDate: moment.Moment, endDate: moment.Moment, unit: unitOfTime.Base): number {
        const {start, end} = this._getRecordTimeScopeByGridUnitMap[unit]({start: startDate, end: endDate});

        return end.diff(start, unit) + 1;
    }

    private _getTruncatedRecordStart(calendarStart: moment.Moment, recordStart: moment.Moment): moment.Moment {
        return recordStart.isBefore(calendarStart) ? calendarStart : recordStart;
    }

    private _getTruncatedRecordEnd(calendarEnd: moment.Moment, recordEnd: moment.Moment): moment.Moment {
        return recordEnd.isAfter(calendarEnd) ? calendarEnd : recordEnd;
    }

    private _setRecordDraggingState(isDragging: boolean): void {
        this.isDraggingRecord = isDragging;
        this._handleIsDraggingOrResizingCalendarItem(isDragging);
    }

    private _handleIsDraggingOrResizingCalendarItem(isDraggingOrResizing: boolean): void {
        this._updateDependenciesVisibility.next(!isDraggingOrResizing);
    }

    private _setDragCancelState(cancel: boolean): void {
        this._dragCanceled = cancel;
    }

    private _setPreviewArea(event: CdkDragStart, calendarRecord: CalendarRecord): void {
        const startDate = this.calendarScope.start;
        const minStart = moment.min(this._currentRecords.map(record => record.start));
        const maxEnd = moment.max(this._currentRecords.map(record => record.end));
        const {start, end} = this._getRecordTimeScopeByGridUnitMap[this.recordGridUnit]({start: minStart, end: maxEnd});
        const truncatedStart: moment.Moment = this._getTruncatedRecordStart(startDate, start);
        const {truncatedStart: recordTruncatedStart, truncatedEnd: recordTruncatedEnd}: Record = calendarRecord.record;
        const draggedRecordDuration = this._getRecordDurationByUnitOfTime(recordTruncatedStart, recordTruncatedEnd, this.recordGridUnit);

        this._selectionDuration = this._getRecordDurationByUnitOfTime(start, end, this.recordGridUnit);
        this._currentRecordGrabIndex = this._calculateRecordGrabIndex(event, draggedRecordDuration);

        if (truncatedStart.isBefore(recordTruncatedStart)) {
            this._currentRecordGrabIndex += recordTruncatedStart.diff(truncatedStart, this.recordGridUnit);
        }

        this._initialDragColumnIndex = truncatedStart.diff(startDate, this.recordGridUnit) + this._currentRecordGrabIndex;
        this._currentRecordHiddenDurationToTheLeftOfTheCalendar = start.diff(truncatedStart, this.recordGridUnit);
    }

    private _calculateRecordGrabIndex(event: CdkDragStart, duration: number) {
        const el = event.source.getPlaceholderElement().parentElement;
        const {width, left} = el.getBoundingClientRect();
        const parcelWidth = width / duration;
        const cursorXInRelationToElement = this._cursorX - left;

        return Math.floor(cursorXInRelationToElement / parcelWidth);
    }

    private _setCurrentRecords(draggedRecord: CalendarRecord): void {
        const draggedRecordId = draggedRecord.record.id;
        const currentRecordsIds = this._selectedRecordIds.length ? this._selectedRecordIds : [draggedRecordId];

        this._resetCurrentRecordsDraggingState(false);
        this._currentCalendarRecords = this._calendarRecords.filter(calendarRecord => currentRecordsIds.includes(calendarRecord.record.id));
        this._currentRecords = this._records
            .filter(record => currentRecordsIds.includes(record.id))
            .sort(record => record.id === draggedRecordId ? 1 : -1);
        this.currentRecordsIds = this._currentRecords.map(({id}) => id);
        this._resetCurrentRecordsDraggingState(true);
    }

    private _updateRecordsStyles(): void {
        this.parsedRows.forEach(row => {
            row.lines.forEach(line => {
                const records = line.map(calendarRecord => calendarRecord.record);
                line.forEach((calendarRecord, index) => {
                    calendarRecord.styles = this._getRecordCellStyle(records, calendarRecord.record, index);
                    calendarRecord.dragRecordDisabled = !this._canDragRecord(calendarRecord.record);
                });
            });
        });
    }

    private _updateRecordsVisibility(): void {
        if (this._cardList == null) {
            return;
        }

        let updated = false;
        const elementsInScope = this._checkElementsInScope(this.calendar, this._cardList);

        this.parsedRows.forEach(row => {
            row.lines.forEach(line => {
                line.forEach(calendarRecord => {
                    const isVisible = !!(calendarRecord.record == null || elementsInScope[calendarRecord.record.id]
                        || calendarRecord.isDragging || !this.canHideRecord(calendarRecord.record.id));
                    updated = updated || isVisible !== calendarRecord.visible;
                    calendarRecord.visible = isVisible;
                });
            });
        });

        if (updated) {
            this._changeDetectorRef.detectChanges();
        }

        const {scrollLeft, scrollTop} = this.calendar.nativeElement;
        this._lastScrollPosition = {scrollLeft, scrollTop};
    }

    private _hasMilestoneInSameDate(date: moment.Moment): boolean {
        return this._milestoneDates.some(milestoneDate => milestoneDate.isSame(date, 'd'));
    }

    private _hasReachScrollThreshold(calendar: ElementRef): boolean {
        const {scrollLeft, scrollTop} = calendar.nativeElement;
        const {yThreshold, xThreshold} = this._getScrollThreshold(calendar);

        return !this._lastScrollPosition ||
            Math.abs(this._lastScrollPosition.scrollTop - scrollTop) >= yThreshold / 2 ||
            Math.abs(this._lastScrollPosition.scrollLeft - scrollLeft) >= xThreshold / 2;
    }

    private _checkElementsInScope(calendar: ElementRef, elements: QueryList<ElementRef>): { [key: string]: boolean } {

        const {yMin, yMax, xMin, xMax} = this._getScrollThreshold(calendar);

        return elements.reduce((result, element) => {
            const {top, bottom, left, right} = element.nativeElement.getBoundingClientRect();
            const inScope = bottom > yMin && top < yMax && right > xMin && left < xMax;

            result[element.nativeElement.id] = inScope;
            return result;
        }, {});
    }

    private _getScrollThreshold(calendar: ElementRef) {
        const viewPortHeight = calendar.nativeElement.clientHeight;
        const viewPortWidth = calendar.nativeElement.clientWidth;

        const yThreshold = viewPortHeight / 2;
        const xThreshold = viewPortWidth / 2;

        const yMin = -yThreshold;
        const yMax = viewPortHeight + yThreshold;

        const xMin = -xThreshold;
        const xMax = viewPortWidth + xThreshold;

        return {
            yThreshold,
            xThreshold,
            yMin,
            yMax,
            xMin,
            xMax,
        };
    }

    private _resetCurrentRecordsDraggingState(dragging: boolean): void {
        this._currentCalendarRecords.forEach(calendarRecord => {
            calendarRecord.isDragging = dragging;
            calendarRecord.classes = this._getRecordCellClasses(calendarRecord.record);
        });
    }

    private _recordMatchesHowManyExpandedWeek(line: Record[], recordDuration: number, recordIndex: number): number {
        const currentLineOccupiedDuration = this._getLineOccupiedDuration(line.slice(0, recordIndex));
        const nextCurrentLineOccupiedDuration = currentLineOccupiedDuration + recordDuration;
        const start = this.weeks[currentLineOccupiedDuration].date.clone();
        const end = this.weeks[nextCurrentLineOccupiedDuration - 1].date.clone();

        return this._expandedWeeks.filter(w => this._dateParser.isBetween(w, start, end, 'w', '[]')).length;
    }

    private _getLineOccupiedDuration(line: Record[]): number {
        return line.reduce(
            (occupiedDuration: number, record: Record) => record ?
                occupiedDuration + record.duration :
                occupiedDuration + EMPTY_CELL_DURATION, 0
        );
    }

    private _setCurrentRecordPreview(currentHoveredColumnIndex: number): void {
        const numberOfColumns = this._getNumberOfColumnsByRecordGridUnitMap[this.recordGridUnit]();
        const currentRecordHiddenDurationToTheLeftOfTheCursor =
            this._currentRecordGrabIndex - this._currentRecordHiddenDurationToTheLeftOfTheCalendar;

        this._setCurrentRecordPreviewSize(this._selectionDuration, numberOfColumns,
            currentRecordHiddenDurationToTheLeftOfTheCursor, currentHoveredColumnIndex);
        this._setCurrentRecordPreviewOffset(currentRecordHiddenDurationToTheLeftOfTheCursor, currentHoveredColumnIndex);

        this._setSlotHighlightStyles();
    }

    private _unsetCurrentRecordPreview(): void {
        this._unsetCurrentRecordPreviewSize();
        this._unsetCurrentRecordPreviewOffset();

        this._setSlotHighlightStyles();
    }

    private _setCurrentRecordPreviewOffset(
        currentRecordHiddenDurationToTheLeftOfTheCursor: number,
        currentHoveredColumnIndex: number,
    ): void {
        const offset = Math.min(currentRecordHiddenDurationToTheLeftOfTheCursor, currentHoveredColumnIndex);

        if (offset === 0) {
            this._currentRecordPreviewOffset = 0;
        } else if (this.recordGridUnit === 'week') {
            this._currentRecordPreviewOffset = this._getRecordWidth(offset) + CALENDAR_CONSTANTS.weekSpacer;
        } else if (this.recordGridUnit === 'day') {
            const startColumnIndex = currentHoveredColumnIndex - offset;
            const numberOfWeekSpans = this._getNumberOfWeekSpans(startColumnIndex, currentHoveredColumnIndex);

            this._currentRecordPreviewOffset = this._getRecordWidthForDayGridUnit(offset, numberOfWeekSpans);
        }
    }

    private _unsetCurrentRecordPreviewOffset(): void {
        this._currentRecordPreviewOffset = 0;
    }

    private _setCurrentRecordPreviewSize(
        originalDuration: number,
        numberOfColumns: number,
        currentRecordHiddenDurationToTheLeftOfTheCursor: number,
        currentHoveredColumnIndex: number): void {

        const visibleDuration = Math.min(
            originalDuration,
            numberOfColumns,
            numberOfColumns + currentRecordHiddenDurationToTheLeftOfTheCursor - currentHoveredColumnIndex,
            originalDuration - currentRecordHiddenDurationToTheLeftOfTheCursor + currentHoveredColumnIndex
        );

        if (this.recordGridUnit === 'week') {
            this._currentRecordPreviewSize = this._getRecordWidth(visibleDuration);
        } else {
            const startColumnIndex = Math.max(0, (currentHoveredColumnIndex - currentRecordHiddenDurationToTheLeftOfTheCursor));
            const endColumnIndex = startColumnIndex + (visibleDuration - 1);
            const numberOfWeekSpans = this._getNumberOfWeekSpans(startColumnIndex, endColumnIndex);

            this._currentRecordPreviewSize = this._getRecordWidthForDayGridUnit(visibleDuration, numberOfWeekSpans);
        }
    }

    private _getNumberOfWeekSpans(startColumnIndex: number, endColumnIndex: number): number {
        return new Array(endColumnIndex - startColumnIndex)
            .fill(startColumnIndex + 1)
            .map((columnIndex, i) => columnIndex + i)
            .filter(columnIndex => !(columnIndex % NUMBER_OF_DAYS_PER_WEEK))
            .length;
    }

    private _unsetCurrentRecordPreviewSize(): void {
        this._currentRecordPreviewSize = 0;
    }

    private _moveCurrentRecords(calendarRecord: CalendarRecord, targetId: string): void {
        const {columnIndex, rowIndex} = SlotIdentifier.fromString(targetId).parse();
        const {rowId} = calendarRecord.record;
        const newRowId = this.parsedRows[rowIndex].id;
        const shiftDays = this._getMoveShiftDaysAmountByRecordGridUnitMap[this.recordGridUnit](columnIndex);

        if (!!shiftDays || rowId !== newRowId || this.isCopying) {
            const payload: MoveRecordPayload[] = this._currentRecords.map(currentRecord => {
                const {id} = currentRecord;

                return new MoveRecordPayload(id, newRowId, shiftDays);
            });

            if (this.isCopying) {
                this.copyRecords.emit(payload);
            } else {
                this.moveRecords.emit(payload);
            }
        }
    }

    private _getColumnsMoveShiftAmount(columnIndex: number): number {
        return columnIndex - this._initialDragColumnIndex;
    }

    private _updateYear(): void {
        const {start, end} = this.calendarScope;
        const firstWeek = this._dateParser.startOfWeek(start);
        const lastWeek = this._dateParser.endOfWeek(end);
        const sameYearRange = firstWeek.isSame(lastWeek, 'y');

        this.yearScopeLabel = sameYearRange
            ? firstWeek.get('y').toString()
            : `${firstWeek.get('y')} / ${lastWeek.get('y')}`;
    }

    private _updateWeeks(): void {
        if (!this.calendarScope) {
            return;
        }

        const {start, end} = this.calendarScope;
        const firstWeek = this._dateParser.startOfWeek(start);
        const lastWeek = this._dateParser.endOfWeek(end);
        let week: moment.Moment = firstWeek;
        this.weeks = [];

        while (week <= lastWeek) {
            const date = week.clone();
            const id = this._getHeaderCellId(date);
            const isExpanded = this._isWeekExpanded(date);
            const styles = this._getStandardCellStyle(isExpanded);
            const daySlotsWithMilestones = this._getDaySlotsWithMilestones(date);

            this.weeks.push({date, isExpanded, styles, id, daySlotsWithMilestones});

            week = week.clone().add(1, 'w');
        }
    }

    private _cancelDrag(): void {
        this._setDragCancelState(true);
        document.dispatchEvent(new Event('mouseup'));
    }

    private _setDependenciesHelper(): void {
        this._dependenciesHelper = new CalendarDependenciesHelper(
            this.calendarDependencies.nativeElement,
            this.sourceAnchorPointByObjectType,
            this.targetAnchorPointByObjectType,
            this.anchorPointYBaseByStrategyAndObjectType);
    }

    private _setAfterViewInitSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._calendarScope$
                .pipe(
                    distinctUntilChanged((a: TimeScope, b: TimeScope) =>
                        a.start.isSame(b.start, 'd') && a.end.isSame(b.end, 'd')),
                    filter((scope: TimeScope) => this._isTodayInScope(scope)),
                    tap(() => this.lowestCalendarRelatedHeight = 0),
                    switchMap(() => combineLatest([
                        this._resizeObserverHelper.observe(this.calendarWrapper.nativeElement),
                        this._resizeObserverHelper.observe(this.calendar.nativeElement),
                    ])),
                    map(([{contentRect: {height: calendarWrapperHeight}}, {contentRect: {height: calendarHeight}}]) =>
                        Math.min(calendarWrapperHeight, calendarHeight)))
                .subscribe(lowestContentHeight => this.lowestCalendarRelatedHeight = lowestContentHeight));

        this._disposableSubscriptions.add(
            combineLatest([
                this._cardList.changes.pipe(
                    startWith(this._cardList.map(card => card)),
                    filter(cardList => cardList.length > 0),
                    debounceTime(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME),
                ),
                this._calendarHeaderCell.changes.pipe(
                    startWith(this._calendarHeaderCell.map(headerCell => headerCell)),
                    debounceTime(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME),
                ),
                this._navigateToElement$,
            ]).pipe(
                withLatestFrom(
                    this._lastNavigateToElement$,
                ),
                filter(([[, , navigateToElement]]) => !!navigateToElement?.cardId),
                filter(([[, , navigateToElement], lastNavigateToElement]) => navigateToElement !== lastNavigateToElement),
                map(([[cardList, headerCellList, navigateToElement]]) => ([
                    cardList.find(item => item.nativeElement.id === navigateToElement.cardId),
                    headerCellList.find(item => item.nativeElement.id === this._getHeaderCellId(navigateToElement.week)),
                    navigateToElement,
                ])),
                filter(([card, headerCell, navigateToElement]) => !!card &&
                    (!navigateToElement?.week || !!navigateToElement.week && !!headerCell)),
            ).subscribe(([card, , navigateToElement]) => {
                this._handleNavigateToElement(card.nativeElement);
                this._lastNavigateToElement$.next(navigateToElement);
                this.navigateToElementEnd.emit(navigateToElement);
            }));

        this._disposableSubscriptions.add(
            combineLatest([
                this._cardList.changes
                    .pipe(debounceTime(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME)),
                this._milestoneSlots.changes
                    .pipe(
                        switchMap(() =>
                            merge(...this._milestoneSlots.map(milestoneSlot => milestoneSlot.slots.changes))),
                        map(() =>
                            flatten(this._milestoneSlots.map(milestoneSlot => milestoneSlot.slots.map(slot => slot)))),
                        debounceTime(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME),
                    ),
                this._navigateToElement$,
            ]).pipe(
                withLatestFrom(
                    this._lastNavigateToElement$,
                ),
                map(([[, slotList, navigateToElement], lastNavigateToElement]):
                [ElementRef[], CalendarNavigateToElement, CalendarNavigateToElement] => ([
                    slotList,
                    navigateToElement,
                    lastNavigateToElement,
                ])),
                filter(([, navigateToElement]) => !!navigateToElement?.milestoneId),
                filter(([, navigateToElement, lastNavigateToElement]) => navigateToElement !== lastNavigateToElement),
                map(([slotList, navigateToElement]) => ([
                    slotList.find(item => item.nativeElement.id === `${MILESTONE_SLOT_ID_PREFIX}${navigateToElement.milestoneId}`),
                    navigateToElement,
                ])),
                filter(([slot]) => !!slot),
            ).subscribe(([slot, navigateToElement]: [ElementRef, CalendarNavigateToElement]) => {
                this._handleNavigateToElement(slot.nativeElement);
                this._lastNavigateToElement$.next(navigateToElement);
                this.navigateToElementEnd.emit(navigateToElement);
            }));
    }

    private _isTodayInScope({start, end}: TimeScope): boolean {
        const firstWeek = this._dateParser.startOfWeek(start);
        const lastWeek = this._dateParser.endOfWeek(end);

        return moment().isBetween(firstWeek, lastWeek);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._resizeHelper.events$
                .pipe(
                    debounceTime(CALENDAR_DEPENDENCIES_UPDATE_RESIZE_DEBOUNCE_TIME_MS),
                    map(() => this._placeholderWidth)
                )
                .subscribe(width => {
                    this._setCalendarWidth(width);
                    this._setWeekWidth();
                    this._changeDetectorRef.detectChanges();
                    this._updateDependenciesSVG.next();
                })
        );

        this._disposableSubscriptions.add(
            this._resizeHelper.events$
                .pipe(
                    debounceTime(CALENDAR_DEPENDENCIES_UPDATE_RESIZE_DEBOUNCE_TIME_MS),
                    filter(event => !!event),
                )
                .subscribe(() => this._triggerDependenciesVisibilityTransition.next())
        );

        this._disposableSubscriptions.add(
            this._updateCardsVisibility
                .pipe(
                    debounceTime(CALENDAR_DEPENDENCIES_UPDATE_CARDS_VISIBILITY_DEBOUNCE_TIME_MS))
                .subscribe(() => {
                    this._updateRecordsVisibility();
                    this._updateDependenciesSVG.next();
                })
        );

        this._disposableSubscriptions.add(
            combineLatest([
                this._updateDependenciesSVG
                    .pipe(
                        debounceTime(CALENDAR_DEPENDENCIES_UPDATE_DEBOUNCE_TIME_MS),
                    ),
                this._updateDependenciesVisibility
                    .pipe(
                        startWith(this.showDependencies),
                        filter(isVisible => isVisible),
                    ),
            ]).subscribe(() => {
                this._setDependencyLines(this.dependencies);
                this._setDependencyOutOfScopeIndicators(this.dependencies);
                this._changeDetectorRef.detectChanges();
            })
        );

        this._disposableSubscriptions.add(
            this._updateDependenciesVisibility
                .subscribe(isVisible => {
                    this.showDependencies = isVisible;
                    this._changeDetectorRef.detectChanges();
                }));

        this._disposableSubscriptions.add(
            this._triggerDependenciesVisibilityTransition
                .pipe(
                    tap(() => this._updateDependenciesVisibility.next(false)),
                    delay(CALENDAR_DEPENDENCIES_VISIBILITY_TRANSITION_DELAY_TIME_MS),
                ).subscribe(() => this._updateDependenciesVisibility.next(true)));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _updateCopyingStatus(status: boolean): void {
        this._isCopying = status;

        this._updateRecordsDraggingState();
        this._setCursorStyle();

        if (this.isDraggingRecord && this._currentRecords.some(record => !this._canDragRecord(record))) {
            this._cancelDrag();
        }
    }

    private _updateRecordsDraggingState(): void {
        this.parsedRows.forEach(row => {
            row.lines.forEach(line => {
                line.forEach(calendarRecord => {
                    calendarRecord.dragRecordDisabled = !this._canDragRecord(calendarRecord.record);
                });
            });
        });
    }

    public get _placeholderWidth(): number {
        const leftColumnWidth = CALENDAR_CONSTANTS.leftColumnWidth;
        return this._breakpointHelper.isCurrentBreakpoint(breakpointsRange.xl) ? leftColumnWidth : 0;
    }

    private _setCalendarWidth(offset: number): void {
        this._calendarWidth = this.calendar.nativeElement.getBoundingClientRect().width - offset;
    }

    private _setWeekWidth(): void {
        const {weekSpacer, weekWidth} = CALENDAR_CONSTANTS;
        const numberOfWeeks = this.weeks.length;
        const calculatedWeekWidth = (this._calendarWidth / numberOfWeeks) - weekSpacer;

        this.weekWidth = Math.max(calculatedWeekWidth, weekWidth);
        this.standardCellStyle = this._getStandardCellStyle(false);
        this._updateWeeks();
        this._updateRecordsStyles();
        this.weekWidthChange.emit(this.weekWidth);
    }

    private _handleNavigateToElement(element: HTMLElement): void {
        const point: Point = {x: 0, y: 0};
        const {x: elementX, y: elementY}: DOMRect = element.getBoundingClientRect();
        const {x: canvasX, y: canvasY}: DOMRect = this.calendar.nativeElement.getBoundingClientRect();
        const {height: calendarHeaderHeight} = this.calendarHeader.nativeElement.getBoundingClientRect();
        const {height: calendarWorkareaSwimlaneHeight} = this.calendarColumn.first.nativeElement.getBoundingClientRect();
        const calendarScrollTop = this.calendar.nativeElement.scrollTop;
        const calendarScrollLeft = this.calendar.nativeElement.scrollLeft;

        point.y = elementY - canvasY - calendarHeaderHeight + calendarScrollTop;
        point.x = elementX - canvasX + calendarScrollLeft;

        if (this._breakpointHelper.isCurrentBreakpoint(breakpointsRange.xl)) {
            point.x -= CALENDAR_CONSTANTS.leftColumnWidth;
        } else {
            point.y -= calendarWorkareaSwimlaneHeight;
        }

        this.scrollTo(point);
        this._animateNavigatedElement(element);
    }

    private _animateNavigatedElement(element: HTMLElement): void {
        const root = this.calendar.nativeElement;
        const keyframes: Keyframe[] = [
            {opacity: CALENDAR_NAVIGATE_TO_ELEMENT_HIGHLIGHT_OPACITY, offset: 0.25},
            {opacity: '1', offset: .5},
            {opacity: CALENDAR_NAVIGATE_TO_ELEMENT_HIGHLIGHT_OPACITY, offset: 0.75},
            {opacity: '1', offset: 1.0},
        ];

        const animationOptions: KeyframeAnimationOptions = {
            duration: CALENDAR_NAVIGATE_TO_ELEMENT_ANIMATION_DURATION,
            iterations: 1,
            easing: 'ease',
        };

        this._intersectionObserverHelper.observe(element, {root, threshold: 1}).pipe(
            filter(entry => entry.isIntersecting),
            take(1),
            delay(CALENDAR_NAVIGATE_TO_ELEMENT_DEBOUNCE_TIME),
            switchMap(() => from(element.animate(keyframes, animationOptions).finished))
        ).subscribe();
    }

    private _unsetCursorStyle(): void {
        this._renderer.removeClass(document.body, CursorClassEnum.Grabbing);
        this._renderer.removeClass(document.body, CursorClassEnum.Copy);
    }

    private _setCursor(cursorX: number): void {
        this._cursorX = cursorX;
    }

    private _setCursorStyle() {
        if (this.isDraggingRecord) {
            const cursorClass = this.isCopying ? CursorClassEnum.Copy : CursorClassEnum.Grabbing;
            this._unsetCursorStyle();
            this._renderer.addClass(document.body, cursorClass);
        }
    }

    private _setDependencyLines(dependencies: CalendarDependency[]): void {
        this.calendarDependencyLines = this._dependenciesHelper?.getDependencyLines(dependencies, this._focusedElementId);
    }

    private _setDependencyOutOfScopeIndicators(dependencies: CalendarDependency[]): void {
        this.calendarDependencyOutOfScopeIndicators =
            this._dependenciesHelper?.getDependencyOutOfScopeIndicators(dependencies, this._focusedElementId);
    }
}

export interface CalendarDependencyLine {
    id: string;
    critical: boolean;
    dimmedOut: boolean;
    line?: DependencyLine;
}

export interface DependencyLine {
    linePath: string;
    arrowHeadPath?: string;
}

export interface CalendarDependencyOutOfScopeIndicator {
    id: string;
    count: number;
    critical: boolean;
    circle: CalendarDependencyOutOfScopeIndicatorCircle;
    text: CalendarDependencyOutOfScopeIndicatorText;
    line: CalendarDependencyOutOfScopeIndicatorLine;
    dimmedOut: boolean;
}

export interface CalendarDependencyOutOfScopeIndicatorCircle {
    cx: number;
    cy: number;
    r: number;
}

export interface CalendarDependencyOutOfScopeIndicatorText {
    x: number;
    y: number;
}

export interface CalendarDependencyOutOfScopeIndicatorLine {
    d: string;
}

export interface CalendarRow {
    id: string;
    name: string;
    position: number;
    records: any[];
}

export interface CalendarParsedRow {
    rowIndex: number;
    lines: CalendarRecord[][];
    id: string;
    rowsLength: number;
    isExpanded: boolean;
}

export interface CreateRecordPayload {
    start: moment.Moment;
    end: moment.Moment;
    rowId: string;
}

export interface Record extends TimeScope {
    id: string;
    duration: number;
    originalDuration: number;
    rowId: string;
    groupId: string;
    rowIndex?: number;
    truncatedStart: moment.Moment;
    truncatedEnd: moment.Moment;
}

export interface CalendarRecord {
    isCalendarRecord: boolean;
    record: Record;
    styles: any;
    classes: any;
    isDragging: boolean;
    dragRecordDisabled: boolean;
    visible: boolean;
}

export interface CalendarWeek {
    date: moment.Moment;
    daySlotsWithMilestones: boolean[];
    isExpanded: boolean;
    styles: any;
    id: string;
}

export interface CalendarNavigateToElement {
    milestoneId?: string;
    cardId?: string;
    week?: moment.Moment;
}

export interface CalendarMilestone {
    id: string;
    date: moment.Moment;
}

export type RowId = string | 'header' | 'no-row';

export type CalendarMilestones<M extends CalendarMilestone> = { [key in RowId]: M[] };

export class CalendarDependency extends RelationResource {
}

export type CalendarDependencyAnchorPointByObjectType = {
    [key in ObjectTypeEnum]?: (id: string) => Point
};

export type CalendarDependencyLineStrategyType = 'line' | 'grid';

export type CalendarDependencyAnchorPointYBaseByStrategyAndObjectType = {
    [key in CalendarDependencyLineStrategyType]?: {
        [key2 in ObjectTypeEnum]?: number
    }
};

export type CalendarDrawingStrategy = 'default' | 'group-same-line' | 'group-next-line';

export type CalendarRecordGridUnit = 'day' | 'week';
