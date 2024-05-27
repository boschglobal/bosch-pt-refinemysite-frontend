/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    CdkDrag,
    CdkDragDrop,
    CdkDragEnter,
    CdkDragStart,
    DragStartDelay,
} from '@angular/cdk/drag-drop';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    Renderer2,
    TemplateRef,
    ViewChildren,
} from '@angular/core';
import {
    groupBy,
    sum,
} from 'lodash';
import * as moment from 'moment';
import {Subscription} from 'rxjs';

import {MilestoneDragHelper} from '../../../../project/project-common/helpers/milestone-drag.helper';
import {TimeScope} from '../../../misc/api/datatypes/time-scope.datatype';
import {CursorClassEnum} from '../../../misc/enums/cursor-class.enum';
import {DIMENSIONS} from '../../constants/dimensions.constant';
import {DateParserStrategy} from '../../dates/date-parser.strategy';
import {
    CalendarMilestone,
    RowId,
} from '../calendar/calendar.component';
import {CALENDAR_CONSTANTS} from '../contants/calendar.contants';
import {CALENDAR_MILESTONE_CONSTANTS} from '../contants/calendar-milestone.constant';

export const NUMBER_OF_DAYS_PER_WEEK = 7;
export const MILESTONE_SLOT_ID_PREFIX = 'milestone-slot-';
const CALENDAR_MILESTONE_DRAG_START_DELAY_TOUCH = 100;

@Component({
    selector: 'ss-milestone-slots',
    templateUrl: './milestone-slots.component.html',
    styleUrls: ['./milestone-slots.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneSlotsComponent implements OnInit, OnDestroy {

    @ViewChildren('milestoneSlots')
    public slots: QueryList<ElementRef>;

    @Input()
    public canMoveMilestone: (milestoneId: string) => boolean = (): boolean => true;

    @Input()
    public set expandedWeeks(expandedWeeks: moment.Moment[]) {
        this._expandedWeeks = expandedWeeks;

        this._processMilestoneSlots();
    }

    @Input()
    public milestoneTemplate: TemplateRef<any>;

    @Input()
    public set milestones(milestones: CalendarMilestone[]) {
        this._milestones = milestones || [];

        this._setMilestoneSlots();
        this._processMilestoneSlots();
    }

    @Input()
    public rowId: RowId;

    @Input()
    public set scope(scope: TimeScope) {
        this._scope = scope;

        this._setMilestoneSlots();
        this._processMilestoneSlots();
    }

    @Input()
    public set weekWidth(weekWidth: number) {
        this._weekWidth = weekWidth;

        this._processMilestoneSlots();
    }

    @Output()
    public isDraggingMilestone = new EventEmitter<boolean>();

    @Output()
    public draggingDay = new EventEmitter<moment.Moment>();

    @Output()
    public draggingMilestone = new EventEmitter<ElementRef>();

    @Output()
    public moveMilestone = new EventEmitter<MoveMilestonePayload>();

    public daySlots: DaySlot[] = [];

    public dragStartDelay: DragStartDelay = {
        mouse: 0,
        touch: CALENDAR_MILESTONE_DRAG_START_DELAY_TOUCH,
    };

    public isDragging: boolean;

    public milestoneSlotIdPrefix = MILESTONE_SLOT_ID_PREFIX;

    private _disposableSubscriptions = new Subscription();

    private _expandedWeeks: moment.Moment[];

    private _milestones: CalendarMilestone[] = [];

    private _milestoneSlots: MilestoneSlot[];

    private _scope: TimeScope;

    private _weekWidth: number;

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _dateParser: DateParserStrategy,
                private _milestoneDragHelper: MilestoneDragHelper,
                private _renderer: Renderer2) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public canEnterContainer({data}: CdkDrag): boolean {
        return data.hasOwnProperty('isMilestoneSlot');
    }

    public handleDragStart(event: CdkDragStart<MilestoneSlot>): void {
        const {data: milestoneSlot, dropContainer: {element: containerElement, data: [, dayPosition]}} = event.source;
        const date = this._scope.start.clone().add(dayPosition, 'd');

        this._milestoneDragHelper.startDrag(milestoneSlot.milestone);
        this.draggingMilestone.emit(containerElement);
        this.draggingDay.emit(date);
        this._setCursorStyle();
    }

    public handleDrop(event: CdkDragDrop<DaySlotId, MilestoneSlot>): void {
        const {currentIndex, previousIndex, item: {data: milestoneSlot}, previousContainer: {element: containerElement}} = event;

        this._milestoneDragHelper.endDrag();
        this.draggingMilestone.emit(containerElement);
        this.draggingDay.emit(null);
        this._unsetCursorStyle();

        if (!this._milestoneDragHelper.isDragCanceled()) {
            this._moveMilestone(milestoneSlot.milestone, event.container.data, currentIndex, previousIndex);
        }
    }

    public handleEnterContainer(event: CdkDragEnter<DaySlotId, MilestoneSlot>): void {
        const [, dayPosition] = event.container.data;
        const date = this._scope.start.clone().add(dayPosition, 'd');

        this.draggingDay.emit(date);
    }

    public trackByIndex(index: number): number {
        return index;
    }

    public trackBySlot(index: number, slot: MilestoneSlot): string {
        return slot.milestone.id;
    }

    private _handleDragStart(): void {
        this.isDragging = true;
        this.isDraggingMilestone.emit(true);
        this._changeDetectorRef.detectChanges();
    }

    private _handleDragEnd(): void {
        this.isDragging = false;
        this.isDraggingMilestone.emit(false);
    }

    private _moveMilestone({id, date}: CalendarMilestone, [newRowId, dayIndex]: DaySlotId, currentPosition: number, previousPosition: number): void {
        const shiftedDate = this._scope.start.clone().add(dayIndex, 'd');
        const shouldMoveMilestone = !shiftedDate.isSame(date, 'd')
            || newRowId !== this.rowId
            || previousPosition !== currentPosition;

        if (shouldMoveMilestone) {
            const moveMilestonePayload: MoveMilestonePayload = {
                id,
                date: shiftedDate,
                position: currentPosition,
                rowId: newRowId,
            };

            this.moveMilestone.emit(moveMilestonePayload);
        }
    }

    private _getDayMargin(dayWidth: number): number {
        const {defaultWidth} = CALENDAR_MILESTONE_CONSTANTS;

        return dayWidth ? (dayWidth / 2) - (defaultWidth / 2) : 0;
    }

    private _getDaysWidths(): number[] {
        const collapsedSlotWidth = this._weekWidth / NUMBER_OF_DAYS_PER_WEEK;
        const expandedSlotWidth = CALENDAR_CONSTANTS.expandedWeekWidth / NUMBER_OF_DAYS_PER_WEEK;
        const size = this._scope.end.diff(this._scope.start, 'w') + 1;
        const daySpacer = DIMENSIONS.base_dimension__x025 * (NUMBER_OF_DAYS_PER_WEEK - 1) / NUMBER_OF_DAYS_PER_WEEK;

        return new Array(size)
            .fill(this._scope.start)
            .map((date, index) => date.clone().add(index * NUMBER_OF_DAYS_PER_WEEK, 'd'))
            .map(date => (this._isWeekExpanded(date) ? expandedSlotWidth : collapsedSlotWidth) - daySpacer)
            .reduce((daysWidths, width) => ([...daysWidths, ...Array(NUMBER_OF_DAYS_PER_WEEK).fill(width)]), []);
    }

    private _setMilestoneSlots(): void {
        if (!this._scope) {
            return;
        }

        const {start, end} = this._scope;

        this._milestoneSlots = this._milestones
            .filter(milestone => milestone.date.isSameOrAfter(start, 'd') && milestone.date.isSameOrBefore(end, 'd'))
            .map(milestone => ({
                isMilestoneSlot: true,
                milestone,
                dragDisabled: !this.canMoveMilestone(milestone.id),
                position: milestone.date.diff(start, 'd'),
            }));
    }

    private _getNextMilestoneSlot(currentPosition: number, rowIndex: number, slots: MilestoneSlot[][]): MilestoneSlot {
        return slots
            .map(group => group[rowIndex])
            .find(slot => slot?.position > currentPosition);
    }

    private _getWeekChanges(startDate: moment.Moment, endDate: moment.Moment): number {
        const firstWeek = this._dateParser.startOfWeek(startDate);
        const lastWeek = this._dateParser.startOfWeek(endDate);

        return lastWeek.diff(firstWeek, 'week');
    }

    private _isWeekExpanded(date: moment.Moment): boolean {
        return this._expandedWeeks.some(expandedWeek => this._dateParser.isSame(expandedWeek, date, 'w'));
    }

    private _processMilestoneSlots(): void {
        if (!this._scope || !this._expandedWeeks || !this._weekWidth) {
            return;
        }

        const daysWidths = this._getDaysWidths();
        const groupedSlots = groupBy(this._milestoneSlots, 'position');
        const groupedSlotsList = Object.values(groupedSlots);
        const {defaultWidth, minWidth} = CALENDAR_MILESTONE_CONSTANTS;

        this.daySlots = daysWidths.map((dayWidth, dayPosition) => ({
                id: [this.rowId, dayPosition],
                styles: {width: `${dayWidth}px`},
                milestoneSlots: (groupedSlots[dayPosition] || []).map((slot, rowIndex) => {
                        const endSlot: MilestoneSlot = this._getNextMilestoneSlot(dayPosition, rowIndex, groupedSlotsList);
                        const endPosition = endSlot?.position || daysWidths.length;
                        const ignoreLastPosition = endPosition === daysWidths.length ? 1 : 0;
                        const duration = endPosition - dayPosition - ignoreLastPosition;

                        const startDate = slot.milestone.date;
                        const endDate = startDate.clone().add(duration, 'd');
                        const weekChanges = this._getWeekChanges(startDate, endDate);

                        const milestoneWidth = sum(daysWidths.slice(dayPosition, endPosition));
                        const weekSpacers = weekChanges * CALENDAR_CONSTANTS.weekSpacer;
                        const leftSpace = this._getDayMargin(dayWidth);
                        const rightSpace = this._getDayMargin(daysWidths[endPosition]);

                        let maxWidth = milestoneWidth + weekSpacers + rightSpace - DIMENSIONS.base_dimension__x05;
                        maxWidth = maxWidth < minWidth ? defaultWidth : maxWidth;

                        slot.styles = {
                            maxWidth: `${maxWidth}px`,
                            paddingLeft: `${leftSpace}px`,
                        };
                        return slot;
                    }
                )
            })
        );
    }

    private _setCursorStyle() {
        if (this.isDragging) {
            const cursorClass = CursorClassEnum.Grabbing;
            this._unsetCursorStyle();
            this._renderer.addClass(document.body, cursorClass);
        }
    }

    private _unsetCursorStyle(): void {
        this._renderer.removeClass(document.body, CursorClassEnum.Grabbing);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._milestoneDragHelper.onDragStarted()
                .subscribe(() => this._handleDragStart())
        );

        this._disposableSubscriptions.add(
            this._milestoneDragHelper.onDragEnded()
                .subscribe(() => this._handleDragEnd())
        );
    }

    private _unsetSubscriptions() {
        this._disposableSubscriptions.unsubscribe();
    }
}

export type DaySlotId = [RowId, number];

export interface DaySlot {
    id: DaySlotId;
    milestoneSlots: MilestoneSlot[];
    styles: Partial<CSSStyleDeclaration>;
}

export interface MilestoneSlot {
    isMilestoneSlot: boolean;
    dragDisabled: boolean;
    milestone: CalendarMilestone;
    position: number;
    styles?: Partial<CSSStyleDeclaration>;
}

export interface MoveMilestonePayload {
    id: string;
    date: moment.Moment;
    rowId: RowId;
    position: number;
}
